'use client'

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Box, Paper, Typography } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CostData {
  dates: string[];
  services: {
    name: string;
    costs: number[];
  }[];
}

interface CostChartProps {
  costData: CostData;
}

const CostChart: React.FC<CostChartProps> = ({ costData }) => {
  const data = {
    labels: costData.dates,
    datasets: costData.services?.map((service, index) => ({
      label: service.name,
      data: service.costs,
      fill: false,
      borderColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
      tension: 0.1,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'AWS Cost Trend by Service',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cost (USD)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Cost Analysis
      </Typography>
      <Box sx={{ height: 400 }}>
        <Line options={options} data={data} />
      </Box>
    </Paper>
  );
};

export default CostChart;