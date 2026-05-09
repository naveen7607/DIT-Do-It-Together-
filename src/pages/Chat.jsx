import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, Info, AlertTriangle, Check, X, MessageSquare } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

export const Chat = () => {
  const { user } = useAuth();
  const { 
    chats, 
    activeChat, 
    setActiveChat, 
    sendMessage, 
    reportUser,
    requests,
    acceptRequest,
    rejectRequest
  } = useChat();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const activeMessages = activeChat ? (chats[activeChat] || []) : [];
  const contactList = Object.keys(chats);

  // Filter pending incoming requests for this user
  const incomingRequests = requests.filter(r => r.to === user?.username && r.status === 'pending');

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
          
          {incomingRequests.length > 0 && (
            <div className="requests-section">
              <div className="chat-list-header" style={{paddingBottom: '10px'}}>
                <h3 style={{fontSize: '1rem', color: 'var(--warning)'}}>Swap Requests ({incomingRequests.length})</h3>
              </div>
              <div className="contact-list" style={{maxHeight: '150px', borderBottom: '1px solid var(--border-color)'}}>
                {incomingRequests.map(req => (
                  <div key={req.id} className="request-item" style={{padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <p style={{fontWeight: '600', fontSize: '0.9rem'}}>{req.from.split('@')[0]}</p>
                        <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>wants to swap</p>
                      </div>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button 
                          onClick={() => acceptRequest(req.id, req.from)}
                          style={{background: 'var(--success)', color: 'white', padding: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => rejectRequest(req.id)}
                          style={{background: 'var(--danger)', color: 'white', padding: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="chat-list-header">
            <h3>Messages</h3>
          </div>
          <div className="contact-list">
            {contactList.length === 0 ? (
              <p style={{padding: '24px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem'}}>
                No active chats. Discover users to request a skill swap!
              </p>
            ) : (
              contactList.map(contact => (
                <div 
                  key={contact} 
                  className={`contact-item ${activeChat === contact ? 'active' : ''}`}
                  onClick={() => setActiveChat(contact)}
                >
                  <div className="avatar">
                    {contact.charAt(0).toUpperCase()}
                  </div>
                  <div className="contact-info">
                    <h4>{contact.split('@')[0]}</h4>
                    <p className="last-message">
                      {chats[contact][chats[contact].length - 1]?.text || 'Start chatting...'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-main">
          {activeChat ? (
            <>
              <div className="chat-header">
                <div className="chat-header-user">
                  <div className="avatar">
                    {activeChat.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2>{activeChat.split('@')[0]}</h2>
                    <p className="status online">Skill Partner</p>
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
                {activeMessages.length === 0 ? (
                  <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>
                    <p>Swap accepted! Send your first message.</p>
                  </div>
                ) : (
                  activeMessages.map(msg => (
                    <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
                      <div className="message">
                        <p>{msg.text}</p>
                        <span className="time">{msg.time}</span>
                      </div>
                    </div>
                  ))
                )}
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
