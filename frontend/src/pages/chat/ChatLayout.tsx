import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Sidebar from '../../components/app/Sidebar';
import { fetchContacts } from '../../services/user.service';

const ChatLayout: React.FC = () => {
  const [contacts, setContacts] = useState([]);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const users = await fetchContacts();
        setContacts(users || []);
      } catch (error) {
        console.error(error);
      }
    };
    getContacts();
  }, []);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#161616]">
      {/* On mobile: show sidebar only when no chat is open. On desktop: always visible. */}
      <div className={`${id ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}>
        <Sidebar contacts={contacts} />
      </div>

      {/* On mobile: show workspace only when a chat is open. On desktop: always visible. */}
      <main
        className={`${id ? 'flex' : 'hidden md:flex'} flex-1 h-full relative flex-col min-w-0`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;