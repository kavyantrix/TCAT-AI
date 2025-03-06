import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

interface Resource {
  id: string;
  type: string;
  state: string;
  launch_time: string;
}

interface ResourceTableProps {
  resources: Resource[];
}

const ResourceTable: React.FC<ResourceTableProps> = ({ resources }) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        AWS Resources
      </Typography>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Launch Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>{resource.id}</TableCell>
                <TableCell>{resource.type}</TableCell>
                <TableCell>{resource.state}</TableCell>
                <TableCell>
                  {new Date(resource.launch_time).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ResourceTable;