import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography
} from '@mui/material';

interface CostTableProps {
  costData: {
    dates: string[];
    services: Array<{
      name: string;
      costs: number[];
    }>;
  };
}

const CostTable: React.FC<CostTableProps> = ({ costData }) => {
  const calculateTotalForService = (costs: number[]) => {
    return costs.reduce((sum, cost) => sum + cost, 0).toFixed(2);
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="cost analysis table">
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Service</TableCell>
            {costData.dates.map((date, index) => (
              <TableCell key={index} align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                {new Date(date).toLocaleDateString()}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {costData.services.map((service, index) => (
            <TableRow
              key={index}
              sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
            >
              <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                {service.name}
              </TableCell>
              {service.costs.map((cost, costIndex) => (
                <TableCell key={costIndex} align="right">
                  ${cost.toFixed(2)}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                ${calculateTotalForService(service.costs)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ bgcolor: 'grey.100' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Daily Total</TableCell>
            {costData.dates.map((_, dateIndex) => (
              <TableCell key={dateIndex} align="right" sx={{ fontWeight: 'bold' }}>
                ${costData.services
                  .reduce((sum, service) => sum + service.costs[dateIndex], 0)
                  .toFixed(2)}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ${costData.services
                .reduce((total, service) => 
                  total + service.costs.reduce((sum, cost) => sum + cost, 0), 0)
                .toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CostTable;