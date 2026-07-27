/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useChatRooms } from '../../hooks/useChatRooms'
import { Avatar, AvatarBadge, AvatarImage } from '../ui/avatar'
import { Skeleton } from '../ui/skeleton'

interface ChatListProps {
  onChatSelect: (id: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect }) => {
  const { chats, isLoading } = useChatRooms();

  console.log(chats)

  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-2">
            <Skeleton className="w-[52px] h-[52px] rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="text-neutral-400 py-8 text-center border border-dashed border-neutral-800 rounded-xl">
        <p className="text-sm font-medium">Start your first conversation.</p>
        <p className="text-xs text-neutral-600 mt-1">Click the plus icon above to chat.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {chats.map((chat: any) => {
        const chatId = chat._id;
        return (
          <div
            key={chatId}
            onClick={() => onChatSelect(chatId)}
            className="flex items-center gap-4 py-4 px-2 cursor-pointer hover:bg-neutral-800/40 rounded-xl transition-colors border-b border-neutral-800/50 last:border-none group"
          >
            <div className="w-[52px] h-[52px] shrink-0">
              <Avatar className="w-full h-full border border-neutral-800">
                <AvatarImage
                  src={chat?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(chat?.name || 'User')}`}
                  className="object-cover"
                  alt={chat?.name}
                />
                {chat?.isOnline && (
                  <AvatarBadge className="bg-[#56e39c] w-3 h-3 border-2 border-[#111111]" />
                )}
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-0.5">
                <h3 className="font-semibold text-white text-[16px] truncate pr-2 group-hover:text-purple-300 transition-colors">
                  {chat?.name || 'Unknown Contact'}
                </h3>
              </div>
              <p className="text-[14px] text-neutral-400 truncate leading-snug">
                {chat?.subheading || ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default ChatList