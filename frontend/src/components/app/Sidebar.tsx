/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, Plus, Users, MessageSquare, Loader2 } from 'lucide-react'
import OnlineUsersTab from './OnlineUsersTab'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import '../../App.css'
import { apiFetch } from '../../lib/fetcher'
import { useChatRooms } from '../../hooks/useChatRooms'
import { useSocket } from '../../context/SocketContext'
// import { useAuth } from '../../context/AuthContext'

interface Contact {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface SidebarProps {
  contacts: Contact[];
}

const Sidebar: React.FC<SidebarProps> = ({ contacts = [] }) => {
  // const { user } = useAuth()
  const navigate = useNavigate();
  const { id: activeChatId } = useParams<{ id: string }>();
  const { chats, isLoading, isError, addChatToTop } = useChatRooms();
  const { onlineUsers } = useSocket();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleParticipant = (id: string) => {
    if (isGroup) {
      setSelectedParticipants(prev =>
        prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
      );
    } else {
      setSelectedParticipants([id]);
    }
  };

  const handleCreateChat = async (e: React.FormEvent) => {
  e.preventDefault();
  if (selectedParticipants.length === 0) return;
  if (isGroup && !groupName.trim()) return;

  setIsSubmitting(true);
  try {
    const otherUser = contacts.find((c) => c._id === selectedParticipants[0]);
    const resolvedGroupName = isGroup ? groupName : (otherUser?.name || 'Direct Chat');

    const payload = {
      participantId: selectedParticipants[0],
      participants: selectedParticipants,
      isGroup,
      groupName: resolvedGroupName
    };

    const data = await apiFetch('/api/chat/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const createdChat = data?.chat ?? data;

    if (createdChat?._id) {
      addChatToTop(createdChat);
      setIsModalOpen(false);
      resetForm();
      navigate(`/chat/${createdChat._id}`);
    }
  } catch (error) {
    console.error('Failed to create chat:', error);
  } finally {
    setIsSubmitting(false);
  }
};

  const resetForm = () => {
    setIsGroup(false);
    setGroupName('');
    setSelectedParticipants([]);
  };

  return (
    <aside className="w-1/4 min-w-[320px] h-screen bg-[#111111] flex flex-col font-sans relative border-r border-neutral-800">

      {/* Upper Gradient Card Header */}
      <div className="bg-gradient-to-br from-[#a5e6da] via-[#b6c7f8] to-[#d3b4ed] p-6 pb-8 rounded-b-[40px] shadow-lg shrink-0">

        <div className="flex items-center gap-2 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
            <Input
              type="text"
              placeholder="Search..."
              className="h-12 pl-11 pr-4 bg-white/20 border-none rounded-full placeholder:text-neutral-700 text-neutral-900 focus-visible:ring-1 focus-visible:ring-purple-400/50"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-3 bg-white/30 hover:bg-white/50 text-neutral-800 rounded-full transition shadow-sm shrink-0"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-[40px] leading-[1.1] font-bold text-white mb-8 tracking-tight max-w-[280px]">
          Let's Stay Connected
        </h1>

        <OnlineUsersTab />
      </div>

      {/* Lower Scrollable Real-Time Chat List Area */}
      <div className="flex-1 overflow-y-auto pt-6 px-4 pb-4 space-y-1 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-purple-500 animate-spin mb-2" />
            <p className="text-xs text-neutral-500">Loading conversation channels...</p>
          </div>
        ) : isError ? (
          <p className="text-center text-xs text-red-400 py-6">Failed to track live message loops.</p>
        ) : chats.length === 0 ? (
          <div className="text-center text-xs text-neutral-600 py-12">No active rooms found.</div>
        ) : (
          chats.map((room: any) => {
            const isOnline = onlineUsers?.includes(room.participantId);
            const isActive = String(room._id) === String(activeChatId);

            return (
              <div
                key={room._id}
                onClick={() => navigate(`/chat/${room._id}`)}
                className={`flex items-center gap-3 px-3 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 border group ${
                  isActive
                    ? 'bg-purple-600/10 border-purple-500/20 text-white'
                    : 'bg-transparent border-transparent hover:bg-neutral-900/40 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800/80 text-xs font-bold text-white overflow-hidden">
                    <Avatar className="w-full h-full">
                      <AvatarImage
                        src={room?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(room?.name || 'User')}`}
                        className="object-cover"
                        alt={room?.name}
                      />
                    </Avatar>
                  </div>
                  {isOnline && !room.isGroup && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#111111] rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-xs font-semibold truncate transition-colors ${isActive ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                      {room.name || 'Conversation'}
                    </h3>
                    {room.latestMessage?.createdAt && (
                      <span className="text-[10px] text-neutral-600 tracking-tighter shrink-0">
                        {new Date(room.latestMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-500 truncate max-w-[190px]">
                    {room.latestMessage?.content ? (
                      room.latestMessage.content
                    ) : room.latestMessage?.image ? (
                      <span className="text-purple-400 italic">📷 Attachment Image File</span>
                    ) : (
                      <span className="text-neutral-600 italic">No messages sent yet</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 w-full max-w-md rounded-2xl p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" /> Start a New Chat
              </h2>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-neutral-400 hover:text-white transition text-sm"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 rounded-lg mb-4">
              <button
                type="button"
                className={`py-2 text-sm font-medium rounded-md transition ${!isGroup ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                onClick={() => { setIsGroup(false); setSelectedParticipants([]); }}
              >
                Direct Message
              </button>
              <button
                type="button"
                className={`py-2 text-sm font-medium rounded-md transition ${isGroup ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                onClick={() => { setIsGroup(true); setSelectedParticipants([]); }}
              >
                Group Chat
              </button>
            </div>

            <form onSubmit={handleCreateChat} className="space-y-4">
              {isGroup && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Group Name</label>
                  <Input
                    required
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="bg-neutral-900 border-neutral-800 text-white focus-visible:ring-1 focus-visible:ring-purple-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Select {isGroup ? 'Participants' : 'Contact'}
                </label>

                <div className="max-h-48 overflow-y-auto border border-neutral-800 rounded-lg p-2 space-y-1 bg-neutral-900">
                  {contacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-neutral-500">
                      <Users className="w-8 h-8 mb-2 stroke-[1.5]" />
                      <p className="text-sm font-medium">No contacts available</p>
                      <p className="text-xs max-w-[200px] mt-0.5 text-neutral-600">Sync or add your contacts list to begin chatting.</p>
                    </div>
                  ) : (
                    contacts.map((contact) => {
                      const isSelected = selectedParticipants.includes(contact._id);
                      return (
                        <div
                          key={contact._id}
                          onClick={() => toggleParticipant(contact._id)}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
                            isSelected
                              ? 'bg-purple-950/40 border border-purple-500/50'
                              : 'hover:bg-neutral-800/60 border border-transparent'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-medium overflow-hidden border border-neutral-700 shrink-0">
                            {contact.avatar ? (
                              <img src={contact.avatar} alt={contact.name} className="object-cover w-full h-full" />
                            ) : (
                              contact.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-neutral-200">{contact.name}</p>
                            <p className="text-xs text-neutral-400 truncate">{contact.email}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-purple-500 bg-purple-500' : 'border-neutral-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={selectedParticipants.length === 0 || isSubmitting || (isGroup && !groupName.trim())}
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition disabled:bg-neutral-800 disabled:text-neutral-600"
              >
                {isSubmitting ? 'Creating Chat...' : isGroup ? 'Create Group Chat' : 'Start Chat'}
              </Button>
            </form>

          </div>
        </div>
      )}

    </aside>
  );
};

export default Sidebar;