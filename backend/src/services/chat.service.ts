import ChatModel from "../models/chat.model"
import messageModel from "../models/message.model"
import userModel from "../models/user.model"
import { BadRequestException, NotFoundException } from "../utils/app-error"
import { broadcastNewGroupCreation } from "../websocket/utils/broadcast"

export const createChatService = async (
    userId: string,
    body: {
        participantId?: string,
        isGroup?: boolean,
        participants?: string[],
        groupName?: string
    }
) => {
    const {
        participantId,
        isGroup,
        participants,
        groupName
    } = body
    let chat
    let allParticipants

    if (isGroup && participants?.length && groupName) {
        allParticipants = [
            userId,
            ...participants
        ]

        chat = await ChatModel.create({
            participants: allParticipants,
            isGroup: true,
            groupName,
            createdBy: userId,
        })

        broadcastNewGroupCreation(chat.participants, chat.createdBy, chat)
        
    } else if (participantId) {
        const otherUser = await userModel.findById(participantId)

        if (!otherUser) throw new NotFoundException('User Not Found')

        allParticipants = [userId, participantId]
        const existingChat = await ChatModel.findOne({
            participants: {
                $all: allParticipants,
                $size: 2,
            }
        }).populate('participants', 'name avatar')

        if (existingChat) return existingChat

        chat = await ChatModel.create({
            participants: allParticipants,
            isGroup: false,
            createdBy: userId,
            groupName: groupName || otherUser.name
        })

    }


    return chat
}

export const getUserAllChatsService = async (userId: string) => {
    
    const chats = await ChatModel.find({
            participants: {
                $in: [userId],
            }
        }).populate('participants', 'name avatar').populate({
            path: 'lastMessage',
            populate: {
                path: 'sender',
                select: 'name avatar'
            }
        }).sort({ updatedAt: -1 })

    return chats
}

export const getChatService = async (id: string, userId: string) => {
    const chat = await ChatModel.findOne({
        _id: id,
        participants: {
            $in: [userId],
        }
    })

    if (!chat) throw new BadRequestException('Chat not found...')

    if (chat?.participants.length < 2) {
        chat?.populate({
            path: 'participants',
            select: 'name',
        })
    }

    const messages = await messageModel.find({ chatId: id })
        .populate('sender', 'name avatar')
        .populate({
            path: 'replyTo',
            select: 'content image sender',
            populate: {
                path: 'sender',
                select: 'name avatar'
            }
        }).sort({ createdAt: -1 })

    return {
        chat,
        messages
    }
}