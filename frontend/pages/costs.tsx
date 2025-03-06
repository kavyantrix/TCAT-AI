import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import CostChart from '../components/CostChart';
import { getCostSummary } from '../services/api';
import { Box, Typography } from '@mui/material';

const CostsPage = () => {
  const [costData, setCostData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCostSummary();
        setCostData(data);
      } catch (error) {
        console.error('Error fetching cost data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        AWS Cost Analysis
      </Typography>
      <Box sx={{ mt: 4 }}>
        {costData && <CostChart costData={costData} />}
      </Box>
    </Layout>
  );
};

export default CostsPage;