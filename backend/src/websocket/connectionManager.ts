import { WebSocket } from "ws";

export const connectedUsers = new Map<string, WebSocket>()