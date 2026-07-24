import { Router } from 'express'
import authRoutes from './auth.route'
import userRoutes from './user.route'
import chatRoutes from './chat.route'
import messageRoutes from './message.route'

const router = Router()

/**
 * - Authentication
 * - Register, login, register/login with google, logout, checkStatus
 */
router.use('/auth', authRoutes)

/**
 * - User Account Routes
 * - Protected Routes
 * - get All users
 */
router.use('/user', userRoutes)

/**
 * - Chat routes
 * - Protected Routes
 * - create chat, get chats, create messages, get messages
 */
router.use('/chat', chatRoutes)

/**
 * - Message Route
 * - Protected Route
 * - send message
 */
router.use('/message', messageRoutes)

export default router