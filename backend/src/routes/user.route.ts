import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { getUsersController, getSingleUserController } from "../controllers/user.controller";

const userRoutes = Router()
    .use(passportAuthenticateJwt)
    .get('/all-users', getUsersController)
    .get('/:id', getSingleUserController)

export default userRoutes