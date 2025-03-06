import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container, Button } from '@mui/material';
import { useRouter } from 'next/router';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AWS Cost Optimizer
          </Typography>
          <Button color="inherit" onClick={() => router.push('/costs')}>
            Costs
          </Button>
          <Button color="inherit" onClick={() => router.push('/resources')}>
            Resources
          </Button>
          <Button color="inherit" onClick={() => router.push('/chatbot')}>
            Chatbot
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;