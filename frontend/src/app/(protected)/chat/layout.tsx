"use client";

import { SocketProvider } from "@/src/context/SocketContext";
import ChatSidebar from "@/src/components/chat/ChatSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0A0A0F] text-[#F5F1EA]">
        {/* Left Sidebar */}
        <aside className="w-80 shrink-0 border-r border-[#26262E] bg-[#16161C]/60 backdrop-blur-xl flex flex-col h-full">
          <ChatSidebar />
        </aside>

        {/* Main Conversation Window */}
        <main className="flex-1 flex flex-col h-full bg-[#0A0A0F] relative">
          {children}
        </main>
      </div>
    </SocketProvider>
  );
}