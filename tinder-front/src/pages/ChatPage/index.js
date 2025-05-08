import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import ChatView from './ChatView';
import { getConversations } from '../../services/api';
import './ChatStyles.css';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const [selectedMatch, setSelectedMatch] = useState(null); 
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();


  const fetchAndSetConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const convData = await getConversations(); 
      setConversations(convData.data || []); 
      setError('');

      const locationState = location.state;
      if (locationState?.matchToChat) {
          const existingConv = (convData.data || []).find(c => c.match_id === locationState.matchToChat.match_id);
          if (existingConv) {
              setSelectedConversation(existingConv);
              setSelectedMatch(null); 
          } else {
              setSelectedConversation(null);
              setSelectedMatch(locationState.matchToChat);
          }

          navigate(location.pathname, { replace: true, state: {} });
      }


    } catch (err) {
      setError('Failed to load conversations.');
      console.error(err);
    } finally {
      setLoadingConversations(false);
    }
  }, [location.state, location.pathname, navigate]);


  useEffect(() => {
    fetchAndSetConversations();
  }, [fetchAndSetConversations]);


  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setSelectedMatch(null); 
  };

  const handleNewMessage = (sentMessage) => {
    fetchAndSetConversations().then(() => {
        const newOrUpdatedConv = conversations.find(c => c.id === sentMessage.conversation_id);
        if (newOrUpdatedConv) {
            setSelectedConversation(newOrUpdatedConv);
            setSelectedMatch(null); 
        } else if (sentMessage.conversation_id) {

             console.warn("New conversation not immediately found in list, may appear on next refresh.");
        }
    });



  };


  return (
    <div className="chat-page-container">
      <div className="conversations-sidebar">
        <ConversationList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
          loading={loadingConversations}
          error={error}
        />
      </div>
      <div className="chat-view-main">
        <ChatView
          selectedConversation={selectedConversation}
          selectedMatch={selectedMatch} 
          onNewMessage={handleNewMessage} 
        />
      </div>
    </div>
  );
};

export default ChatPage;