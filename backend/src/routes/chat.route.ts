import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { createChatController, getChatController, getUserAllChatsController } from "../controllers/chat.controller";

const chatRoutes = Router()
    .use(passportAuthenticateJwt)
    .post('/create', createChatController)
    .get('/chats', getUserAllChatsController)
    .get('/:id', getChatController)

export default chatRoutes