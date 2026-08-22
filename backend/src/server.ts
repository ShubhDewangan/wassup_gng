import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Env } from './config/env.config'
import { HTTP_STATUS } from './config/http.config'
import { asyncHandler } from './middlewares/asyncHandler.middleware'
import { errorHandler } from './middlewares/errorHandler.middleware'
import { connectDB } from './config/database.config'
import dns from 'node:dns/promises'
import passport from 'passport'
import './config/passport.config'
import router from './routes'
import { initWebSocketServer } from './websocket/index'
import http from 'node:http'

dns.setServers(['1.1.1.1', '8.8.8.8'])

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true}))
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
})) 
app.use(passport.initialize())

app.use('/api', router)

app.use(errorHandler)

const server = http.createServer(app)
console.log('Starting server...')

initWebSocketServer(server)
server.listen(Env.PORT, () => {
    console.log(`Server is live at port ${Env.PORT} in ${Env.NODE_RUN_TYPE}`)
    connectDB()
})