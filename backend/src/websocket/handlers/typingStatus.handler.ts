import ChatModel from "../../models/chat.model";
import { NotFoundException } from "../../utils/app-error";
import { connectedUsers } from "../../websocket/connectionManager";

export async function typingStatusNotifyAction (chatId: string, sender: string, event: 'typing:start' | 'typing:stop') {
    const chat = await ChatModel.findById(chatId)

    if (!chat) throw new NotFoundException('Chat not found')

    chat?.participants.forEach((participant) => {
        const participantId = participant.toString()

        if (participantId === sender.toString()) return

        const participantSocket = connectedUsers.get(participantId)

        participantSocket?.send(JSON.stringify({
            event,
            chatId,
            sender
        }))
    })
}