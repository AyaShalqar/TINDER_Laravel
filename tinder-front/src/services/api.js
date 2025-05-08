import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

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
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getMessagesForConversation = async (conversationId, page = 1) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages?page=${page}`);
    return response.data; 
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

  
export const sendMessageToMatch = async (matchId, content) => {
  try {
    const response = await api.post(`/matches/${matchId}/messages`, { content });
    return response.data; 
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const sendMessageToConversation = async (conversationId, content) => {
  try {

    const response = await api.post(`/conversations/${conversationId}/messages`, { content });
    return response.data;
  } catch (error) {
    console.error("Error sending message to conversation:", error.response?.data || error.message);
    throw error.response?.data || error;
  }

};


export default api;