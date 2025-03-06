import React from 'react';

// AWS Service Icons as SVG components
export const AwsIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  EC2: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#FF9900" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">EC2</text>
    </svg>
  ),
  S3: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#569A31" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">S3</text>
    </svg>
  ),
  RDS: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#3B48CC" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">RDS</text>
    </svg>
  ),
  VPC: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#FF4F8B" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">VPC</text>
    </svg>
  ),
  LoadBalancer: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#8C4FFF" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">ELB</text>
    </svg>
  ),
  Lambda: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#FF9900" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">λ</text>
    </svg>
  ),
  DynamoDB: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#4D27AA" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">DDB</text>
    </svg>
  ),
  CloudFront: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#8C4FFF" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">CF</text>
    </svg>
  ),
  
  // Additional compute services
  ECS: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#FF9900" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">ECS</text>
    </svg>
  ),
  EKS: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#FF9900" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">EKS</text>
    </svg>
  ),
  Fargate: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#FF9900" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">FG</text>
    </svg>
  ),
  
  // Additional storage services
  EBS: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#569A31" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">EBS</text>
    </svg>
  ),
  EFS: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#569A31" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">EFS</text>
    </svg>
  ),
  
  // Additional database services
  Aurora: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#3B48CC" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">AUR</text>
    </svg>
  ),
  ElastiCache: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#3B48CC" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">EC</text>
    </svg>
  ),
  
  // Additional networking services
  APIGateway: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#8C4FFF" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">API</text>
    </svg>
  ),
  Route53: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#8C4FFF" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">R53</text>
    </svg>
  ),
  
  // Security services
  IAM: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#DD344C" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">IAM</text>
    </svg>
  ),
  Cognito: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#DD344C" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">COG</text>
    </svg>
  ),
  WAF: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#DD344C" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">WAF</text>
    </svg>
  ),
  
  // Integration services
  SNS: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#FF4F8B" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">SNS</text>
    </svg>
  ),
  SQS: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#FF4F8B" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">SQS</text>
    </svg>
  ),
  EventBridge: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="40" height="40" {...props}>
      <rect width="40" height="40" rx="5" fill="#FF4F8B" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">EB</text>
    </svg>
  ),
};

export const serviceColors: Record<string, string> = {
  // Existing colors
  EC2: '#FF9900',
  S3: '#569A31',
  RDS: '#3B48CC',
  VPC: '#FF4F8B',
  LoadBalancer: '#8C4FFF',
  Lambda: '#FF9900',
  DynamoDB: '#4D27AA',
  CloudFront: '#8C4FFF',
  
  // New colors for added services
  ECS: '#FF9900',
  EKS: '#FF9900',
  Fargate: '#FF9900',
  EBS: '#569A31',
  EFS: '#569A31',
  Aurora: '#3B48CC',
  ElastiCache: '#3B48CC',
  APIGateway: '#8C4FFF',
  Route53: '#8C4FFF',
  IAM: '#DD344C',
  Cognito: '#DD344C',
  WAF: '#DD344C',
  SNS: '#FF4F8B',
  SQS: '#FF4F8B',
  EventBridge: '#FF4F8B',
};