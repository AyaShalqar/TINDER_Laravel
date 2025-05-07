import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import ChatView from './ChatView';
import { getConversations } from '../../services/api';
import './ChatStyles.css';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  // selectedMatch is for when navigating from MatchesPage to initiate a chat
  const [selectedMatch, setSelectedMatch] = useState(null); 
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Load initial conversations
  const fetchAndSetConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const convData = await getConversations(); // This is paginated from API
      setConversations(convData.data || []); // Assuming your API returns { data: [...] }
      setError('');

      // If navigated with a match_id to initiate chat, try to find existing conversation
      // Or set it up to start a new one
      const locationState = location.state;
      if (locationState?.matchToChat) {
          const existingConv = (convData.data || []).find(c => c.match_id === locationState.matchToChat.match_id);
          if (existingConv) {
              setSelectedConversation(existingConv);
              setSelectedMatch(null); // Clear selectedMatch if conversation exists
          } else {
              // No existing conversation, prepare to start one with this match
              setSelectedConversation(null);
              setSelectedMatch(locationState.matchToChat);
          }
          // Clear the state from location to prevent re-triggering
          navigate(location.pathname, { replace: true, state: {} });
      }


    } catch (err) {
      setError('Failed to load conversations.');
      console.error(err);
    } finally {
      setLoadingConversations(false);
    }
  }, [location.state, location.pathname, navigate]); // Add dependencies


  useEffect(() => {
    fetchAndSetConversations();
  }, [fetchAndSetConversations]);


  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setSelectedMatch(null); // Clear any pending match if a conversation is selected
  };

  const handleNewMessage = (sentMessage) => {
    // This function is called after a message is successfully sent,
    // especially the first message in a new potential conversation.
    // `sentMessage` includes `conversation_id`.
    // We need to refresh conversations or update the current one.
    
    // Option 1: Refetch all conversations (simpler, might be slightly slower)
    fetchAndSetConversations().then(() => {
        // After refetching, try to find and select the now-existing conversation
        const newOrUpdatedConv = conversations.find(c => c.id === sentMessage.conversation_id);
        if (newOrUpdatedConv) {
            setSelectedConversation(newOrUpdatedConv);
            setSelectedMatch(null); // Ensure selectedMatch is cleared
        } else if (sentMessage.conversation_id) {
            // If not in the list yet (e.g. pagination or race condition),
            // construct a temporary one or wait for next full refresh
            // For now, we'll rely on the fetchAndSetConversations to pick it up.
             console.warn("New conversation not immediately found in list, may appear on next refresh.");
        }
    });


    // Option 2: More complex local update (if not refetching all)
    // This would involve finding if the conversation_id from sentMessage exists in `conversations`.
    // If yes, update its last_message.
    // If no, create a new conversation object locally and add it.
    // This is harder to keep in sync with backend sorting and pagination.
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
          selectedMatch={selectedMatch} // Pass this down for initiating chats
          onNewMessage={handleNewMessage} // Callback after a message is sent
        />
      </div>
    </div>
  );
};

export default ChatPage;