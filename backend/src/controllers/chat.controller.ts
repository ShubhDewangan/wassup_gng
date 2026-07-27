import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { chatIdSchema, createChatSchema } from "../validators/chat.validator";
import { createChatService, getUserAllChatsService, getChatService, getMessagesService } from "../services/chat.service";
import { HTTP_STATUS } from "../config/http.config";

export const createChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = createChatSchema.parse(req.body);

    const chat = await createChatService(userId, body);

    return res.status(HTTP_STATUS.OK).json({
        message: 'Chat created or fetched successfully',
        chat
    })
  },
);


export const getUserAllChatsController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id
        try {
            const chats = await getUserAllChatsService(userId)

            // console.log(chats)
            if (chats) return res.status(HTTP_STATUS.OK).json({
                message: 'User chats fetched successfully',
                chats: chats
            })
        } catch (error) {
            // console.log(error)
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                message: 'Something went wrong'
            })
        }
    }
)

export const getChatController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id
        const { id } = chatIdSchema.parse(req.params)
        const { chat } = await getChatService(id, userId)

        return res.status(HTTP_STATUS.OK).json({
            message: 'User chats fetched successfully',
            chat
        })
    }
)

export const getChatMessagesController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id
        const { id } = chatIdSchema.parse(req.params)
        const cursor = req.query.cursor as string | undefined
        const limit = Math.min(Number(req.query.limit) || 20, 50)

        const { messages, hasMore, nextCursor } = await getMessagesService(id, userId, cursor, limit)

        return res.status(HTTP_STATUS.OK).json({
            message: 'Messages fetched successfully',
            messages,
            hasMore,
            nextCursor,
        })
    }
)