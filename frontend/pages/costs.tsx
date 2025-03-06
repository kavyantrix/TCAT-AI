import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import CostChart from '../components/CostChart';
import CostTable from '../components/CostTable';
import { getCostSummary } from '../services/api';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DateRangeIcon from '@mui/icons-material/DateRange';

const CostsPage = () => {
  const [costData, setCostData] = useState({
    dates: [],
    services: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  const calculateTotalCost = () => {
    if (!costData.services.length) return 0;
    return costData.services.reduce((total, service) => 
      total + service.costs.reduce((sum, cost) => sum + cost, 0), 0
    ).toFixed(2);
  };

  const getTopService = () => {
    if (!costData.services.length) return null;
    return costData.services.reduce((max, service) => {
      const totalCost = service.costs.reduce((sum, cost) => sum + cost, 0);
      return totalCost > max.cost ? { name: service.name, cost: totalCost } : max;
    }, { name: '', cost: 0 });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000)
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
  }, [timeRange]);

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const topService = getTopService();

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500">
          AWS Cost Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and analyze your AWS spending patterns
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Cost
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon sx={{ fontSize: 40 }} />
                <Typography variant="h3">
                  ${calculateTotalCost()}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Last {timeRange} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Highest Cost Service
              </Typography>
              {topService && (
                <>
                  <Typography variant="h5" color="primary">
                    {topService.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    ${topService.cost.toFixed(2)}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Time Range
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  size="small"
                >
                  <MenuItem value="7">Last 7 days</MenuItem>
                  <MenuItem value="30">Last 30 days</MenuItem>
                  <MenuItem value="90">Last 90 days</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cost Trends
          </Typography>
          <Box sx={{ height: 400 }}>
            <CostChart costData={costData} />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cost Breakdown by Service
          </Typography>
          <CostTable costData={costData} />
        </CardContent>
      </Card>

      {error && (
        <Box sx={{ p: 3 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}
    </Layout>
  );
};

export default CostsPage;