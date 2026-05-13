import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Video, Check, X } from 'lucide-react';
import './CallPopup.css';

export const CallPopup = () => {
  const { user } = useAuth();
  const { calls, acceptCall, rejectCall } = useChat();
  const [expanded, setExpanded] = useState(false);

  // Find pending calls addressed to the current user
  const pendingCalls = calls.filter(c => c.to === user?.username && c.status === 'pending');
  if (pendingCalls.length === 0) return null;

  const handleAccept = async (call) => {
    await acceptCall(call.id, call.from);
    setExpanded(false);
  };

  const handleReject = (call) => {
    rejectCall(call.id);
    setExpanded(false);
  };

  return (
    <div className="call-popup">
      <button className="call-icon-btn" onClick={() => setExpanded(prev => !prev)} title="Incoming video call">
        <Video size={20} />
      </button>
      {expanded && (
        <div className="call-actions">
          {pendingCalls.map(call => (
            <div key={call.id} className="call-item">
              <p>{call.from.split('@')[0]} is calling you</p>
              <div className="action-buttons">
                <button className="accept-btn" onClick={() => handleAccept(call)}>
                  <Check size={16} /> Accept
                </button>
                <button className="reject-btn" onClick={() => handleReject(call)}>
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
