import { Request, Response } from 'express'
import { asyncHandler } from '../middlewares/asyncHandler.middleware'
import { googleAccessTokenSchema, googleAuthSchema, loginSchema, registerSchema } from '../validators/auth.validator'
import { findOrCreateUserService, loginService, registerService } from '../services/auth.service'
import { clearJWTAuthCookie, setJWTAuthCookie } from '../utils/cookie'
import { HTTP_STATUS } from '../config/http.config'
import { Env } from '../config/env.config'
import jwt from 'jsonwebtoken'
import { UserDocument } from '../models/user.model'

export const registerController = asyncHandler(
    async (req: Request, res: Response) => {
        const body = registerSchema.parse(req.body)
        const user = await registerService(body)

        const userId = user._id.toString() as string

        return setJWTAuthCookie({
            res,
            userId,
        }).status(HTTP_STATUS.CREATED).json({
            message: 'User created with active session!',
            user,
        })
    }
)

export const loginController = asyncHandler(
    async (req: Request, res: Response) => {
        const body = loginSchema.parse(req.body)
        const user = await loginService(body)

        const userId = user._id.toString() as string

        return setJWTAuthCookie({
            res,
            userId
        }).status(HTTP_STATUS.OK).json({
            message: 'User session active hence logged in!',
            user
        })
    }
)

export const logoutController = asyncHandler(
    async (req: Request, res: Response) => {
        return clearJWTAuthCookie(res).status(HTTP_STATUS.OK).json({
            message: 'User logged out successfully',
        })
   }
)

export const authStatusController = asyncHandler(
    async (req: Request, res: Response) => {
        const user = req.user
        const token = req.cookies.usersessiontoken
        return res.status(HTTP_STATUS.OK).json({
            message: 'Authenticated User',
            user,
            token
        })
    } 
)

export const googleAuthCallbackController = asyncHandler(
    async (req: Request, res: Response) => {
        const { accessToken } = googleAccessTokenSchema.parse(req.body)

        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })

        if (!googleResponse.ok) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid Google token' })
        }

        const googleData = await googleResponse.json()

        // Ab googleAuthSchema wala shape banao aur validate karo
        const body = googleAuthSchema.parse({
            email: googleData.email,
            googleId: googleData.sub,
            name: googleData.name,
            avatar: googleData.picture,
        })

        const user = await findOrCreateUserService(body)

        if (!user) {
            return res.redirect('http://localhost:5173/login?error=auth_failed')
        }

        const userId = user._id.toString()

        return setJWTAuthCookie({
            res,
            userId
        }).status(HTTP_STATUS.OK).json({
            message: 'Authenticated!',
            user
        })
    }
)