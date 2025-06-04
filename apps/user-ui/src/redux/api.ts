import {createApi,fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { SignUpFormData } from "../dataTypes/SignUpFormData";

export const api = createApi({
  baseQuery: fetchBaseQuery({baseUrl: process.env.NEXT_PUBLIC_SERVER_URI}),
  reducerPath: "api",
  tagTypes: ["User"],
  endpoints:(builder)=>({
    createUserRegistration: builder.query<void,SignUpFormData>({
      query:(newUser)=>({
        url:"/api/user-registration",
        method: "POST",
        body: newUser
      }) ,
    }),
  })
});



export const {
  useCreateUserRegistrationQuery
} = api;
