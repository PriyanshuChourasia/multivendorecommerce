"use client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import {useForm} from "react-hook-form";
import toast from "react-hot-toast";

type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {

  const [serverError, setServerError] = useState<string | null>(null);
  const [step,setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp,setOtp] = useState<string[]>(["","","",""]);
  const [userEmail,setUserEmail] = useState<string | null>(null);
  const [canResend,setCanResend] = useState<boolean>(true);
  const [timer,setTimer] = useState<number>(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormData>();

    const startResendTimer = () =>{
    const interval = setInterval(()=>{
      setTimer((prev)=>{
        if(prev <= 1){
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    },1000);
  }

  const requestOtpMutation = useMutation({
    mutationFn: async ({email}:{email:string})=>{
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`,{email});
      return response.data;
    },
    onSuccess:(_,{email}) => {
      setUserEmail(email);
      setStep("otp");
      setServerError(null);
      setCanResend(false);
      startResendTimer();
    },
    onError:(error:AxiosError)=>{
      const errorMessage = (error.response?.data as {message?: string})?.message || "Invalid OTP. Try again!";
      setServerError(errorMessage);
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn:async() => {
      if(!userEmail) return;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`,
        {email:userEmail,otp: otp.join("")}
      );
      return response.data;
    },
    onSuccess:() => {
      setStep("reset");
      setServerError(null);
    },
    onError:(error:AxiosError)=>{
      const errorMessage = (error.response?.data as {message?:string})?.message;
      setServerError(errorMessage || "Invalid OTP, Try again.");
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async({password}:{password:string})=>{
      if(!password) return;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`,
        {email:userEmail,newPassword: password}
      );
      return response.data;
    },
    onSuccess:()=>{
      setStep("email");
      toast.success("Password reset successfully! Please login with your new password.");
      setServerError(null);
      router.push("/login");
    },
    onError:(error:AxiosError)=>{
      const errorMessage = (error.response?.data as {message?:string})?.message;
      setServerError(errorMessage || "Failed to reset password. Try again!");
    }
  })

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

  const onSubmitEmail = ({email}:{email:string})=>{
    console.log(email,"email...")
    requestOtpMutation.mutate({email});
  }

  const onSubmitPassword = ({password}:{password:string})=>{
    resetPasswordMutation.mutate({password:password});
  }


  return(
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-semibold text-center text-black font-Poppins">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot Password
      </p>

      <div className="flex justify-center w-full">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          {step == "email" && (
            <>
              <h3 className="mb-2 text-3xl font-semibold text-center text-black">
                Forgot Password
              </h3>
              <p className="mb-4 text-center text-gray-500">
                Go back to?{" "}
                <Link href={"/login"} className="text-blue-500">
                  Login
                </Link>
              </p>

              <form onSubmit={handleSubmit(onSubmitEmail)}>
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

                    <button disabled={requestOtpMutation.isPending} type="submit" className="w-full py-2 mt-4 text-lg text-white bg-black rounded-lg cursor-pointer">
                      {requestOtpMutation.isPending ? "Sending OTP...." : "Submit"}
                    </button>

                    {
                      serverError && (
                        <p className="mt-2 text-sm text-red-500">{serverError}</p>
                      )
                    }
              </form>
            </>
          )}

          {
            step == "otp" && (
              <>
                <h3 className="mb-4 text-xl font-semibold text-center">
                  Enter OTP
                </h3>
                <div className="flex justify-center gap-6">
                  {
                    otp.map((digit,index)=>(
                      <input
                        key={index}
                        ref={(el)=>{
                          if(el) inputRefs.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        className="w-12 h-12 text-center border border-gray-300 outline-none"
                        value={digit}
                        onChange={(e) => handleOtpChange(index,e.target.value)}
                        onKeyDown={(e)=> handleOtpKeyDown(index,e)}
                      />
                    ))
                  }
                </div>
                <button
                  onClick={()=> verifyOtpMutation.mutate()}
                  className="w-full py-2 mt-4 text-lg text-white bg-black rounded-sm cursor-pointer"
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                </button>

                {
                  canResend ? (
                    <button
                      onClick={() => requestOtpMutation.mutate({email: userEmail!})}
                      className="mt-4 text-center text-blue-500 cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  ):
                  (
                    <p className="mt-4 text-sm text-center">
                      Resend OTP in {timer}s
                    </p>
                  )
                }
                {
                  serverError && (
                    <p className="mt-2 text-sm text-red-500">{serverError}</p>
                  )
                }
              </>
            )
          }

          {step == "reset" && (
            <>
              <h3 className="mb-4 text-xl font-semibold text-center">
                Reset Password
              </h3>
              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <label htmlFor="password_id" className="block mb-1 text-gray-700">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full p-2 mb-2 border border-gray-300 rounded outline-0"
                  {...register("password",{
                    required:"Password is required",
                    minLength:{
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
                {
                  errors.password && (
                    <p className="text-sm text-red-500">
                      {String(errors.password.message)}
                    </p>
                  )
                }

                <button
                  type="submit"
                  className="w-full mt-4 text-lg text-white bg-black cursor-pointer"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                </button>

                {
                  serverError && (
                    <p className="mt-2 text-sm text-red-500">{serverError}</p>
                  )
                }
              </form>

            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword;
