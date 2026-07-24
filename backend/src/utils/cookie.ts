import jwt from 'jsonwebtoken'
import { Env } from '../config/env.config'
import { Response } from 'express'

type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`
type Cookie = {
    res: Response
    userId: string
}

export const setJWTAuthCookie = ({res, userId}: Cookie) => {
    const payload = { userId }
    const expiresIn = Env.JWT_EXPIRES_IN as Time
    const token = jwt.sign(payload, Env.JWT_SECRET, {
        audience: ['user'],
        expiresIn: expiresIn || '7d'
    })

    return res.cookie('usersessiontoken', token, {
        maxAge: 60 * 60 * 24 * 7 * 1000,
        httpOnly: true,
        secure: Env.NODE_RUN_TYPE === 'production' ? true : false,
        sameSite: Env.NODE_RUN_TYPE === 'production' ? 'strict' : 'lax'
    })
}

export const clearJWTAuthCookie = (res: Response) => 
    res.clearCookie('usersessiontoken', { path: '/' })