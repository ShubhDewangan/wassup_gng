import { WebSocket, WebSocketServer } from "ws";
import http, { IncomingMessage } from "node:http";
import { URL } from "url";
import jwt from "jsonwebtoken";
import { Env } from "../config/env.config";
import verifyWSToken from "../middlewares/authMiddleware.websocket.middleware";
import { connectedUsers } from "./connectionManager";
import { onlineUsersNotifyAction } from "../../src/websocket/utils/presence";
import { typingStatusNotifyAction } from "../../src/websocket/handlers/typingStatus.handler";

export function initWebSocketServer(server: http.Server) {
  const ws = new WebSocketServer({ server });

  ws.on("connection", async (socket: WebSocket, request: IncomingMessage) => {
    let userId: string;

    try {
      userId = verifyWSToken(request);
    } catch (error) {
      console.log("Auth Failed: ", (error as Error).message);
      socket.close();
      return;
    }

    console.log(`user ${userId} connected to chatty websocket!!!`);

    connectedUsers.set(userId, socket);

    const onlineUsers = await onlineUsersNotifyAction(userId);

    if (onlineUsers.length > 0) {
      socket.send(
        JSON.stringify({
          event: "presence:initial_list",
          data: onlineUsers,
        }),
      );
    }

    onlineUsers.forEach((onlineUserId: any) => {
      const onlineUserSocket = connectedUsers.get(onlineUserId);
      onlineUserSocket?.send(
        JSON.stringify({
          event: "presence:online",
          data: userId,
        }),
      );
    });

    socket.on('message', async (rawData: any) => {
        let payload: any

        try {
            payload = JSON.parse(rawData.toString())
            console.log('parsed payload', payload)
        } catch (error) {
            console.log('Invalid event format')
            return
        }

        const { event, chatId } = payload

        if (event === 'typing:start') {
            await typingStatusNotifyAction(chatId, userId, event)
        } else if (event === 'typing:stop') {
            await typingStatusNotifyAction(chatId, userId, event)
        } else {
            console.log('unknown event', event)
        }
    })

    socket.on("close", async () => {
      try {
        // console.log("Disconnect triggered for:", userId);
        const onlineUsers = await onlineUsersNotifyAction(userId);
        // console.log("Related online users found:", relatedOnline);
        connectedUsers.delete(userId);

        onlineUsers.forEach((relatedId) => {
          const onlineUserSocket = connectedUsers.get(relatedId);
        //   console.log(
        //     `Sending offline event to ${relatedId}, socket exists:`,
        //     !!onlineUserSocket,
        //   );
          onlineUserSocket?.send(
            JSON.stringify({ event: "presence:offline", data: userId }),
          );
        });
      } catch (err) {
        console.error("Error in close handler:", err);
      }
    });
  });
}
