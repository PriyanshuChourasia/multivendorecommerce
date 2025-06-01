

export class AppError extends Error{
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message:string,statusCode:number,isOperational:boolean = true, details?:any){
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}


// Not found error

export class NotFoundError extends AppError{
  constructor(message:string = "Resources not found") {
    super(message,404);
  }
}

//  Validation Error( use for JOI/zod/react-hook-form validation errors)
export class ValidationError extends AppError{
  constructor(message:string = "Invalid request data",details?:any){
    super(message,400,true,details)
  }
}

// Authentication error
export class AuthError extends AppError{
  constructor(message:string  = "Unauthorizes") {
    super(message,401);
  }
}


// Forbidden Error (For Insufficient Permission)
export class ForbiddenError extends AppError{
  constructor(messsage:string = "Forbidden access"){
    super(messsage,403)
  }
}


// Database Error (For MongoDB/Postgres Errors)
export class DatabaseError extends AppError{
  constructor(message:string = "Database error",details?:any) {
    super(message,500,true,details);
  }
}
