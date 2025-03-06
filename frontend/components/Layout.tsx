import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Container, 
  Button,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { useRouter } from 'next/router';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import ChatIcon from '@mui/icons-material/Chat';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LabelIcon from '@mui/icons-material/Label';
import FloatingChatbot from './FloatingChatbot';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const showFloatingChat = router.pathname !== '/chatbot';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '1.5rem'
              }}
            >
              AWS Cost Optimizer
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                color="primary"
                startIcon={<DashboardIcon />}
                onClick={() => router.push('/costs')}
                variant={router.pathname === '/costs' ? 'contained' : 'text'}
              >
                Costs
              </Button>
              <Button
                color="primary"
                startIcon={<StorageIcon />}
                onClick={() => router.push('/resources')}
                variant={router.pathname === '/resources' ? 'contained' : 'text'}
              >
                Resources
              </Button>
              <Button
                color="primary"
                startIcon={<LightbulbIcon />}
                onClick={() => router.push('/advisor')}
                variant={router.pathname === '/advisor' ? 'contained' : 'text'}
              >
                Advisor
              </Button>
              <Button
                color="primary"
                startIcon={<LabelIcon />}
                onClick={() => router.push('/tags')}
                variant={router.pathname === '/tags' ? 'contained' : 'text'}
              >
                Tags
              </Button>
              <Button
                color="primary"
                startIcon={<ChatIcon />}
                onClick={() => router.push('/chatbot')}
                variant={router.pathname === '/chatbot' ? 'contained' : 'text'}
              >
                Chatbot
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: 'background.default',
            py: 4,
            px: 2
          }}
        >
          <Container maxWidth="lg">
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                backgroundColor: 'white',
                minHeight: 'calc(100vh - 200px)'
              }}
            >
              {children}
            </Paper>
          </Container>
        </Box>
        {showFloatingChat && <FloatingChatbot />}
      </Box>
    </ThemeProvider>
  );
};

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Resources', icon: <StorageIcon />, path: '/resources' },
  { text: 'Costs', icon: <AttachMoneyIcon />, path: '/costs' },
  { text: 'Advisor', icon: <LightbulbIcon />, path: '/advisor' },
  { text: 'Tags', icon: <LabelIcon />, path: '/tags' },
];

export default Layout;