import React, { useState } from 'react';
import { 
  Fab, 
  Dialog, 
  DialogContent, 
  IconButton,
  Box,
  TextField,
  Typography,
  Avatar,
  InputAdornment
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { askQuestion } from '../services/api';

const FloatingChatbot = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([{
    type: 'bot',
    text: 'Hey there! Need answers or help with your AWS costs? I\'ve got you covered! Just type what you need, and let\'s dive into making things happen.'
  }]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setMessages(prev => [...prev, { type: 'user', text: userQuestion }]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await askQuestion(userQuestion);
      setMessages(prev => [...prev, { type: 'bot', text: response.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
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
        <ChatIcon />
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
            width: 400,
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
            <ChatIcon />
          </Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AWS Cost Assistant
          </Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: '#fff'
        }}>
          <Box sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {message.type === 'bot' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 32,
                      height: 32,
                      mr: 1
                    }}
                  >
                    <ChatIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: '70%',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: message.type === 'user' ? 'primary.main' : '#f0f2f5',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2">
                    {message.text}
                  </Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            )}
          </Box>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      type="submit" 
                      color="primary" 
                      disabled={loading || !question.trim()}
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { 
                  bgcolor: '#f8f9fa',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.1)' }
                }
              }}
            />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingChatbot;