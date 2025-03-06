import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import CostChart from '../components/CostChart';
import { getCostSummary } from '../services/api';
import { Box, Typography, CircularProgress } from '@mui/material';

const CostsPage = () => {
  const [costData, setCostData] = useState({
    dates: [],
    services: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Calculate date range for last 30 days
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        
        const response = await getCostSummary(startDate, endDate);
        
        // Transform the API response to match the CostChart component's expected format
        const transformedData = {
          dates: response.data.ResultsByTime.map((item: any) => item.TimePeriod.Start),
          services: response.data.ResultsByTime[0].Groups.map((group: any) => ({
            name: group.Keys[0],
            costs: response.data.ResultsByTime.map((timeItem: any) => {
              const serviceData = timeItem.Groups.find((g: any) => g.Keys[0] === group.Keys[0]);
              return parseFloat(serviceData?.Metrics.UnblendedCost.Amount || '0');
            })
          }))
        };
        
        setCostData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cost data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        AWS Cost Analysis
      </Typography>
      <Box sx={{ mt: 4 }}>
        <CostChart costData={costData} />
      </Box>
    </Layout>
  );
};

export default CostsPage;