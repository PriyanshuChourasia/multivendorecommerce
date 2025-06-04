"use client";
import { SignUpFormData } from "apps/user-ui/src/dataTypes/SignUpFormData";
import GoogleButton from "apps/user-ui/src/shared/components";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { use, useRef, useState } from "react";
import { useForm } from "react-hook-form";



const SignUp = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showOtp,setShowOtp] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(true);
  const [timer,setTimer] = useState<number>(60);
  const [otp,setOtp] = useState<string[]>(["","","",""]);
  const [userData,setUserData] = useState<SignUpFormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>();



  const onSubmit = (data: SignUpFormData) => {
    console.log(data);
  };

  const handleOtpChange = (index:number,value:string) =>{
    if(!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if(value && index < inputRefs.current.length - 1){
      inputRefs.current[index + 1]?.focus();
    }
  }

  const handleOtpKeyDown = (index:number,e:React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key === "Backspace" && !otp[index] && index > 0){
      inputRefs.current[index - 1]?.focus();
    }
  }

  const resendOtp = () => {

  }

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-semibold text-center text-black font-Poppins">
        SignUp
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . SignUp
      </p>

      <div className="flex justify-center w-full">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="mb-2 text-3xl font-semibold text-center text-black">
            Signup to Ecom
          </h3>
          <p className="mb-2 text-center text-gray-500">
            Already have an account?
            <Link href={"/login"} className="text-blue-500">
              Login
            </Link>
          </p>

          <GoogleButton />
          <div className="flex items-center my-4 text-sm text-gray-400">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          {
            !showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <label htmlFor="name_id" className="block mb-1 text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name_id"
              placeholder="Name"
              className="w-full p-2 mb-1 border border-gray-300 rounded-sm outline-0"
              {...register("name", {
                required: "Name is required",
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">
                {String(errors.name.message)}
              </p>
            )}
            {/* Email */}
            <label htmlFor="email_id" className="block mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email_id"
              placeholder="supportwishalpha@gmail.com"
              className="w-full p-2 mb-1 border border-gray-300 rounded-sm outline-0"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">
                {String(errors.email.message)}
              </p>
            )}

            <label htmlFor="password_id" className="block mb-1 text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={`${passwordVisible ? "text" : "password"}`}
                id="password_id"
                placeholder="Min. 6 characters"
                className="w-full p-2 mb-1 border border-gray-300 rounded-sm outline-0"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 flex items-center text-gray-400 right-3"
              >
                {passwordVisible ? <Eye /> : <EyeOff />}
              </button>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {String(errors.password.message)}
                </p>
              )}
            </div>
            {/* <div className="flex items-center justify-between my-4">
              <label htmlFor="" className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember me
              </label>
              <Link href={"/forgot-password"} className="text-sm text-blue-500">
                Forgot Password?
              </Link>
            </div> */}

            <button
              type="submit"
              className="w-full py-2 mt-6 text-lg text-white bg-black rounded-lg cursor-pointer"
            >
              Sign Up
            </button>

            {serverError && (
              <p className="mt-2 text-sm text-red-500">{serverError}</p>
            )}
          </form>
            )
            :
            (
              <div>
                <h3 className="mb-4 text-xl font-semibold text-center">
                  Enter OTP
                </h3>
                <div className="flex justify-center gap-6">
                  {
                    otp?.map((digit,index)=>(
                      <input
                        key={index}
                        type="text"
                        ref={(el)=>{
                          if(el){
                            inputRefs.current[index] = el;
                          }
                        }}
                        maxLength={1}
                        className="w-12 h-12 text-center border border-gray-300 rounded-sm outline-none"
                        value={digit}
                        onChange={(e)=> handleOtpChange(index,e.target.value)}
                        onKeyDown={(e)=> handleOtpKeyDown(index,e)}
                      />
                    ))
                  }
                </div>
                <button className="w-full py-2 mt-4 text-lg text-white bg-blue-500 rounded-lg cursor-pointer">
                  Verify OTP
                </button>
                <p className="mt-4 text-sm text-center">
                  {
                    canResend ? (
                      <button
                      onClick={resendOtp}
                      className="text-blue-500 cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )
                    :
                    (
                      `Resend OTP in ${timer}s`
                    )
                  }
                </p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default SignUp;
