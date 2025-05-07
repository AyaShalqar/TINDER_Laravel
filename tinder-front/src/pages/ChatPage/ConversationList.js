import React from 'react';
import ConversationListItem from './ConversationListItem';
import './ChatStyles.css';

const ConversationList = ({ conversations, onSelectConversation, selectedConversationId, loading, error }) => {
  if (loading) return <p className="loading-text">Loading conversations...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;
  if (!conversations || conversations.length === 0) {
    return <p className="empty-text">No conversations yet. Start chatting from your matches!</p>;
  }

  return (
    <div className="conversation-list">
      {conversations.map(conv => (
        <ConversationListItem
          key={conv.id}
          conversation={conv}
          onSelect={onSelectConversation}
          isActive={conv.id === selectedConversationId}
        />
      ))}
    </div>
  );
};

export default ConversationList;