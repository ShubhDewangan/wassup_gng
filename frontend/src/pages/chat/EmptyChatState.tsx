import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

const EmptyChatState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#161616] p-8 text-center animate-in fade-in duration-300">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 shadow-xl mb-6">
        <MessageSquarePlus className="h-10 w-10 text-neutral-500 stroke-[1.2]" />
      </div>
      
      <h2 className="text-xl font-semibold text-neutral-200 tracking-tight">
        No Conversation Selected
      </h2>
      
      <p className="mt-2 text-sm text-neutral-500 max-w-sm leading-relaxed">
        Choose a workspace thread from your active list or click the plus button to establish a direct network bridge.
      </p>
    </div>
  );
};

export default EmptyChatState;
