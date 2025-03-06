import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import StorageIcon from '@mui/icons-material/Storage';
import { getTrustedAdvisorDetails } from '../services/api';

const categoryIcons: { [key: string]: JSX.Element } = {
  cost_optimizing: <AttachMoneyIcon />,
  security: <SecurityIcon />,
  fault_tolerance: <WarningIcon />,
  performance: <SpeedIcon />,
  service_limits: <StorageIcon />
};

const categoryTitles: { [key: string]: string } = {
  cost_optimizing: 'Cost Optimization',
  security: 'Security',
  fault_tolerance: 'Fault Tolerance',
  performance: 'Performance',
  service_limits: 'Service Limits'
};

const AdvisorPage = () => {
  const [advisorData, setAdvisorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getTrustedAdvisorDetails();
        setAdvisorData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch advisor data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500">
          AWS Trusted Advisor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Recommendations and best practices for your AWS infrastructure
        </Typography>
      </Box>

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {Object.entries(advisorData || {}).map(([category, checks]: [string, any]) => (
            <Grid item xs={12} key={category}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    {categoryIcons[category]}
                    <Typography variant="h6">{categoryTitles[category]}</Typography>
                  </Box>
                  
                  {checks.map((check: any) => (
                    <Accordion key={check.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Typography sx={{ flexGrow: 1 }}>{check.name}</Typography>
                          <Chip 
                            label={check.status} 
                            color={getStatusColor(check.status)}
                            size="small"
                          />
                          {check.estimatedMonthlySavings && (
                            <Chip
                              label={`Potential Savings: $${check.estimatedMonthlySavings}`}
                              color="primary"
                              size="small"
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography color="text.secondary" paragraph>
                          {check.description}
                        </Typography>
                        {check.resourcesSummary && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Resource Summary:
                            </Typography>
                            <Grid container spacing={2}>
                              {Object.entries(check.resourcesSummary).map(([key, value]: [string, any]) => (
                                <Grid item xs={6} md={3} key={key}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Typography variant="caption" color="text.secondary">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </Typography>
                                      <Typography variant="h6">
                                        {value}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Layout>
  );
};

export default AdvisorPage;