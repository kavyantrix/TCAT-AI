import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCostSummary = async (startDate: string, endDate: string) => {
  const response = await api.get('/costs/summary', {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

export const getEC2Resources = async () => {
  const response = await api.get('/resources/ec2');
  return response.data;
};

export const getTrustedAdvisorRecommendations = async () => {
  const response = await api.get('/advisor/recommendations');
  return response.data;
};

export const askQuestion = async (question: string) => {
  const response = await api.post('/chatbot/ask', { question });
  return response.data;
};