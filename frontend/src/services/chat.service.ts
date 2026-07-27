/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../lib/fetcher"

export const getChats = async () => {
    const res = await apiFetch('/api/chat/chats')
    // console.log('Full API response:', res)
    return res.chats
}

export const getMessages = async (chatId: string, cursor?: string, limit = 20) => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (cursor) params.set('cursor', cursor)
    const res = await apiFetch(`/api/chat/${chatId}/messages?${params.toString()}`)
    return res as { messages: any[]; hasMore: boolean; nextCursor: string | null }
}