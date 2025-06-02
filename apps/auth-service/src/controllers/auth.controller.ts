import {Request,Response,NextFunction} from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handlers";
import bcrypt from "bcryptjs";
import {StatusCodes} from "http-status-codes";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";

// Reggister a new user

export const userRegistration = async (req:Request,res:Response,next:NextFunction) =>{
  try{
    validateRegistrationData(req.body,"user");
    const {name,email} = req.body;

    const existingUser = await prisma.users.findUnique({where: {email} });

    if(existingUser){
      return next(new ValidationError("User already exists with this email"));
    }

    await checkOtpRestrictions(email,next);
    await trackOtpRequests(email,next);
    await sendOtp(name,email,"user-activation-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account"
    });
  }catch(error){
    return next(error);
  }
}



/** Verify User with OTP */
export const verifyUser = async(req:Request,res:Response,next:NextFunction) => {
  try{
    const {email,otp,password,name} = req.body;
    if(!email || !otp || !password || !name){
      return next(new ValidationError("All fields are required!"));
    }

    const existingUser = await prisma.users.findUnique({where: {email}});

    if(existingUser){
      return next(new ValidationError("User alredy exists with this email!"));
    }

    await verifyOtp(email,otp,next);
    const hashedPassword = await bcrypt.hash(password,10);

    await prisma.users.create({
      data: {name,email,password:hashedPassword},
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully!"
    });
  }catch(error){
    return next(error);
  }
}


/** Login users */
export const loginUser = async(req:Request,res:Response,next:NextFunction) =>{
  try{
    const {email, password} = req.body;

    if(!email || !password){
      throw new ValidationError("Email and password are required");
    }

    const user = await prisma.users.findUnique({where: {email}});

    if(!user){
      throw new AuthError("User doesn't exists!");
    }

    // verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return new AuthError("Invalid email or password");
    }

    // Generate access token and refresh token
    const accessToken = jwt.sign({id:user.id, role:"user"},process.env.JWT_ACCESS_SECRET as string,{
      expiresIn: "15m"
    });
    const refreshToken = jwt.sign({id:user.id, role:"user"},process.env.JWT_REFRESH_SECRET as string,{
      expiresIn: "7d"
    });

    // store the refresh and access token in an httpOnly secure cookie
    setCookie(res,"access_token",accessToken);
    setCookie(res,"refresh_token",refreshToken);

    res.status(StatusCodes.OK).json({
      message: "Login Successfully",
      user:{
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  }catch(error){
    return next(error);
  }
}
