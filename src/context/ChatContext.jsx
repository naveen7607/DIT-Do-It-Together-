import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

// Mock DB helpers for cross-session chat & requests
const getGlobalChats = (username) => {
  const data = localStorage.getItem(`dit_chats_${username}`);
  return data ? JSON.parse(data) : {};
};

const saveGlobalChats = (username, chatsObj) => {
  localStorage.setItem(`dit_chats_${username}`, JSON.stringify(chatsObj));
};

const getGlobalRequests = () => {
  const data = localStorage.getItem('dit_swap_requests');
  return data ? JSON.parse(data) : [];
};

const saveGlobalRequests = (requestsArr) => {
  localStorage.setItem('dit_swap_requests', JSON.stringify(requestsArr));
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  
  // Requests state
  const [requests, setRequests] = useState([]);

  // Load user data on mount/login
  useEffect(() => {
    if (user && user.username) {
      setChats(getGlobalChats(user.username));
      setRequests(getGlobalRequests());
      setActiveChat(null);
    } else {
      setChats({});
      setRequests([]);
      setActiveChat(null);
    }
  }, [user]);

  // Handle cross-session simulated sync (Polling every 3 seconds)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setChats(getGlobalChats(user.username));
      setRequests(getGlobalRequests());
    }, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const sendRequest = (targetUsername) => {
    if (!user) return;
    const newReq = {
      id: Date.now(),
      from: user.username,
      to: targetUsername,
      status: 'pending'
    };
    const allReqs = getGlobalRequests();
    allReqs.push(newReq);
    saveGlobalRequests(allReqs);
    setRequests(allReqs);
  };

  const acceptRequest = (requestId, fromUsername) => {
    if (!user) return;
    
    // Update request
    const allReqs = getGlobalRequests().map(r => r.id === requestId ? { ...r, status: 'accepted' } : r);
    saveGlobalRequests(allReqs);
    setRequests(allReqs);
    
    // Initialize empty chat for ME
    const myChats = getGlobalChats(user.username);
    if (!myChats[fromUsername]) myChats[fromUsername] = [];
    saveGlobalChats(user.username, myChats);
    setChats(myChats);

    // Initialize for the OTHER user in global DB
    const otherUserChats = getGlobalChats(fromUsername);
    if (!otherUserChats[user.username]) {
      otherUserChats[user.username] = [];
      saveGlobalChats(fromUsername, otherUserChats);
    }
  };

  const rejectRequest = (requestId) => {
    if (!user) return;
    const allReqs = getGlobalRequests().map(r => r.id === requestId ? { ...r, status: 'rejected' } : r);
    saveGlobalRequests(allReqs);
    setRequests(allReqs);
  };

  const sendMessage = (contactUsername, text) => {
    if (!user) return;
    
    const messageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Update My Local State (sender: 'me')
    const myMsg = { id: Date.now(), sender: 'me', text, time: messageTime };
    const myChats = getGlobalChats(user.username);
    myChats[contactUsername] = [...(myChats[contactUsername] || []), myMsg];
    saveGlobalChats(user.username, myChats);
    setChats(myChats); // Update UI immediately

    // 2. Update Other User's Global DB (sender: 'other')
    const otherMsg = { id: Date.now() + 1, sender: 'other', text, time: messageTime };
    const otherChats = getGlobalChats(contactUsername);
    otherChats[user.username] = [...(otherChats[user.username] || []), otherMsg];
    saveGlobalChats(contactUsername, otherChats);
  };

  const reportUser = (contactName, reason) => {
    console.log(`Reported ${contactName} for: ${reason}`);
    alert(`${contactName} has been reported to the Admin.`);
  };

  return (
    <ChatContext.Provider value={{ 
      chats, 
      activeChat, 
      setActiveChat, 
      sendMessage, 
      reportUser,
      requests,
      sendRequest,
      acceptRequest,
      rejectRequest
    }}>
      {children}
    </ChatContext.Provider>
  );
};
