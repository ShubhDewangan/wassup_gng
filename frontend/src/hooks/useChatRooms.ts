/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { getChats } from "../services/chat.service";
import { getChatsDetails } from "../lib/helper";
import { useAuth } from "../context/AuthContext";

export const useChatRooms = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [rawChats, setRawChats] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        setIsError(false);
        const data = await getChats();
        // console.log("Raw chats from API:", data); 
        setRawChats(data);
      } catch (error) {
        console.log("getChats failed:", error);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, []);

  useEffect(() => {
    if (!rawChats.length) return;
    const processAll = async () => {
      try {
        const processed = await Promise.all(
          rawChats.map((chat) =>
            getChatsDetails(String(chat._id), user?._id ?? "", onlineUsers),
          ),
        );
        setChats(processed);
      } catch (error) {
        console.log("Something failed:", error);
      }
    };
    processAll();
  }, [rawChats, user?._id, onlineUsers]);

  useEffect(() => {
    if (!socket) return;

    const handleWebSocketEvent = (messageEvent: MessageEvent) => {
      try {
        const parsed = JSON.parse(messageEvent.data);
        
        // 1. Existing group creation event
        if (parsed.event === "group:added") {
          setRawChats((prev: any) => {
            if (prev.some((chat: any) => chat._id === parsed.data._id))
              return prev;
            return [parsed.data, ...prev];
          });
        }

        // 2. NEW: Real-time message receive event
        if (parsed.event === "message:receive") {
          const newMessage = parsed.data; // Includes chatId, content, sender, etc.

          setRawChats((prevChats: any[]) => {
            // Find if the target chat already exists in our sidebar list
            const targetChatIndex = prevChats.findIndex(
              (chat) => String(chat._id) === String(newMessage.chatId)
            );

            if (targetChatIndex === -1) {
              // If the room isn't in your sidebar list yet, let it be handled by a group/room addition event or ignore it
              return prevChats;
            }

            // Extract the target chat object and deep copy the array
            const updatedChats = [...prevChats];
            const targetChat = { ...updatedChats[targetChatIndex] };

            // OPTIONAL: Update your raw data's structural details if you display them (e.g. latestMessage tracking)
            targetChat.latestMessage = newMessage; 

            // Remove the chat from its current position
            updatedChats.splice(targetChatIndex, 1);

            // Push the chat room to the absolute top of the array
            return [targetChat, ...updatedChats];
          });
        }
        
      } catch (error) {
        console.log("WebSocket event error:", error);
      }
    };

    socket.addEventListener("message", handleWebSocketEvent);
    return () => socket.removeEventListener("message", handleWebSocketEvent);
  }, [socket]);

  const addChatToTop = (chat: any) => {
    setRawChats((prev) => {
      if (prev.some((c) => String(c._id) === String(chat._id))) return prev;
      return [chat, ...prev];
    });
  };

  return { rawChats, chats, isLoading, isError, addChatToTop };
};
