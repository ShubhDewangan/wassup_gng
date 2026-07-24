import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { createMessageSchema } from "../validators/message.validator";
import { createMessageService } from "../services/message.service";
import { HTTP_STATUS } from "../config/http.config";

export const createMessageController = asyncHandler(
    async (req: Request & { file?: Express.Multer.File }, res: Response) => {
        const userId = req.user?._id
        const imageBuffer = req.file ? req.file.buffer : undefined
        const body = createMessageSchema.parse({...req.body})


        const message = await createMessageService(userId, body, imageBuffer)

        res.status(HTTP_STATUS.CREATED).json({
            message: 'message sent successfully',
            _message: message
        })
    }
)