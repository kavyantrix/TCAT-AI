import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { askQuestion } from '../services/api';
import Layout from '../components/Layout';

const ChatbotPage = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await askQuestion(question);
      setAnswer(response.answer);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          AWS Cost Optimization Assistant
        </Typography>
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Ask about your AWS costs"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              margin="normal"
              placeholder="e.g., How can I reduce my EC2 costs?"
            />
            <Button 
              variant="contained" 
              type="submit" 
              disabled={loading}
              sx={{ marginTop: 2 }}
            >
              {loading ? 'Thinking...' : 'Ask'}
            </Button>
          </form>
        </Paper>
        {answer && (
          <Paper sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Answer:
            </Typography>
            <Typography>
              {answer}
            </Typography>
          </Paper>
        )}
      </Box>
    </Layout>
  );
};

export default ChatbotPage;