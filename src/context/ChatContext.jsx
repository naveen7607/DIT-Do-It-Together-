import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

// Helpers for chats and requests (unchanged)
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
// Call storage helpers
const getGlobalCalls = () => {
  const data = localStorage.getItem('dit_calls');
  return data ? JSON.parse(data) : [];
};
const saveGlobalCalls = (callsArr) => {
  localStorage.setItem('dit_calls', JSON.stringify(callsArr));
};
// Cooldown storage helpers
const getGlobalCooldowns = () => {
  const data = localStorage.getItem('dit_call_cooldowns');
  return data ? JSON.parse(data) : [];
};
const saveGlobalCooldowns = (cdArr) => {
  localStorage.setItem('dit_call_cooldowns', JSON.stringify(cdArr));
};

// Deterministic Google Meet link generator (letters only, 3‑4-3 characters)
const generateMeetLink = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const seg3 = () => {
    let s = '';
    for (let i = 0; i < 3; i++) {
      s += letters[Math.floor(Math.random() * letters.length)];
    }
    return s;
  };
  const seg4 = () => {
    let s = '';
    for (let i = 0; i < 4; i++) {
      s += letters[Math.floor(Math.random() * letters.length)];
    }
    return s;
  };
  return `https://meet.google.com/${seg3()}-${seg4()}-${seg3()}`;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [requests, setRequests] = useState([]);
  const [calls, setCalls] = useState([]);
  const [cooldowns, setCooldowns] = useState([]);

  // Load initial data
  useEffect(() => {
    if (user && user.username) {
      setChats(getGlobalChats(user.username));
      setRequests(getGlobalRequests());
      setCalls(getGlobalCalls());
      setCooldowns(getGlobalCooldowns());
      setActiveChat(null);
    } else {
      setChats({});
      setRequests([]);
      setCalls([]);
      setCooldowns([]);
      setActiveChat(null);
    }
  }, [user]);

  // Poll for updates every 3 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setChats(getGlobalChats(user.username));
      setRequests(getGlobalRequests());
      setCalls(getGlobalCalls());
      setCooldowns(getGlobalCooldowns());
    }, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // Helper to check if a pair is under cooldown
  const isUnderCooldown = (otherUsername) => {
    const pairKey = [user.username, otherUsername].sort().join('-');
    const entry = cooldowns.find(c => c.pair === pairKey);
    return entry && Date.now() < entry.nextAllowed;
  };

  // Swap request helpers (unchanged)
  const sendRequest = (targetUsername) => {
    if (!user) return;
    const newReq = { id: Date.now(), from: user.username, to: targetUsername, status: 'pending' };
    const all = getGlobalRequests();
    all.push(newReq);
    saveGlobalRequests(all);
    setRequests(all);
  };
  const acceptRequest = (requestId, fromUsername) => {
    if (!user) return;
    const all = getGlobalRequests().map(r => r.id === requestId ? { ...r, status: 'accepted' } : r);
    saveGlobalRequests(all);
    setRequests(all);
    // ensure chats exist
    const my = getGlobalChats(user.username);
    if (!my[fromUsername]) my[fromUsername] = [];
    saveGlobalChats(user.username, my);
    const other = getGlobalChats(fromUsername);
    if (!other[user.username]) {
      other[user.username] = [];
      saveGlobalChats(fromUsername, other);
    }
  };
  const rejectRequest = (requestId) => {
    const all = getGlobalRequests().map(r => r.id === requestId ? { ...r, status: 'rejected' } : r);
    saveGlobalRequests(all);
    setRequests(all);
  };

  // Call request helpers
  const sendCallRequest = (targetUsername) => {
    if (!user) return;
    if (isUnderCooldown(targetUsername)) return; // block if cooling down
    // Ensure no existing pending call between the two
    const exists = getGlobalCalls().some(c =>
      ((c.from === user.username && c.to === targetUsername) ||
      (c.from === targetUsername && c.to === user.username)) && c.status === 'pending'
    );
    if (exists) return;
    const newCall = { id: Date.now(), from: user.username, to: targetUsername, status: 'pending', meetLink: '' };
    const all = getGlobalCalls();
    all.push(newCall);
    saveGlobalCalls(all);
    setCalls(all);
  };

  const acceptCall = async (callId, fromUsername) => {
    if (!user) return;
    // Ensure cooldown has passed before generating link
    if (isUnderCooldown(fromUsername)) return;
    const meetLink = generateMeetLink();
    // Update call entry
    const all = getGlobalCalls().map(c => c.id === callId ? { ...c, status: 'accepted', meetLink } : c);
    saveGlobalCalls(all);
    setCalls(all);
    // Set cooldown for this pair (5 minutes)
    const pairKey = [user.username, fromUsername].sort().join('-');
    const newCooldown = { pair: pairKey, nextAllowed: Date.now() + 5 * 60 * 1000 };
    const cdArr = getGlobalCooldowns().filter(c => c.pair !== pairKey);
    cdArr.push(newCooldown);
    saveGlobalCooldowns(cdArr);
    setCooldowns(cdArr);
    // Copy link to clipboard
    try { await navigator.clipboard.writeText(meetLink); } catch (_) {}
    // System message for both chats
    const sysMsg = { id: Date.now(), sender: 'system', text: `Call link: ${meetLink}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    
    const callerChats = getGlobalChats(fromUsername);
    const existingCallerMsgs = callerChats[user.username] || [];
    callerChats[user.username] = [...existingCallerMsgs.filter(m => !(m.sender === 'system' && m.text.startsWith('Call link:'))), sysMsg];
    saveGlobalChats(fromUsername, callerChats);

    const calleeChats = getGlobalChats(user.username);
    const existingCalleeMsgs = calleeChats[fromUsername] || [];
    calleeChats[fromUsername] = [...existingCalleeMsgs.filter(m => !(m.sender === 'system' && m.text.startsWith('Call link:'))), sysMsg];
    saveGlobalChats(user.username, calleeChats);
    // Refresh UI state
    setChats(getGlobalChats(user.username));
  };
  const rejectCall = (callId) => {
    if (!user) return;
    const all = getGlobalCalls().map(c => c.id === callId ? { ...c, status: 'rejected' } : c);
    saveGlobalCalls(all);
    setCalls(all);
  };

  // Message sending (unchanged)
  const sendMessage = (contactUsername, text) => {
    if (!user) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const myMsg = { id: Date.now(), sender: 'me', text, time };
    const myChats = getGlobalChats(user.username);
    myChats[contactUsername] = [...(myChats[contactUsername] || []), myMsg];
    saveGlobalChats(user.username, myChats);
    setChats(myChats);
    const otherMsg = { id: Date.now() + 1, sender: 'other', text, time };
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
      rejectRequest,
      calls,
      sendCallRequest,
      acceptCall,
      rejectCall,
      cooldowns
    }}>
      {children}
    </ChatContext.Provider>
  );
};
