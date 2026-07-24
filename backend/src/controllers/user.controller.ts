import { HTTP_STATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from 'express'
import { getUsersService } from "../services/user.service";

export const getUsersController = asyncHandler(
    async(req: Request, res: Response) => {
        const userId = req.user?._id as any

        const users = await getUsersService(userId)

        return res.status(HTTP_STATUS.OK).json({
            message: 'All Users fetched!',
            users
        })
    }
)