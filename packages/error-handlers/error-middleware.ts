import { NextFunction, Request,Response } from "express"
import { AppError } from "./index";

export const errorMiddleware = (err: Error, req:Request, res: Response, next: NextFunction) =>{
  if(err instanceof AppError){
    console.error(`middleware_error ${req.method} ${req.url} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && {details: err.details}),
    });
  }

  console.error("Unhandled error: ",err);

  return res.status(500).json({
    error: "Something went wrong, please try again",
  })
}
