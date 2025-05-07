import React from 'react';
import './ChatStyles.css';

const ConversationListItem = ({ conversation, onSelect, isActive }) => {
  const otherUser = conversation.other_participant; // From Conversation model accessor
  const lastMsg = conversation.last_message;

  if (!otherUser) return null; // Should not happen if data is correct

  return (
    <div 
      className={`conversation-list-item ${isActive ? 'active' : ''}`} 
      onClick={() => onSelect(conversation)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onSelect(conversation)}
      aria-current={isActive ? "page" : undefined}
    >
      <img 
        src={otherUser.images?.[0]?.image_path || 'https://via.placeholder.com/50'} // Assuming user object has images
        alt={otherUser.name} 
        className="conversation-avatar"
      />
      <div className="conversation-details">
        <span className="conversation-name">{otherUser.name}</span>
        {lastMsg && <p className="conversation-last-message">{lastMsg.content}</p>}
        {!lastMsg && <p className="conversation-last-message italic">No messages yet.</p>}
      </div>
      {lastMsg && 
        <span className="conversation-time">
          {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      }
    </div>
  );
};

export default ConversationListItem;