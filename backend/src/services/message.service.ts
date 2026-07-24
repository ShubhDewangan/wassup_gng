import { populate } from "dotenv"
import { HTTP_STATUS } from "../config/http.config"
import ChatModel from "../models/chat.model"
import messageModel from "../models/message.model"
import { BadRequestException } from "../utils/app-error"
import { uploadImage } from "../config/imagekit.config"
import { broadcastMessage } from "../websocket/utils/broadcast"

export const createMessageService = async (userId: string, body: {
    chatId: string,
    content?: string,
    image?: string,
    replyTo?: string
}, imageBuffer?: Buffer) => {
    const { chatId, content, image, replyTo } = body

    const chat = await ChatModel.findOne({
        _id: chatId,
        participants: {
            $in: [userId],
        }
    })

    if (!chat) throw new BadRequestException('Cannot find chat you are trying to send message to!')

    if (replyTo) {
        const replyMessage = await messageModel.findOne({
            _id: replyTo,
            chatId
        })

        if (!replyMessage) throw new BadRequestException('Message you want to reply does not exist')
    }

    let imageUrl = body.image
    if (imageBuffer) {
        imageUrl = await uploadImage(imageBuffer, chatId)
    }


    const message = await messageModel.create({
        chatId,
        replyTo,
        content,
        sender: userId,
        image: imageUrl
    })

    await message.populate([
        { path: 'sender', select: 'name avatar' },
        { path: 'replyTo', select: 'content image sender', populate: {
            path: 'sender',
            populate: 'name avatar'
        }}
    ])

    //websocket
    broadcastMessage(chat.participants, message, userId)

    return { message, chatId }

}