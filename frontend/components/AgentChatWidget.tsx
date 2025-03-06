import React, { useState, useRef, useEffect } from 'react';
import { 
  Fab, 
  Dialog, 
  DialogContent, 
  IconButton,
  Box,
  TextField,
  Typography,
  Avatar,
  InputAdornment,
  CircularProgress,
  Paper
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

interface Message {
  type: 'user' | 'bot';
  text: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

const AgentChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    type: 'bot',
    text: 'Hi there! I\'m your TCAT Cost Optimization Assistant. Ask me anything about your AWS resources and costs!'
  }]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setMessages(prev => [...prev, { type: 'user', text: userQuestion }]);
    setQuestion('');
    setLoading(true);

    try {
      // Using POST request instead of GET
      const response = await axios.post(`${API_BASE_URL}/agent/chat`, {
        query: userQuestion
      });
      
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: response.data.response || 'Sorry, I couldn\'t process that request.'
      }]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        onClick={() => setOpen(true)}
      >
        <AutoAwesomeIcon />
      </Fab>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: { 
            position: 'fixed', 
            right: 32, 
            bottom: 32, 
            m: 0, 
            height: 600,
            width: 600,  // Changed from 400 to 500
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ 
          bgcolor: '#f8f9fa', 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <AutoAwesomeIcon />
          </Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TCAT Cost Assistant
          </Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ 
          p: 0, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%'
        }}>
          <Box sx={{ 
            flexGrow: 1, 
            p: 2, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {messages.map((message, index) => (
              <Box 
                key={index} 
                sx={{ 
                  alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%'  // Changed from 80% to 90%
                }}
              >
                <Paper 
                  elevation={1}
                  sx={{ 
                    p: 2, 
                    bgcolor: message.type === 'user' ? 'primary.main' : '#f1f3f4',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2
                  }}
                >
                  {message.type === 'bot' ? (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  ) : (
                    <Typography>{message.text}</Typography>
                  )}
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{ 
              p: 2, 
              borderTop: '1px solid rgba(0,0,0,0.1)',
              bgcolor: '#f8f9fa'
            }}
          >
            <TextField
              fullWidth
              placeholder="Ask about your AWS costs..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      type="submit" 
                      disabled={!question.trim() || loading}
                      color="primary"
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AgentChatWidget;