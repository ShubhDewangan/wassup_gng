import { Router } from "express";
import { authStatusController, googleAuthCallbackController, loginController, logoutController, registerController } from "../controllers/auth.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const authRoutes = Router()
    .post('/register', registerController)
    .post('/login', loginController)
    .post('/logout', logoutController)
    .post('/google-auth', googleAuthCallbackController)
    .get('/status', passportAuthenticateJwt, authStatusController)

export default authRoutes