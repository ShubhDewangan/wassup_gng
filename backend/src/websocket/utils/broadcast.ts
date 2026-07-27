import { WebSocket } from "ws";
import { connectedUsers } from "../../websocket/connectionManager";

export function broadcastMessage (participants: any[], message: any, sender: string) {
    participants.forEach((participant) => {
        const participantId = participant.toString()

        if (participantId === sender.toString()) return

        const participantSocket = connectedUsers.get(participantId)

        if (participantSocket && participantSocket.readyState === WebSocket.OPEN) {
            participantSocket.send(JSON.stringify({
                event: 'message:receive',
                data: message
            }))
        }
    });
}

export function broadcastNewGroupCreation (participants: any[] | undefined, creator: any, chat: any) {
    const creatorId = creator.toString()

    participants?.forEach((participant) => {
        const participantId = participant.toString()
        if (participantId === creatorId) return 

        const socket = connectedUsers.get(participantId)
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                event: 'group:added',
                data: chat
            }))
        }
    })
}