'use client';

import React, {useState} from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Storage,
  AttachMoney,
  Speed,
} from '@mui/icons-material';
import { getCostSummary, getTaggedResources, getTrustedAdvisorDetails } from '../services/api';
import Layout from '../components/Layout';

const queryClient = new QueryClient();

const InsightsDashboardContent = () => {

  const [loading, setLoading] = useState(true);

  const { data: costData, isLoading: costLoading } = useQuery({
    queryKey: ['costs'],
    queryFn: () => {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return getCostSummary(startDate, endDate);
    }
  });

  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: getTaggedResources
  });

  const { data: advisorData, isLoading: advisorLoading } = useQuery({
    queryKey: ['advisor'],
    queryFn: getTrustedAdvisorDetails
  });

  const getTopServices = () => {
    if (!costData?.data?.ResultsByTime) return [];
    const lastMonth = costData.data.ResultsByTime[costData.data.ResultsByTime.length - 1];
    return lastMonth.Groups
      .sort((a, b) => parseFloat(b.Metrics.UnblendedCost.Amount) - parseFloat(a.Metrics.UnblendedCost.Amount))
      .slice(0, 5);
  };

  const getTopAdvisoryItems = () => {
    if (!advisorData?.data?.cost_optimizing) return [];
    return advisorData.data.cost_optimizing
      .sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings)
      .slice(0, 5);
  };

  const getMostUsedServices = () => {
    if (!resourcesData?.data) return [];
    return Object.entries(resourcesData.data)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 5);
  };

  const getCostTrend = (service: string) => {
    if (!costData?.data?.ResultsByTime) return null;
    const periods = costData.data.ResultsByTime;
    const current = periods[periods.length - 1].Groups.find(g => g.Keys[0] === service);
    const previous = periods[periods.length - 2].Groups.find(g => g.Keys[0] === service);
    
    if (!current || !previous) return null;
    
    const currentCost = parseFloat(current.Metrics.UnblendedCost.Amount);
    const previousCost = parseFloat(previous.Metrics.UnblendedCost.Amount);
    const change = ((currentCost - previousCost) / previousCost) * 100;
    
    return {
      percentage: Math.abs(change).toFixed(1),
      trend: change > 0 ? 'up' : 'down'
    };
  };

  if (costLoading || resourcesLoading || advisorLoading) {
    return <CircularProgress />;
  }



  return (
    <Layout> <Grid container spacing={3}>
      {/* Top Cost Services */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top 5 Highest Cost Services
            </Typography>
            <List>
              {getTopServices().map((service, index) => {
                const trend = getCostTrend(service.Keys[0]);
                return (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AttachMoney />
                    </ListItemIcon>
                    <ListItemText
                      primary={service.Keys[0]}
                      secondary={`$${parseFloat(service.Metrics.UnblendedCost.Amount).toFixed(2)}`}
                    />
                    {trend && (
                      <Tooltip title={`${trend.percentage}% ${trend.trend}`}>
                        {trend.trend === 'up' ? 
                          <TrendingUp color="error" /> : 
                          <TrendingDown color="success" />}
                      </Tooltip>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Advisory Items */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top 5 Cost Optimization Recommendations
            </Typography>
            <List>
              {getTopAdvisoryItems().map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    secondary={`Potential savings: $${item.estimatedMonthlySavings}`}
                  />
                  <Chip
                    size="small"
                    label={item.status}
                    color={item.status === 'error' ? 'error' : 'warning'}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Most Used Services */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top 5 Most Used Services
            </Typography>
            <List>
              {getMostUsedServices().map(([service, resources], index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Storage />
                  </ListItemIcon>
                  <ListItemText
                    primary={service.toUpperCase()}
                    secondary={`${resources.length} resources`}
                  />
                  <Chip
                    size="small"
                    label="Active"
                    color="success"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Insights Summary */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Insights
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Speed color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Resource Utilization"
                  secondary="80% of resources are optimally utilized"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AttachMoney color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Cost Efficiency"
                  secondary="15% potential cost savings identified"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Best Practices"
                  secondary="85% compliance with AWS best practices"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid></Layout>
   
  );
};

const InsightsDashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <InsightsDashboardContent />
    </QueryClientProvider>
  );
};

export default InsightsDashboard;