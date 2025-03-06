import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getTaggedResources } from '../services/api';

const TagsPage = () => {
  const [resources, setResources] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getTaggedResources();
        setResources(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tagged resources');
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

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500">
          Tagged Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of AWS resources and their tags
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {Object.entries(resources).map(([resourceType, items]: [string, any[]]) => (
          <Grid item xs={12} key={resourceType}>
            <Accordion defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6">{resourceType}</Typography>
                  <Chip label={`${items.length} resources`} color="primary" size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Resource ARN</TableCell>
                        <TableCell>Tags</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((resource: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell sx={{ maxWidth: '400px', wordBreak: 'break-all' }}>
                            {resource.arn}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {resource.tags.map((tag: any, tagIndex: number) => (
                                <Chip
                                  key={tagIndex}
                                  label={`${tag.Key}: ${tag.Value}`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export default TagsPage;