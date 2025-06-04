"use client";
import GoogleButton from "apps/user-ui/src/shared/components";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {useForm} from "react-hook-form";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  // const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormData>();

  const onSubmit = (data:FormData) => {};

  return(
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-semibold text-center text-black font-Poppins">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Login
      </p>

      <div className="flex justify-center w-full">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="mb-2 text-3xl font-semibold text-center text-black">
            Login to Ecom
          </h3>
          <p className="mb-4 text-center text-gray-500">
            Don't have an account?
            <Link href={"/signup"} className="text-blue-500">
              Sign up
            </Link>
          </p>

          <GoogleButton/>
          <div className="flex items-center my-5 text-sm text-gray-400">
            <div className="flex-1 border-t border-gray-300" />
              <span className="px-3">or Sign in with Email</span>
              <div className="flex-1 border-t border-gray-300" />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="email_id" className="block mb-1 text-gray-700">Email</label>
            <input type="email" id="emaik_id" placeholder="supportwishalpha@gmail.com"
              className="w-full p-2 mb-1 border border-gray-300 rounded-sm outline-0"
              {...register("email",{
                required:"Email is required",
                pattern:{
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address"
                }
              })} />
              {errors.email &&(
                <p className="text-sm text-red-500">
                  {String(errors.email.message)}
                </p>
              )}

              <label htmlFor="password_id" className="block mb-1 text-gray-700">Password</label>
              <div className="relative">
                <input type={`${passwordVisible ? "text" : "password"}`} id="password_id" placeholder="Min. 6 characters"
                className="w-full p-2 mb-1 border border-gray-300 rounded-sm outline-0"
                {...register("password",{
                  required:"Password is required",
                  minLength:{
                    value: 6,
                    message:"Password must be at least 6 characters"
                  }
                })} />
                <button type="button"
                onClick={()=> setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 flex items-center text-gray-400 right-3">
                  {passwordVisible ?  <Eye/> : <EyeOff/>}
                </button>
                {errors.password &&(
                <p className="text-sm text-red-500">
                  {String(errors.password.message)}
                </p>
                )}
              </div>
               <div className="flex items-center justify-between my-4">
                  <label htmlFor="" className="flex items-center text-gray-600">
                    <input type="checkbox"
                      className="mr-2"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)} />
                      Remember me
                  </label>
                  <Link href={"/forgot-password"} className="text-sm text-blue-500">
                    Forgot Password?
                  </Link>
                </div>

                <button type="submit" className="w-full py-2 text-lg text-white bg-black rounded-lg cursor-pointer">
                  Login
                </button>

                {
                  serverError && (
                    <p className="mt-2 text-sm text-red-500">{serverError}</p>
                  )
                }
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login;
