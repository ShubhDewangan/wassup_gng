/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSocket } from "@/src/context/SocketContext";
import { apiFetch } from "@/src/lib/fetcher";
import { toast } from "sonner";
import { Plus, Search, ChevronDown, Check, Users } from "lucide-react";

// Shadcn UI Components
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

interface Participant {
  _id: string;
  name: string;
  avatar?: string;
}

interface Chat {
  _id: string;
  chatName?: string;
  groupName?: string;
  isGroup: boolean;
  participants: Participant[];
  lastMessage?: { text: string; createdAt: string } | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatSidebar({
  currentUserId,
}: {
  currentUserId?: string;
}) {
  const params = useParams();
  const activeChatId = params?.chatId as string;
  const { OnlineUsers } = useSocket();

  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState<Participant[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // 1. Fetch chats and safely extract data.chats array
  useEffect(() => {
    async function fetchChats() {
      try {
        const data = await apiFetch("/api/chat/chats");

        // Extract array from response payload { message: "...", chats: [...] }
        if (data && Array.isArray(data.chats)) {
          setChats(data.chats);
        } else if (Array.isArray(data)) {
          setChats(data);
        } else {
          setChats([]);
        }
      } catch (err: any) {
        toast.error("Failed to load chats");
        setChats([]);
      }
    }
    fetchChats();
  }, []);

  const handleOpenGroupModal = async () => {
    try {
      const data = await apiFetch("/api/user/all-users");
      const usersList = Array.isArray(data) ? data : data?.users || [];
      setAvailableUsers(usersList);
      setIsPopoverOpen(true);
    } catch (err: any) {
      toast.error("Could not fetch contacts");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUserIds.length < 2) {
      toast.error("Please enter a group name and select at least 2 members");
      return;
    }
    setIsCreatingGroup(true);
    try {
      const res = await apiFetch("/api/chat/create", {
        method: "POST",
        body: JSON.stringify({ name: groupName, members: selectedUserIds }),
      });
      const createdChat = res.chat || res;
      setChats((prev) => [createdChat, ...prev]);
      toast.success("Group created!");
      setIsPopoverOpen(false);
      setGroupName("");
      setSelectedUserIds([]);
    } catch (err: any) {
      toast.error(err.message || "Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Helper function to resolve conversation title & partner avatar
  const getChatDetails = (chat: Chat) => {
    if (chat.isGroup) {
      return {
        title: chat.groupName || chat.chatName || "Group Chat",
        avatar: undefined,
        partnerId: null,
      };
    }

    // Find the other participant in 1-on-1 DM
    const partner =
      chat.participants.find((p) => p._id !== currentUserId) ||
      chat.participants[0];
    return {
      title: partner?.name || "User",
      avatar: partner?.avatar,
      partnerId: partner?._id,
    };
  };

  // Safe search filter
  const filteredChats = (Array.isArray(chats) ? chats : []).filter((chat) => {
    const { title } = getChatDetails(chat);
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none">
      {/* Upper Soft-Gradient Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-teal-500/20 via-indigo-500/20 to-background/95 p-5 pb-6 border-b border-border/40">
        {/* Search Bar Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background/40 backdrop-blur-md border-border/50 pl-10 h-10 rounded-full text-sm placeholder:text-muted-foreground/70 focus-visible:ring-ring"
            />
          </div>
          <button
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground transition"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* Banner Title */}
        <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-foreground/95 mb-5 font-heading">
          Let’s Stay <br /> Connected
        </h1>

        {/* Quick Stories / Contacts Horizontal Bar */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none py-1">
          {/* Add Group / Contact Button (Fixed Popover Trigger) */}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={handleOpenGroupModal}
                className="flex flex-col items-center gap-1.5 shrink-0 group outline-none"
              >
                <div className="h-14 w-14 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center bg-background/30 backdrop-blur-sm group-hover:border-primary transition">
                  <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  Add
                </span>
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-80 border-border bg-card text-card-foreground p-4 rounded-2xl shadow-xl">
              <h3 className="font-semibold text-sm mb-3">Create Group</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-muted border-border text-sm rounded-xl"
                />
                <p className="text-xs text-muted-foreground font-medium">
                  Select Members:
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {availableUsers.map((u) => {
                    const isSelected = selectedUserIds.includes(u._id);
                    return (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() =>
                          setSelectedUserIds((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== u._id)
                              : [...prev, u._id],
                          )
                        }
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${
                          isSelected
                            ? "bg-primary/20 text-primary font-medium"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={isCreatingGroup}
                  className="w-full bg-primary text-primary-foreground font-medium rounded-xl text-xs"
                >
                  {isCreatingGroup ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick Chat Avatars */}
          {filteredChats.slice(0, 6).map((chat) => {
            const { title, avatar, partnerId } = getChatDetails(chat);
            const isOnline = partnerId
              ? OnlineUsers.includes(partnerId)
              : false;

            return (
              <Link
                key={chat._id}
                href={`/chat/${chat._id}`}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-2 ring-background shadow-md">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-xs">
                      {chat.isGroup ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        title?.slice(0, 2).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  )}
                </div>
                <span className="text-xs text-foreground/80 font-medium truncate max-w-[56px] text-center">
                  {title?.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {filteredChats.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground pt-8">
            No conversations found
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat._id === activeChatId;
            const { title, avatar, partnerId } = getChatDetails(chat);
            const isOnline = partnerId
              ? OnlineUsers.includes(partnerId)
              : false;

            return (
              <Link
                key={chat._id}
                href={`/chat/${chat._id}`}
                className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-accent/80 shadow-sm border border-border/40"
                    : "hover:bg-accent/40"
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-medium text-sm">
                      {chat.isGroup ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        title?.slice(0, 2).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {chat.lastMessage
                        ? new Date(
                            chat.lastMessage.createdAt,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : new Date(chat.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
