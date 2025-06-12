import express, {Router} from "express";
import { forgotPassword, getUser, loginUser, refreshToken, resetUserPassword, userRegistration, verifyUser, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from "../middlewares/isAuthenticated";


const router:Router = express.Router();

router.post("/user-registration",userRegistration);
router.post("/verify-user",verifyUser);
router.post("/login",loginUser);
router.post("logged-in-user",isAuthenticated,getUser);
router.post("/forgot-password-user",forgotPassword);
router.post("/reset-password-user",resetUserPassword);
router.post("/verify-forgot-password-user",verifyUserForgotPassword);
router.post("/refresh-token-user",refreshToken);


export default router;
