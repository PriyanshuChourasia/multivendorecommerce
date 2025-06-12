import {Request,Response,NextFunction} from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handlers";
import bcrypt from "bcryptjs";
import {StatusCodes} from "http-status-codes";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
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
    console.log(otp,"otp..");
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


/** Refresh Token */
export const refreshToken = async(req:Request,res:Response,next:NextFunction)=>{
  try{
    const refreshToken = req.cookies.refresh_token;

    if(!refreshToken){
      throw new ValidationError("Unauthorized! No refresh token.");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    )as {id:string; role:string};

    if(!decoded || !decoded.id || !decoded.role){
      return new JsonWebTokenError("Forbidden! Invalid refresh token");
    }

    const user = await prisma.users.findUnique({where: {id: decoded.id}});

    if(!user){
      return new AuthError("Forbidden! User/Seller not found");
    }

    const newAccessToken = jwt.sign(
      {id: decoded.id, role: decoded.role},
      process.env.ACCESS_TOKEN as string,
      {expiresIn: "15m"}
    );

    setCookie(res,"access_token",newAccessToken);
    return res.status(201).json({success:true});

  }catch(error){
    return next(error);
  }
}

// get logged in user
export const getUser = async(req:any,res:Response,next:NextFunction) =>{
  try{
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  }catch(error){
    next(error);
  }
}

/** Forgot Password */

export const forgotPassword = async(req:Request,res:Response,next:NextFunction) =>{
  await handleForgotPassword(req,res,next,"user");
}

/** Verify forgot password OTP */

export const verifyUserForgotPassword = async(req:Request,res:Response,next:NextFunction) =>{
  await verifyForgotPasswordOtp(req,res,next);
}

/** Reset User Password */

export const resetUserPassword = async(req:Request,res:Response,next:NextFunction)=>{
  try{
    const {email,newPassword} = req.body;

    if(!email || !newPassword){
      throw new ValidationError("Email and new Password are required!");
    }

    const user = await prisma.users.findUnique({where: {email}});
    if(!user){
      throw new ValidationError("User not found!");
    }

    // compare new password
    const isPasswordMatch = await bcrypt.compare(newPassword,user.password);
    if(isPasswordMatch){
      throw new ValidationError("New Password cannot be the same as the old password!");
    }

    // hash the new Password
    const hashedPassword = await bcrypt.hash(newPassword,10);

    await prisma.users.update({
      where: {email},
      data: {
        password: hashedPassword
      }
    });

    res.status(StatusCodes.OK).json({
      message: "Password reset successfully"
    })
  }catch(error){

  }
}

export const verifyForgotPasswordOtp = async(req:Request,res:Response,next:NextFunction) =>{
  try{
    const {email,otp} = req.body;

    if(!email || !otp){
      throw new ValidationError("Email and OTP are required!");
    }

    await verifyOtp(email,otp,next);

    res.status(StatusCodes.OK).json({
      message:"OTP verified. You can now reset your password."
    })
  }catch(error){
    next(error);
  }
}
