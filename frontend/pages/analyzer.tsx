import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Button,
  Paper,
  Stepper, 
  Step, 
  StepLabel, 
  StepContent 
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';


ChartJS.register(ArcElement, Tooltip, Legend);

function Analyzer() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
  const [statusData, setStatusData] = useState({ labels: [], datasets: [] });
  const [errorAnalysis, setErrorAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [chatGPTResponse, setChatGPTResponse] = useState(null);
  const [generatingPPT, setGeneratingPPT] = useState(false);
  const [pptContent, setPptContent] = useState(null);  // Add this state

  useEffect(() => {
    fetchData();
  }, []);

  // Update the color theme in the charts
  const chartColors = ['#87CEEB', '#4FB3E8', '#1E90FF', '#00BFFF', '#00B2EE', '#0099CC'];

  const prepareChartData = (data) => {
    // Prepare category chart data
    const categoryCount = data.reduce((acc, check) => {
      acc[check.category] = (acc[check.category] || 0) + 1;
      return acc;
    }, {});

    const totalCategories = Object.values(categoryCount).reduce((a, b) => a + b, 0);
    const categoryChartData = {
      labels: Object.keys(categoryCount).map(key => 
        `${key} (${((categoryCount[key] / totalCategories) * 100).toFixed(1)}%)`
      ),
      datasets: [{
        data: Object.values(categoryCount),
        backgroundColor: chartColors
      }]
    };

    // Prepare status chart data
    const statusCount = data.reduce((acc, check) => {
      const status = check.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalStatus = Object.values(statusCount).reduce((a, b) => a + b, 0);
    const statusChartData = {
      labels: Object.keys(statusCount).map(key => 
        `${key} (${((statusCount[key] / totalStatus) * 100).toFixed(1)}%)`
      ),
      datasets: [{
        data: Object.values(statusCount),
        backgroundColor: chartColors.slice(0, 4)
      }]
    };

    setCategoryData(categoryChartData);
    setStatusData(statusChartData);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/checks');
      console.log("Raw API response:", response.data);
      
      const formattedData = response.data.map(check => ({
        ...check,
        id: check.id,
        result: check.result || {},
        status: check.result?.status || 'N/A', // Fix status mapping
        resourcesSummary: formatResourceSummary(check.result),
        lastUpdated: check.timestamp ? new Date(check.timestamp).toLocaleString() : 'N/A'
      }));
      
      console.log("Formatted data:", formattedData);
      setChecks(formattedData);
      prepareChartData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatResourceSummary = (result) => {
    if (!result || !result.resourcesSummary) return 'N/A';
    const { resourcesProcessed = 0, resourcesFlagged = 0 } = result.resourcesSummary;
    return `Total: ${resourcesProcessed}, Flagged: ${resourcesFlagged}`;
  };

  // Add after formatResourceSummary function and before columns definition
  // Add this new combined function
  const handleAnalyze = async () => {
    console.log("Starting analysis...");
    try {
      // Step 1: Analyze Errors
      const errorItems = checks
        .filter(check => {
          console.log("Check status:", check.status, typeof check.status);
          const status = String(check.status).toLowerCase();
          return status.includes('error') || status.includes('warning');
        })
        .map(check => ({
          checkName: check.name,
          category: check.category,
          resources: check.result.resourcesSummary || {},
          details: check.result.flaggedResources || [],
          timestamp: check.lastUpdated
        }));

      console.log("Filtered error items:", errorItems);
      setErrorAnalysis(errorItems);

      // Step 2: Send to ChatGPT
      setAnalyzing(true);
      const chatGPTResponse = await axios.post('http://localhost:8000/api/analysis/analyze-with-chatgpt', {
        errors: errorItems
      });
      setChatGPTResponse(chatGPTResponse.data);
      setAnalyzing(false);

      // Step 3: Generate PPT
      setGeneratingPPT(true);
      const structureResponse = await axios.post('http://localhost:8000/api/presentation/structure-ppt', {
        analysis: chatGPTResponse.data.analysis,
        errorCount: chatGPTResponse.data.error_count,
        timestamp: chatGPTResponse.data.timestamp
      });
      
      setPptContent(structureResponse.data);

      const response = await axios.post('http://localhost:8000/api/ppt/generate', 
        structureResponse.data,
        { responseType: 'blob' }
      );
      
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'AWS_Analysis.pptx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error('Error in analysis process:', error);
      setAnalyzing(false);
      setGeneratingPPT(false);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Check Name', width: 300 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'resourcesSummary', headerName: 'Resources', width: 200 },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 200 }
  ];


// Replace the three buttons with a single Analyze button
  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        height: '100vh', 
        width: '100%', 
        p: 2,
        fontFamily: '"Golos Text", sans-serif'  // Add default font family
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          backgroundColor: '#F8FBFF',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #87CEEB',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontFamily: '"Golos Text", sans-serif',
            fontWeight: 600,
            color: '#1E90FF',
            marginLeft: '1rem'
          }}>
            T-caT AI
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAnalyze}
            disabled={analyzing || generatingPPT}
            sx={{ 
              backgroundColor: '#1E90FF',
              '&:hover': {
                backgroundColor: '#0066CC'
              }
            }}
          >
            {analyzing ? 'Analyzing...' : generatingPPT ? 'Generating PPT...' : 'Analyze'}
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{
              backgroundColor: '#F8FBFF',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #87CEEB',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" align="center" sx={{ 
                fontFamily: '"Golos Text", sans-serif',
                color: '#1E90FF',
                mb: 2
              }}>
                Optimization Breakdown
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie 
                  data={categoryData}
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `Count: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }} 
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{
              backgroundColor: '#F8FBFF',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #87CEEB',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" align="center" sx={{ 
                fontFamily: '"Golos Text", sans-serif',
                color: '#1E90FF',
                mb: 2
              }}>
                Issue Severity Breakdown
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie 
                  data={statusData}
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `Count: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }} 
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Update DataGrid styles */}
        {checks && (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              backgroundColor: '#F8FBFF',
              padding: '0.8rem',
              borderRadius: '8px',
              border: '1px solid #87CEEB',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                fontFamily: '"Golos Text", sans-serif',
                color: '#1E90FF',
                fontWeight: 600,
                marginLeft: '0.8rem'
              }}>
                Critical Takeaways
              </Typography>
            </Box>
            <DataGrid
              rows={checks}
              columns={columns}
              loading={loading}
              components={{
                Toolbar: GridToolbar
              }}
              autoHeight
              density="comfortable"
              initialState={{
                pagination: {
                  pageSize: 10,
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              sx={{
                fontFamily: '"Golos Text", sans-serif',
                '& .MuiDataGrid-toolbarContainer': {
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  padding: '8px 0',
                  backgroundColor: '#E6F3FF',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#87CEEB',
                  color: '#000000',
                  fontWeight: 'bold',
                  fontFamily: '"Golos Text", sans-serif',
                },
                '& .MuiDataGrid-row:nth-of-type(even)': {
                  backgroundColor: '#F8FBFF',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#E6F3FF',
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                border: '1px solid #87CEEB',
                borderRadius: '8px',
                '& .MuiDataGrid-columnSeparator': {
                  display: 'none',
                },
              }}
            />
          </>
        )}

        {/* Update Typography components in ChatGPT Analysis */}
        {chatGPTResponse && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#1E90FF',
              fontFamily: '"Golos Text", sans-serif'
            }}>
              ChatGPT Analysis
            </Typography>
            <Box sx={{
              backgroundColor: '#F8FBFF',
              borderRadius: '8px',
              border: '1px solid #87CEEB',
              p: 3
            }}>
              <Stepper orientation="vertical" nonLinear>
                <Step active={true}>
                  <StepLabel>
                    <Typography variant="h6">Overview</Typography>
                  </StepLabel>
                  <StepContent>
                    <Paper elevation={0} sx={{ 
                      p: 2,
                      backgroundColor: 'transparent'
                    }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Analysis Time: {new Date(chatGPTResponse.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        Number of Issues Analyzed: {chatGPTResponse.error_count}
                      </Typography>
                    </Paper>
                  </StepContent>
                </Step>

                <Step active={true}>
                  <StepLabel>
                    <Typography variant="h6">Detailed Analysis</Typography>
                  </StepLabel>
                  <StepContent>
                    <Paper elevation={0} sx={{ 
                      p: 2,
                      backgroundColor: 'transparent'
                    }}>
                      <Typography 
                        component="div" 
                        sx={{ 
                          whiteSpace: 'pre-line',
                          fontFamily: 'monospace'
                        }}
                      >
                        {chatGPTResponse.analysis}
                      </Typography>
                    </Paper>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          </Box>
        )}

        {/* Update Typography components in PPT Preview */}
        {pptContent && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#1E90FF',
              fontFamily: '"Golos Text", sans-serif'
            }}>
              PowerPoint Preview
            </Typography>
            <Box sx={{ 
              backgroundColor: '#F8FBFF', 
              padding: '1rem', 
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '600px',
              border: '1px solid #87CEEB',
            }}>
              <Typography variant="h5" gutterBottom>
                {pptContent.title}
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 3 }}>Agenda</Typography>
              <Typography>{pptContent.agenda}</Typography>

              <Typography variant="h6" sx={{ mt: 3 }}>Key Findings</Typography>
              <ul>
                {pptContent.key_findings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>

              <Typography variant="h6" sx={{ mt: 3 }}>Recommendations</Typography>
              <ul>
                {pptContent.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>

              <Typography variant="h6" sx={{ mt: 3 }}>Conclusion</Typography>
              <Typography>{pptContent.conclusion}</Typography>

              <Typography variant="h6" sx={{ mt: 3 }}>Q&A Discussion Points</Typography>
              <ul>
                {pptContent.qa_points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Analyzer;
