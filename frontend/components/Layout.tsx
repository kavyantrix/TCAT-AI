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
import AgentChatWidget from './AgentChatWidget';
// Add this import
import ArchitectureIcon from '@mui/icons-material/Architecture';

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
                fontSize: '1.5rem',
                cursor: 'pointer' // Add cursor pointer
              }}
              onClick={() => router.push('/insightsDashboard')} // Add click handler
            >
              TCAT Cost Optimizer
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                color="primary"
                startIcon={<DashboardIcon />}
                onClick={() => router.push('/insightsDashboard')}
                variant={router.pathname === '/insightsDashboard' ? 'contained' : 'text'}
              >
                Dashboard
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
                startIcon={<StorageIcon />}
                onClick={() => router.push('/tags')}
                variant={router.pathname === '/tags' ? 'contained' : 'text'}
              >
                Resources
              </Button>
              <Button
                color="primary"
                startIcon={<ArchitectureIcon />}
                onClick={() => router.push('/architecture')}
                variant={router.pathname === '/architecture' ? 'contained' : 'text'}
              >
                Architecture
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
            {children}
          </Container>
        </Box>
      </Box>
  <AgentChatWidget />
    </ThemeProvider>
  );
};

export default Layout;