import { useState } from 'react';
import { Sparkles, Send, Bot, User as UserIcon } from 'lucide-react';
import './AIAssistant.css';

export const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hi! I\'m your DIT AI Assistant. Tell me what skills you have and what you want to learn, and I\'ll find the best matches for you!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Mock Database for the AI to know about
  const mockDatabaseContext = `
  Available Users on the platform:
  1. Priya Sharma: Teaches [Python, Data Science], Wants to learn [React, CSS]. Location: Online.
  2. Arjun Reddy: Teaches [UI/UX, Figma], Wants to learn [JavaScript]. Location: Hyderabad.
  3. Neha Gupta: Teaches [English, Communication], Wants to learn [Python]. Location: Online.
  `;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userText = input;
    const userMsg = { id: Date.now(), type: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      const promptContext = `
      You are the official AI Assistant for 'DIT' (Do It Together), a skill exchange platform where people teach each other skills instead of paying money.
      Here is the database of current users: ${mockDatabaseContext}.
      
      The user is asking: "${userText}"
      
      Respond directly, warmly, and concisely. If they ask for a match or what to learn, use the database context to recommend the specific people from the list. Keep it under 3 sentences.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptContext }] }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const aiText = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: aiText }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: 'Oops! I am having trouble connecting to my brain right now. Try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="container ai-container animate-fade-in">
      <div className="ai-layout">
        <div className="ai-sidebar glass-panel">
          <div className="sidebar-header">
            <Sparkles className="sparkle-icon" size={24} />
            <h2>AI Matchmaker</h2>
          </div>
          <p className="sidebar-desc">
            Use AI to find the perfect skill exchange partner, get learning path suggestions, or just ask for advice on what to learn next.
          </p>
          <div className="suggestion-chips">
            <button className="chip" onClick={() => setInput('I want to learn Python, who can teach me?')}>
              "I want to learn Python, who can teach me?"
            </button>
            <button className="chip" onClick={() => setInput('Find me the best partner for UI/UX')}>
              "Find me the best partner for UI/UX"
            </button>
          </div>
        </div>

        <div className="ai-chat-area glass-panel">
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-wrapper ${msg.type}`}>
                <div className="message-avatar">
                  {msg.type === 'ai' ? <Bot size={20} /> : <UserIcon size={20} />}
                </div>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message-wrapper ai">
                <div className="message-avatar"><Bot size={20} /></div>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="chat-input-area">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI Assistant..."
              className="chat-input"
            />
            <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
