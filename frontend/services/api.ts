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

export const getEc2Instances = async () => {
  const response = await api.get('/resources/ec2');
  return response.data;
};

export const getTrustedAdvisorRecommendations = async () => {
  const response = await api.get('/advisor/recommendations');
  return response.data;
};

export const getTrustedAdvisorDetails = async () => {
  const response = await api.get('/advisor/details');
  return response.data;
};

export const askQuestion = async (question: string) => {
  const response = await api.post('/chatbot/ask', { question });
  return response.data;
};

export const getTaggedResources = async () => {
  const response = await api.get('/tags/resources');
  return response.data;
};