import express from 'express';
import cors from "cors";
import { errorMiddleware } from '../../../packages/error-handlers/error-middleware';
import cookieParser from 'cookie-parser';



const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization","Content-Type"],
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(errorMiddleware)

// const host = process.env.HOST ?? 'localhost'; localhost
const port =  Number(process.env.PORT) ||  6004;

const server = app.listen(port,()=>{
  console.log(`Auth service is running at http://localhost:${port}/api`);
})

server.on("error",(err)=>{
  console.log("Server Error: ",err);
})
