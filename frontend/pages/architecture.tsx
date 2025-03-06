import React from 'react';
import Layout from '../components/Layout';
import { Box, Typography } from '@mui/material';
import dynamic from 'next/dynamic';

// Import the component dynamically with SSR disabled
// This is necessary because ReactFlow uses browser APIs
const ArchitectureDiagram = dynamic(
  () => import('../components/ArchitectureDiagram/ArchitectureDiagram'),
  { ssr: false }
);

const ArchitecturePage = () => {
  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500">
          TCAT Architecture Designer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Design your cloud architecture by dragging and dropping TCAT services
        </Typography>
      </Box>
      
      <ArchitectureDiagram />
    </Layout>
  );
};

export default ArchitecturePage;