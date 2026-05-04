import { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem('dit_chats');
    if (savedChats) return JSON.parse(savedChats);
    
    // Initial state
    return {
      'Rahul Sharma': [
        { id: 1, sender: 'other', text: 'Hey! I saw you want to learn UI/UX. I can teach you Figma if you help me with React hooks.', time: '10:30 AM' },
        { id: 2, sender: 'me', text: 'Hi Rahul! That sounds perfect.', time: '10:35 AM' }
      ],
      'Sneha Patel': [
        { id: 1, sender: 'other', text: 'When are you free for a call?', time: 'Yesterday' }
      ]
    };
  });

  const [activeChat, setActiveChat] = useState('Rahul Sharma');

  useEffect(() => {
    localStorage.setItem('dit_chats', JSON.stringify(chats));
  }, [chats]);

  const sendMessage = (contactName, text) => {
    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => ({
      ...prev,
      [contactName]: [...(prev[contactName] || []), newMessage]
    }));

    // Simulate auto-reply after 2 seconds
    setTimeout(() => {
      const autoReply = {
        id: Date.now() + 1,
        sender: 'other',
        text: `Got it! Also, ${text.split(' ')[0]} to you too! Let's schedule a session soon.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => ({
        ...prev,
        [contactName]: [...(prev[contactName] || []), autoReply]
      }));
    }, 2000);
  };

  const reportUser = (contactName, reason) => {
    // In a real app, this sends an API request to the backend.
    console.log(`Reported ${contactName} for: ${reason}`);
    alert(`${contactName} has been reported to the Admin.`);
  };

  return (
    <ChatContext.Provider value={{ chats, activeChat, setActiveChat, sendMessage, reportUser }}>
      {children}
    </ChatContext.Provider>
  );
};
