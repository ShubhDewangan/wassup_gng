import { Router } from "express";
import { createMessageController } from "../controllers/message.controller";
import { passportAuthenticateJwt } from "../config/passport.config";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
})

const messageRoutes = Router()
    .use(passportAuthenticateJwt)
    .post('/send', upload.single('image'), createMessageController)

export default messageRoutes