import React, { useState } from 'react';
import { AwsIcons } from './AwsIcons';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  InputAdornment,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ServicePaletteProps {
  onDragStart: (event: React.DragEvent, serviceType: string) => void;
}

const ServicePalette: React.FC<ServicePaletteProps> = ({ onDragStart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | false>('Compute');
  
  const categories = [
    {
      name: 'Compute',
      services: [
        { type: 'EC2', label: 'EC2 Instance' },
        { type: 'Lambda', label: 'Lambda Function' },
        { type: 'ECS', label: 'ECS' },
        { type: 'EKS', label: 'EKS' },
        { type: 'Fargate', label: 'Fargate' },
      ]
    },
    {
      name: 'Storage',
      services: [
        { type: 'S3', label: 'S3 Bucket' },
        { type: 'EBS', label: 'EBS Volume' },
        { type: 'EFS', label: 'EFS' },
      ]
    },
    {
      name: 'Database',
      services: [
        { type: 'RDS', label: 'RDS Database' },
        { type: 'DynamoDB', label: 'DynamoDB' },
        { type: 'ElastiCache', label: 'ElastiCache' },
        { type: 'Aurora', label: 'Aurora' },
      ]
    },
    {
      name: 'Networking',
      services: [
        { type: 'VPC', label: 'VPC' },
        { type: 'LoadBalancer', label: 'Load Balancer' },
        { type: 'CloudFront', label: 'CloudFront' },
        { type: 'APIGateway', label: 'API Gateway' },
        { type: 'Route53', label: 'Route 53' },
      ]
    },
    {
      name: 'Security',
      services: [
        { type: 'IAM', label: 'IAM' },
        { type: 'Cognito', label: 'Cognito' },
        { type: 'WAF', label: 'WAF' },
      ]
    },
    {
      name: 'Integration',
      services: [
        { type: 'SNS', label: 'SNS' },
        { type: 'SQS', label: 'SQS' },
        { type: 'EventBridge', label: 'EventBridge' },
      ]
    },
  ];

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedCategory(isExpanded ? panel : false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Filter services based on search query
  const filteredCategories = categories.map(category => ({
    ...category,
    services: category.services.filter(service => 
      service.label.toLowerCase().includes(searchQuery) || 
      service.type.toLowerCase().includes(searchQuery)
    )
  })).filter(category => category.services.length > 0);

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        width: '250px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        mr: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          AWS Services
        </Typography>
        
        <TextField
          fullWidth
          size="small"
          placeholder="Search services..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Divider />
      
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {filteredCategories.map((category) => (
          <Accordion 
            key={category.name}
            expanded={searchQuery ? true : expandedCategory === category.name}
            onChange={handleAccordionChange(category.name)}
            disableGutters
            elevation={0}
            sx={{ 
              '&:before': { display: 'none' },
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                minHeight: '48px',
                '& .MuiAccordionSummary-content': { margin: '8px 0' }
              }}
            >
              <Typography variant="subtitle2">{category.name}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              <List dense disablePadding>
                {category.services.map((service) => {
                  const Icon = AwsIcons[service.type];
                  return (
                    <ListItem
                      key={service.type}
                      sx={{
                        cursor: 'grab',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                        py: 0.5
                      }}
                      draggable
                      onDragStart={(event) => onDragStart(event, service.type)}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {Icon && <Icon style={{ width: 24, height: 24 }} />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={service.label}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Paper>
  );
};

export default ServicePalette;