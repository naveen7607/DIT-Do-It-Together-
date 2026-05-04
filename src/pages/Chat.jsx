import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, Info, AlertTriangle } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import './Chat.css';

export const Chat = () => {
  const { chats, activeChat, setActiveChat, sendMessage, reportUser } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const activeMessages = chats[activeChat] || [];
  const contactList = Object.keys(chats);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    sendMessage(activeChat, input);
    setInput('');
  };

  return (
    <div className="container chat-container animate-fade-in">
      <div className="chat-layout glass-panel">
        <div className="chat-sidebar">
          <div className="chat-list-header">
            <h3>Messages</h3>
          </div>
          <div className="contact-list">
            {contactList.map(contact => (
              <div 
                key={contact} 
                className={`contact-item ${activeChat === contact ? 'active' : ''}`}
                onClick={() => setActiveChat(contact)}
              >
                <div className="avatar" style={{background: contact === 'Sneha Patel' ? 'var(--success)' : ''}}>
                  {contact.charAt(0)}
                </div>
                <div className="contact-info">
                  <h4>{contact}</h4>
                  <p className="last-message">
                    {chats[contact][chats[contact].length - 1]?.text || 'Start chatting...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          {activeChat ? (
            <>
              <div className="chat-header">
                <div className="chat-header-user">
                  <div className="avatar" style={{background: activeChat === 'Sneha Patel' ? 'var(--success)' : ''}}>
                    {activeChat.charAt(0)}
                  </div>
                  <div>
                    <h2>{activeChat}</h2>
                    <p className="status online">Online</p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="icon-btn" onClick={() => reportUser(activeChat, 'Suspicious behavior')} title="Report User">
                    <AlertTriangle size={20} className="text-warning" />
                  </button>
                  <button className="icon-btn"><Phone size={20} /></button>
                  <button className="icon-btn"><Video size={20} /></button>
                </div>
              </div>

              <div className="messages-area">
                {activeMessages.map(msg => (
                  <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
                    <div className="message">
                      <p>{msg.text}</p>
                      <span className="time">{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-area" onSubmit={handleSend}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className="send-btn" disabled={!input.trim()}>
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              <MessageSquare size={48} className="text-muted" />
              <h2>Your Messages</h2>
              <p>Select a contact to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
