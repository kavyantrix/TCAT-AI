import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import ComputerIcon from '@mui/icons-material/Computer';
import CloudIcon from '@mui/icons-material/Cloud';
import DatabaseIcon from '@mui/icons-material/Storage';
import { getEc2Instances } from '../services/api';

interface ResourceCounts {
  [key: string]: number;
}

const ResourcesPage = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getEc2Instances();
        setResources(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'EC2':
        return <ComputerIcon />;
      case 'S3':
        return <StorageIcon />;
      case 'RDS':
        return <DatabaseIcon />;
      default:
        return <CloudIcon />;
    }
  };

  const getResourceCounts = (): ResourceCounts => {
    const counts: ResourceCounts = {
      'EC2 Instances': resources.filter(r => r.state === 'running').length,
      'Stopped Instances': resources.filter(r => r.state === 'stopped').length,
      'Total Instances': resources.length
    };
    return counts;
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

  const resourceCounts = getResourceCounts();

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500">
          AWS Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your AWS infrastructure resources
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(resourceCounts).map(([name, count]) => (
          <Grid item xs={12} md={4} key={name}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getServiceIcon('EC2')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{name}</Typography>
                    <Typography variant="h4" color="primary.main">
                      {count}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Instance Details
          </Typography>
          <List>
            {resources.map((instance, index) => (
              <React.Fragment key={instance.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: instance.state === 'running' ? 'success.main' : 'error.main' }}>
                      <ComputerIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {instance.id}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={instance.state}
                          color={instance.state === 'running' ? 'success' : 'error'}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Type: {instance.type}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Launch Time: {new Date(instance.launch_time).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < resources.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
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

export default ResourcesPage;