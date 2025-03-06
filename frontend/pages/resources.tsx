import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ResourceTable from '../components/ResourceTable';
import { getEC2Resources } from '../services/api';
import { Typography } from '@mui/material';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getEC2Resources();
        setResources(data.data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };
    fetchResources();
  }, []);

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        AWS Resources
      </Typography>
      <ResourceTable resources={resources} />
    </Layout>
  );
};

export default ResourcesPage;