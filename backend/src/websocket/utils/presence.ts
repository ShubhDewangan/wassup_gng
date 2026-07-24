import ChatModel from "../../models/chat.model";
import { connectedUsers } from "../../websocket/connectionManager";

export async function onlineUsersNotifyAction (userId: string) {
    const chats = await ChatModel.find({ participants: {
        $in: [userId]
    }})

    const relatedUserIds = new Set<string>()

    chats.forEach((chat: any) => {
        chat.participants.forEach((participant: any) => {
            const participantId = participant.toString()

            if (participantId !== userId) relatedUserIds.add(participantId) 
        })
    })

    const onlineUsers = Array.from(relatedUserIds).filter((_id: any) => connectedUsers.has(_id))

    return onlineUsers
}