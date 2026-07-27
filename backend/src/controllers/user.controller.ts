import { HTTP_STATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from 'express'
import { getUsersService, getSingleUserService } from "../services/user.service";
import { userIdSchema } from "../validators/user.validator";

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

export const getSingleUserController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = userIdSchema.parse(req.params)

        const user = await getSingleUserService(id)

        return res.status(HTTP_STATUS.OK).json({
            message: 'User fetched',
            user
        })
    }
)