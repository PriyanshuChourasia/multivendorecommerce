import express from 'express';
import cors from "cors";



const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization","Content-Type"],
    credentials: true
  })
);

// const host = process.env.HOST ?? 'localhost'; localhost
const port =  Number(process.env.PORT) ||  6004;

const server = app.listen(port,()=>{
  console.log(`Auth service is running at http://localhost:${port}/api`);
})

server.on("error",(err)=>{
  console.log("Server Error: ",err);
})
