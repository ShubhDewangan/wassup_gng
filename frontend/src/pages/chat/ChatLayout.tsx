import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/app/Sidebar';
import { fetchContacts } from '../../services/user.service';

const ChatLayout: React.FC = () => {
  const [contacts, setContacts] = useState([]);

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
      {/* Sidebar stays completely static here */}
      <Sidebar contacts={contacts} />
      
      {/* Dynamic workspace area displaying either Empty or Active content views */}
      <main className="flex-1 h-full relative flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;
