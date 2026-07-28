/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from "react"
import { apiFetch } from "./fetcher"

export const isUserOnline = (userId: string, onlineUsers: string[] = []) => {
    if (!userId) return false
    return onlineUsers.includes(userId)
}

export const getOtherUser = async (userId: string) => {
    if (!userId) return null
    try {
        const res = await apiFetch(`/api/user/${userId}`)
        return res?.user ?? res ?? null
    } catch (error) {
        console.log('getOtherUser failed:', error)
        return null
    }
}

export const getChatsDetails = async (chatId: string, userId: string, onlineUsers: string[] = []) => {
    const res = await apiFetch(`/api/chat/${chatId}`)
    const chat = res?.chat
    // const [members, setMembers] = useState<string[]>([])

    if (!chat) {
        return {
            _id: chatId,
            name: 'Unknown chat',
            subheading: '',
            avatar: '',
            isGroup: false,
        }
    }

    const isGroup = chat?.isGroup

    if (isGroup) {
        // chat.participants.map(async (participant: string) => {
        //     const res = await getOtherUser(participant)
        //     setMembers((prev) => [...prev, res.name])
        // })
        return {
            _id: chat._id,
            name: chat.groupName || chat.chatName || 'Unnamed group',
            subheading: `${chat.participants.length} members`,
            members: chat.participants.map((user: any) => user.name).join(', '),
            avatar: '',
            isGroup,
            createdBy: chat.createdBy.name,
            lastMessage: chat.lastMessage,
        }
    }

    const otherId = chat?.participants.find((p: any) =>
        (typeof p === 'string' ? p : p?._id) !== userId
    )
    const otherIdStr = typeof otherId === 'string' ? otherId : otherId?._id
    const other = await getOtherUser(otherIdStr)
    const isOnline = isUserOnline(other?._id ?? '', onlineUsers)

    return {
        _id: chat._id,
        name: other?.name || 'Anonymous',
        subheading: isOnline ? 'Online' : '',
        avatar: other?.avatar || '',
        isGroup: false,
        isOnline,
        lastMessage: chat.lastMessage,
    }
}