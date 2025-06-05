import crypto from "crypto";
import { ValidationError } from "@packages/error-handlers";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";
import { NextFunction, Request, Response } from "express";
import prisma from "@packages/libs/prisma";
import { StatusCodes } from "http-status-codes";


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export const validateRegistrationData = (data:any, userType:"user" | "seller") => {
  const {name,email,password,phone_number,country} = data;
  if(
    !name || !email || !password || (userType === "seller" && (!phone_number || !country))
  ){
    throw new ValidationError(`Missing required fields`);
  }

  if(!emailRegex.test(email)){
    throw new ValidationError("Invalid email format");
  }
}


export const checkOtpRestrictions = async(email:string,next:NextFunction) => {
  if(await redis.get(`otp_lock:${email}`)){
    return next(new ValidationError("Account locked due to multiple failed attempts! Try again after 30 minutes"));
  }

  if(await redis.get(`opt_spam_lock:${email}`)){
    return next(new ValidationError("Too many OTP requests! Please wait 1hour before requesting again"));
  }

  if(await redis.get(`otp_cooldown:${email}`)){
    return next(new ValidationError("Please wait 1min before requesting a new otp again"));
  }
}

export const trackOtpRequests = async(email:string,next:NextFunction) =>{
  const otpRequestKey = `otp_request_count${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "o");
  if(otpRequests >= 2){
    await redis.set(`otp_spam_lock:${email}`,"locked","EX",3600); // Lock for 1 hour
    return next(new ValidationError("Too many OTP requests. Please wait 1 hour before requesting again."));
  }

  await redis.set(otpRequestKey,otpRequests+1,"EX",3600); // Tracking Request for one hour
}

export const sendOtp = async (name:string,email:string,template:string) => {
  const otp = crypto.randomInt(1000,9999).toString();
  await sendEmail(email,"Verify Your Email",template,{name,otp});
  await redis.set(`otp:${email}`,otp,"EX",300);
  await redis.set(`otp_cooldown:${email}`,"true","EX",60);
}



export const verifyOtp = async(email:string,otp:string,next:NextFunction) =>{
  const storedOtp = await redis.get(`otp:${email}`);
  if(!storedOtp){
    throw new ValidationError("Invalid or expired OTP!");
  }

  const failedAttemptKey = `otp_attempts:${email}`;
  const failedAttemps = parseInt((await redis.get(failedAttemptKey)) || "o");
  console.log(failedAttemps,"failed attempts");

  if(storedOtp !== otp){
    if(failedAttemps >= 2){
      console.log(failedAttemps,"failed attempts");
      await redis.set(`otp_lock:${email}`,"locked","EX",1800); // Lock for 30 minutes
      await redis.del(`otp:${email}`,failedAttemptKey);
      throw  new ValidationError("Too many failed attempts. Your account is locked for 30 minutes")
    }
    await redis.set(failedAttemptKey,failedAttemps+1,"EX",300);
    throw  new ValidationError(`Incorrect OTP. ${2 - failedAttemps} attempts left`)
  }

  await redis.del(`otp:${email}`,failedAttemptKey);
}


export const handleForgotPassword = async(req:Request,res:Response,next:NextFunction,userType: "user" | "seller") => {
  try{
    const {email} = req.body;

    if(!email){
      throw new ValidationError("Email is required");
    }

    const user = userType === "user" && await prisma.users.findUnique({where: {email}});

    if(!user){
      throw new ValidationError(`${userType} not found`);
    }

    // Check otp restrictions
    await checkOtpRestrictions(email,next);
    await trackOtpRequests(email,next);

    // Generate OTP and send Email
    await sendOtp(email,user.name,"forgot-password-user-mail");

    res.status(StatusCodes.OK).json({
      message: "OTP sent to email. Please verify your account."
    })

  }catch(error){
    return next(error);
  }
}
