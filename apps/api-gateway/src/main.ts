import express,{Response,Request} from 'express';
import * as path from 'path';
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import axios from "axios";
import cookieParser from "cookie-parser";
import rateLimit from 'express-rate-limit';


const app = express();

app.use(
  cors({
    origin:['http://localhost:3000'],
    allowedHeaders: ['Authorization','Content-Type'],
    credentials: true
  })
);

app.use(morgan("dev"));
app.use(express.json({limit:"100mb"}));
app.use(express.urlencoded({limit: "100", extended:true}));
app.use(cookieParser());
app.set("trust proxy",1);

// Apply rate limiting

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req:any) => (req.user ? 1000 : 100),
  message: {error: "Too many requests, please try again later!"},
  standardHeaders: true,
  keyGenerator: (req:any) => req.ip
});


app.use(limiter);

app.use('/assets', express.static(path.join(__dirname, 'assets')));


app.get("gateway-health",(req: Request,res:Response)=>{
  res.send({message:"Welcome to api of ecommerce"})
});

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use("/",proxy("http://localhost:6004"));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('server_error', console.error);
