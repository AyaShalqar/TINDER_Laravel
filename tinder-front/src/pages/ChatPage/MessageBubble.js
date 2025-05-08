import React from 'react';
import './ChatStyles.css';

const MessageBubble = ({ message, isSender }) => {
  return (
    <div className={`message-bubble-container ${isSender ? 'sender' : 'receiver'}`}>
      <div className="message-bubble">
        <p className="message-content">{message.content}</p>
        <span className="message-timestamp">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;