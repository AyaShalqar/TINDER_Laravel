import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getConversations = async () => {
  try {
    const response = await api.get('/conversations');
    return response.data; // Expects { data: [conversations], links: ..., meta: ... } for pagination
  } catch (error) {
    console.error("Error fetching conversations:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getMessagesForConversation = async (conversationId, page = 1) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages?page=${page}`);
    return response.data; // Expects { data: [messages], links: ..., meta: ... }
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Backend expects match_id to find/create conversation
export const sendMessageToMatch = async (matchId, content) => {
  try {
    const response = await api.post(`/matches/${matchId}/messages`, { content });
    return response.data; // Expects the newly created message object
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// (Optional) If you ever have a direct conversation_id to send message to
export const sendMessageToConversation = async (conversationId, content) => {
  try {
    // NOTE: Your backend currently uses /matches/{match_id}/messages
    // If you add an endpoint like /conversations/{conversation_id}/messages, use it here
    // For now, this is a placeholder or would require backend changes.
    // Let's assume you will use sendMessageToMatch for now.
    const response = await api.post(`/conversations/${conversationId}/messages`, { content });
    return response.data;
  } catch (error) {
    console.error("Error sending message to conversation:", error.response?.data || error.message);
    throw error.response?.data || error;
  }

};


export default api;