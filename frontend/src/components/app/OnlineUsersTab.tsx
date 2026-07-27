/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import { useSocket } from '../../context/SocketContext'
import { useMultipleUser } from '../../hooks/useOtherUser'
import { Avatar, AvatarBadge, AvatarImage } from '../ui/avatar'
import { Plus } from 'lucide-react' // Import the Add icon

const OnlineUsersTab = () => {
  // Use fallback dummy data if the hooks aren't setup yet (just for testing this UI update)
  const { onlineUsers = [] } = useSocket() || {};
  const { users = [], isLoading, isError } = useMultipleUser(onlineUsers) || {};

  // Simplify loading/error states for a cleaner UI integrated into the card
  if (isLoading) return <p className="text-white/70 text-sm px-1">Loading contacts...</p>
  if (isError) return <p className="text-red-300 text-sm px-1">Error loading contacts</p>

  // Define avatars to use if the user object doesn't provide one (from image)
  const fallbackAvatars = [
    '/path/to/adison.jpg',
    '/path/to/charlie.jpg',
    '/path/to/james.jpg',
    '/path/to/ka.jpg',
  ];

  return (
    // Clean, horizontal scrollable list
    <div className="text-black -mx-1">
      {/* 
        Using flex-nowrap and overflow-x-auto makes it a scrollable row. 
        '-mx-1' and 'px-1' help align elements with the container padding.
      */}
      <ul className="flex items-start gap-4 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        
        {/* 1. "ADD" STATIONARY BUTTON (Matching image) */}
        <li className="flex flex-col items-center shrink-0">
          <button className="w-[60px] h-[60px] rounded-full border-2 border-dashed border-neutral-600/50 flex items-center justify-center text-neutral-600 hover:border-neutral-800 hover:text-neutral-800 transition mb-2">
            <Plus className="w-7 h-7" />
          </button>
          <span className="text-xs text-neutral-700 font-medium">Add</span>
        </li>

        {/* 2. MAPPED USER LIST */}
        {
          // If no users, this map just won't render anything after the Add button.
          users.map((user: any, index: number) => (
            <li key={user.id || user._id || index} className="relative group shrink-0 flex flex-col items-center max-w-[65px]">
              
              {/* Avatar Container (Matches size in image) */}
              <div className="w-[60px] h-[60px] mb-2">
                <Avatar className="w-full h-full ring-2 ring-white/10">
                  {/* Using fallback avatars loosely based on index for demo purposes */}
                  <AvatarImage 
                    src={user.avatar || fallbackAvatars[index % fallbackAvatars.length] || '../../public/images.jpg'} 
                    className="object-cover" 
                  />
                  {/* Badge position refined for the design */}
                  <AvatarBadge className="bg-[#56e39c] w-3.5 h-3.5 border-2 border-[#b6c7f8] bottom-1 right-1" />
                </Avatar>
              </div>

              {/* USER NAME (Truncated) */}
              <span className="text-xs text-neutral-900 font-semibold truncate w-full text-center">
                {user.name}
              </span>

              {/* Keep Tooltip logic on hover */}
              <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-100 bg-gray-900/90 text-white text-xs rounded-md py-1.5 px-3 whitespace-nowrap shadow-xl">
                {user.name}
                {/* Small triangle arrow for tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/90" />
              </div>

            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default OnlineUsersTab