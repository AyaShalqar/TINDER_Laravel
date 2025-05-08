import React, { useState, useEffect, useRef, useContext } from 'react';
import MessageBubble from './MessageBubble';
import { sendMessageToMatch, getMessagesForConversation } from '../../services/api'; 
import { AuthContext } from '../../contexts/AuthContext';
import './ChatStyles.css';

const ChatView = ({ selectedMatch, selectedConversation, onNewMessage }) => {
  const { user } = useContext(AuthContext); 
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);


  const activeConversationId = selectedConversation?.id;
  const activeMatchId = selectedMatch?.match_id; 
  const otherParticipant = selectedConversation?.other_participant || selectedMatch?.user;


  useEffect(() => {
    
    setMessages([]);
    setCurrentPage(1);
    setHasMoreMessages(true);

    if (activeConversationId) {
      fetchMessages(activeConversationId, 1, true); 
    } else if (selectedMatch && !activeConversationId) {

      setMessages([]);
    }
  }, [activeConversationId, selectedMatch]); 


  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (messages.length > 0 && currentPage === 1) { 
        scrollToBottom('auto'); 
    }
  }, [messages, currentPage]);


  const fetchMessages = async (conversationId, page, isInitialLoad = false) => {
    if (loadingMessages || !hasMoreMessages && !isInitialLoad) return;
    setLoadingMessages(true);
    setError('');
    try {
      const data = await getMessagesForConversation(conversationId, page);
      setMessages(prevMessages => page === 1 ? data.data.reverse() : [...data.data.reverse(), ...prevMessages]);
      setHasMoreMessages(data.links.next !== null);
      setCurrentPage(page);
      if (isInitialLoad && data.data.length > 0) {

        setTimeout(() => scrollToBottom('auto'), 0);
      }
    } catch (err) {
      setError('Failed to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageContent.trim() || !user) return;


    const matchIdToSend = selectedConversation?.match_id || activeMatchId;

    if (!matchIdToSend) {
      setError("Cannot send message: Match information is missing.");
      return;
    }

    const tempMessageId = Date.now(); 
    const optimisticMessage = {
      id: tempMessageId,
      content: newMessageContent,
      sender_id: user.id,
      sender: { id: user.id, name: user.name },
      created_at: new Date().toISOString(),
      conversation_id: activeConversationId 
    };


    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessageContent('');
    setTimeout(() => scrollToBottom('smooth'), 0);


    try {
      const sentMessage = await sendMessageToMatch(matchIdToSend, newMessageContent);

      setMessages(prev => prev.map(msg => msg.id === tempMessageId ? sentMessage : msg));
      

      if (onNewMessage) {
        onNewMessage(sentMessage); 
      }

    } catch (err) {
      setError('Failed to send message.');

      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current && chatContainerRef.current.scrollTop === 0 && hasMoreMessages && !loadingMessages) {
      fetchMessages(activeConversationId, currentPage + 1);
    }
  };


  if (!otherParticipant) {
    return <div className="chat-view-placeholder">Select a conversation or a match to start chatting.</div>;
  }

  return (
    <div className="chat-view">
      <header className="chat-view-header">
        <h3>Chat with {otherParticipant.name}</h3>
      </header>
      <div className="messages-container" ref={chatContainerRef} onScroll={handleScroll}>
        {loadingMessages && currentPage === 1 && <p>Loading messages...</p>}
        {error && <p className="error-message">{error}</p>}
         {loadingMessages && currentPage > 1 && <p className="loading-more-messages">Loading older messages...</p>}
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} isSender={msg.sender_id === user?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessageContent}
          onChange={(e) => setNewMessageContent(e.target.value)}
          placeholder="Type a message..."
          aria-label="Type a message"
        />
        <button type="submit" disabled={!newMessageContent.trim()}>Send</button>
      </form>
    </div>
  );
};

export default ChatView;