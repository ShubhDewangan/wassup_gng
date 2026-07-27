/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Send, ShieldAlert, Paperclip, X, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getChatsDetails } from '../../lib/helper';
import { apiFetch } from '../../lib/fetcher';
import { getMessages } from '../../services/chat.service';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import EmptyChatState from './EmptyChatState';
import { Avatar, AvatarImage } from '../../components/ui/avatar';

interface ChatDetails {
  _id: string;
  avatar?: string;
  name?: string;
  isGroup?: boolean;
  isOnline?: boolean;
  otherUserId?: string;
  participants?: string[];
  members?: string[]
}

interface MessageType {
  _id: string;
  chatId: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  image?: string;
}

const MESSAGES_PAGE_SIZE = 20;
const SCROLL_TOP_THRESHOLD = 100;

const ActiveChatRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState<string>('');
  const [chat, setChat] = useState<ChatDetails>({ _id: '' });
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Pagination state
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottom = useRef(true);

  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // console.log(chat.members)

  // Fetch chat room metadata and the first page of messages
  useEffect(() => {
    if (!id) return;

    const loadChatAndMessages = async () => {
      setIsLoadingInitial(true);
      try {
        const details = await getChatsDetails(id, user?._id ?? '', onlineUsers);
        setChat(details);

        const { messages: firstPage, hasMore: more, nextCursor: cursor } = await getMessages(id);
        setMessages(firstPage);
        setHasMore(more);
        setNextCursor(cursor);
        shouldStickToBottom.current = true;
      } catch (err) {
        console.error('Failed to recover previous chat data:', err);
        setMessages([]);
        setHasMore(false);
        setNextCursor(null);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadChatAndMessages();
    setMessage('');
    setImageFile(null);
    setImagePreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?._id]);

  // Keep the online indicator live as presence changes, without refetching the whole chat
  useEffect(() => {
    if (!chat.otherUserId || chat.isGroup) return;
    const isOnline = onlineUsers.includes(chat.otherUserId);
    setChat((prev) =>
      prev.isOnline === isOnline ? prev : { ...prev, isOnline }
    );
  }, [onlineUsers, chat.otherUserId, chat.isGroup]);

  // Load older messages when the user scrolls near the top
  const loadOlderMessages = useCallback(async () => {
    if (!id || !hasMore || isLoadingMore || !nextCursor) return;

    const container = scrollContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;
    const prevScrollTop = container?.scrollTop ?? 0;

    setIsLoadingMore(true);
    shouldStickToBottom.current = false;

    try {
      const { messages: older, hasMore: more, nextCursor: cursor } = await getMessages(id, nextCursor, MESSAGES_PAGE_SIZE);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m._id));
        const deduped = older.filter((m) => !existingIds.has(m._id));
        return [...deduped, ...prev];
      });
      setHasMore(more);
      setNextCursor(cursor);

      // Restore scroll position so the view doesn't jump after prepending
      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
        }
      });
    } catch (err) {
      console.error('Failed to load older messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [id, hasMore, isLoadingMore, nextCursor]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.scrollTop < SCROLL_TOP_THRESHOLD) {
      loadOlderMessages();
    }
  };

  // Real-time listener for incoming WebSocket streams
  useEffect(() => {
    if (!socket || !id) return;

    const handleIncomingSocketMessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.event === 'message:receive') {
          const incomingMsg = parsed.data as MessageType;

          if (String(incomingMsg.chatId) === String(id)) {
            setMessages((prev) => {
              if (prev.some((m) => m._id === incomingMsg._id)) return prev;
              shouldStickToBottom.current = true;
              return [...prev, incomingMsg];
            });
          }
        }
      } catch (err) {
        console.error('Error processing stream message block:', err);
      }
    };

    socket.addEventListener('message', handleIncomingSocketMessage);
    return () => socket.removeEventListener('message', handleIncomingSocketMessage);
  }, [socket, id]);

  // Only auto-scroll to bottom on initial load or a genuinely new message,
  // never when we've just prepended older messages from a "load more" scroll.
  useEffect(() => {
    if (isLoadingInitial) return;
    if (shouldStickToBottom.current) {
      scrollToBottom(messages.length <= MESSAGES_PAGE_SIZE ? 'auto' : 'smooth');
      shouldStickToBottom.current = false;
    }
  }, [messages, isLoadingInitial]);

  if (!id) {
    return <EmptyChatState />;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !imageFile) || !id || !user) return;

    const content = message;
    const file = imageFile;
    const localPreviewUrl = file ? imagePreview : undefined;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageType = {
      _id: tempId,
      chatId: id,
      content,
      sender: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
      image: localPreviewUrl ?? undefined,
    };

    setMessage('');
    clearImage();
    setIsSending(true);
    shouldStickToBottom.current = true;
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const formData = new FormData();
      formData.append('chatId', id);
      if (content.trim()) formData.append('content', content);
      if (file) formData.append('image', file);

      const res = await apiFetch('/api/message/send', {
        method: 'POST',
        body: formData,
      });

      const savedMessage: MessageType = res?.message ?? res?.data ?? res;
      if (savedMessage?._id) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? savedMessage : m))
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#141414] animate-in fade-in duration-200">
      {/* Chat Room Header */}
      <header className="h-20 border-b border-neutral-900 px-6 flex items-center justify-between shrink-0 bg-[#161616]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-950 flex items-center justify-center border border-purple-800 text-purple-300 font-bold text-sm">
            <Avatar>
              <AvatarImage
                src={chat?.avatar || `https://dicebear.com{encodeURIComponent(chat?.name || 'User')}`}
                className="object-cover"
                alt={chat?.name}
              />
            </Avatar>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-white tracking-wide">{chat.name || 'Loading...'}</h2>
            {/* {chat.isGroup && chat?.} */}
          </div>
        </div>
      </header>

      {/* Messages Feed Viewport */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2 shrink-0">
            <Loader2 className="w-4 h-4 text-neutral-500 animate-spin" />
          </div>
        )}

        {!hasMore && messages.length > 0 && (
          <div className="text-center text-[11px] text-neutral-600 py-2 shrink-0">
            You&apos;ve reached the start of this conversation.
          </div>
        )}

        <div className="flex items-center gap-2 p-4 bg-neutral-900/40 border border-neutral-800/60 rounded-xl max-w-md mx-auto text-neutral-400 text-xs my-4 shrink-0">
          <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Messages are end-to-end synchronized over active channels.</span>
        </div>

        <div className="flex-1 flex flex-col gap-3 justify-end">
          {isLoadingInitial ? (
            <div className="flex justify-center items-center flex-1">
              <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?._id === user?._id;
              return (
                <div
                  key={msg._id}
                  className={`flex w-full flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      isMe
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-neutral-900 text-neutral-200 border border-neutral-800/80 rounded-tl-none'
                    }`}
                  >
                    {!isMe && chat.isGroup && (
                      <p className="text-[11px] font-bold text-purple-400 mb-1">
                        {msg.sender?.name}
                      </p>
                    )}

                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Uploaded media"
                        className="max-h-60 w-auto rounded-lg object-contain mb-1.5"
                      />
                    )}

                    <p className="leading-relaxed break-words">{msg.content}</p>

                    <span className="block text-[9px] mt-1 text-right opacity-60 tracking-tighter">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Action Footer */}
      <footer className="p-6 bg-[#161616] border-t border-neutral-900 shrink-0">
        {imagePreview && (
          <div className="relative inline-block mb-3">
            <img
              src={imagePreview}
              alt="Selected"
              className="h-20 w-20 object-cover rounded-lg border border-neutral-800"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full p-1 border border-neutral-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="relative flex-1">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-12 pl-4 pr-14 bg-neutral-900 border-neutral-800 text-white rounded-xl placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-purple-500"
            />
            <Button
              type="submit"
              size="icon"
              disabled={(!message.trim() && !imageFile) || isSending}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-800 disabled:text-neutral-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default ActiveChatRoom;