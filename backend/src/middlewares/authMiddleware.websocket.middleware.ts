import { IncomingMessage } from "node:http";
import { UnauthorizedException } from "../utils/app-error";
import jwt from 'jsonwebtoken'
import { Env } from "../config/env.config";
import { URL } from 'url'

const verifyWSToken = (request: IncomingMessage) => {
    const url = new URL(request.url!, `http://${request.headers.host}`)
    const token = url.searchParams.get('token')
    if (!token) throw new UnauthorizedException('Unauthorized to send or recieve messages')
        
    const decoded = jwt.verify(token, Env.JWT_SECRET) as { userId: string }
    return decoded.userId
}

export default verifyWSToken