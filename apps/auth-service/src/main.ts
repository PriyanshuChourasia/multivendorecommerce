import express, {Request,Response} from 'express';
import cors from "cors";
import { errorMiddleware } from '@packages/error-handlers/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.routes';
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json";



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
app.use(errorMiddleware);

// const host = process.env.HOST ?? 'localhost'; localhost
const port =  Number(process.env.PORT) ||  6004;

app.get("/api",(req:Request,res:Response)=>{
  res.status(200).json({
    message: "Hello API"
  });
});

// Swagger docs
app.use("/api-docs",swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.get("/docs-json",(req:Request,res:Response)=>{
  res.json(swaggerDocument);
})

// Routes
app.use("/api",router);

const server = app.listen(port,()=>{
  console.log(`Auth service is running at http://localhost:${port}/api`);
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
})

server.on("error",(err)=>{
  console.error("server_error: ",err);
})
