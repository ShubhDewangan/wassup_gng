/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/src/context/SocketContext";
import { apiFetch } from "@/src/lib/fetcher";
import { toast } from "sonner";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  X,
  CornerUpLeft,
} from "lucide-react";

// Shadcn UI Components
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { useAuth } from "@/src/context/AuthContext";

interface Sender {
  _id: string;
  name: string;
  avatar?: string;
}

interface ReplyToMessage {
  _id: string;
  content: string;
  sender: Sender;
}

interface Message {
  _id: string;
  chatId: string;
  content: string;
  image?: string;
  sender: Sender;
  replyTo?: ReplyToMessage | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatDetail {
  _id: string;
  groupName?: string;
  isGroup: boolean;
  participants: string[];
  createdBy?: string;
}

export default function ActiveChatPage() {
  const { chatId } = useParams() as { chatId: string };
  const { Socket } = useSocket();
  const { user } = useAuth();
  const currentUserId = user?._id;

  const [chat, setChat] = useState<ChatDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load chat & messages from backend
  useEffect(() => {
    async function loadChatAndMessages() {
      try {
        const res = await apiFetch(`/api/chat/${chatId}`);
        setChat(res.chat);
        setMessages(res.messages || []);
      } catch (error: any) {
        toast.error("Could not load chat history");
      }
    }
    if (chatId) loadChatAndMessages();
  }, [chatId]);

  // 2. Realtime WebSocket listener
  const activeChatIdRef = useRef(chatId);

// Keep ref synced with latest URL params
useEffect(() => {
  activeChatIdRef.current = chatId;
}, [chatId]);

useEffect(() => {
  if (!Socket) return;

  const handleMessage = (event: MessageEvent) => {
    try {
      const payload = JSON.parse(event.data);
      const eventName = payload.event || payload.type;

      if (eventName === "message:receive" || eventName === "newMessage") {
        const incomingMessage: Message = payload.data || payload.payload;

        // Read from ref instead of static state variable
        if (incomingMessage && String(incomingMessage.chatId) === String(activeChatIdRef.current)) {
          setMessages((prev) => {
            const exists = prev.some((msg) => String(msg._id) === String(incomingMessage._id));
            if (exists) return prev;
            return [...prev, incomingMessage];
          });
        }
      }
    } catch (err) {
      console.error("Error handling WS message:", err);
    }
  };

  Socket.addEventListener("message", handleMessage);
  return () => Socket.removeEventListener("message", handleMessage);
}, [Socket]); // Removed chatId dependency here to prevent listener teardown issues

  // 3. Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Image Selection Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 4. Send Message (Multer Upload)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedImage) return;

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("chatId", chatId);
      if (text.trim()) formData.append("content", text);
      if (selectedImage) formData.append("image", selectedImage);
      if (replyingTo) formData.append("replyTo", replyingTo._id);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/message/send`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to send message");
      }

      const resData = await res.json();

      // Safely unwrap deep nested message object: resData._message.message
      const actualMessage: Message =
        resData._message?.message ||
        resData.message?.message ||
        resData.message ||
        resData;

      // Append message object locally
      setMessages((prev) => [...prev, actualMessage]);

      // Broadcast over native WebSocket
      if (Socket && Socket.readyState === WebSocket.OPEN) {
        Socket.send(
          JSON.stringify({
            type: "sendMessage",
            data: actualMessage,
          }),
        );
      }

      // Reset Form
      setText("");
      setReplyingTo(null);
      clearImage();
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const title = chat?.isGroup ? chat.groupName || "Group Chat" : "Chat";

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-border/60 bg-background/60 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
              {title.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold leading-tight">{title}</h3>
            <span className="text-[11px] text-muted-foreground">
              {chat?.isGroup
                ? `${chat.participants?.length || 0} members`
                : "Active"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isMe = String(msg.sender?._id) === String(currentUserId);

          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              {/* Sender Name in Group Chats */}
              {!isMe && chat?.isGroup && (
                <span className="text-[11px] text-muted-foreground mb-1 ml-1 font-medium">
                  {msg.sender?.name}
                </span>
              )}

              <div
                className={`group relative max-w-[75%] rounded-2xl p-3.5 text-sm shadow-sm border ${
                  isMe
                    ? "bg-primary text-primary-foreground border-primary/20 rounded-br-none"
                    : "bg-card text-card-foreground border-border/50 rounded-bl-none"
                }`}
              >
                {/* Reply Context Header */}
                {msg.replyTo && (
                  <div
                    className={`mb-2 p-2 rounded-lg text-xs border-l-2 ${
                      isMe
                        ? "bg-black/10 border-primary-foreground/50 text-primary-foreground/90"
                        : "bg-muted border-primary text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-[11px]">
                      {msg.replyTo.sender?.name}
                    </p>
                    <p className="truncate">{msg.replyTo.content}</p>
                  </div>
                )}

                {/* Attached Image */}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="attachment"
                    className="max-h-60 rounded-xl mb-2 object-cover border border-border/30 w-full"
                  />
                )}

                {/* Message Content */}
                {msg.content && (
                  <p className="leading-relaxed break-words">{msg.content}</p>
                )}

                {/* Inline Quick Reply Button */}
                <button
                  type="button"
                  onClick={() => setReplyingTo(msg)}
                  className="absolute -top-2.5 right-2 hidden group-hover:flex items-center bg-background border border-border rounded-full p-1 shadow-sm text-muted-foreground hover:text-foreground transition"
                >
                  <CornerUpLeft className="h-3 w-3" />
                </button>
              </div>

              {/* Safe Timestamp Formatting */}
              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime())
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now"}
              </span>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Replying To Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted/80 border-t border-border/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <CornerUpLeft className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold">{replyingTo.sender?.name}:</span>
            <span className="text-muted-foreground truncate">
              {replyingTo.content}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Image Preview Thumbnail Bar */}
      {imagePreview && (
        <div className="px-5 pt-3 bg-background/80 border-t border-border/30 flex items-center gap-3">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="upload preview"
              className="h-16 w-16 object-cover rounded-xl border border-border"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-md hover:scale-110 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {selectedImage?.name}
          </span>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-border/60 bg-background/80 backdrop-blur-md flex gap-2 items-center"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-full py-5 px-5 text-sm focus-visible:ring-primary"
        />

        <Button
          type="submit"
          disabled={isSending || (!text.trim() && !selectedImage)}
          size="icon"
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform shrink-0 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
