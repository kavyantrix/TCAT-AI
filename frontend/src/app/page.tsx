
import styles from './page.module.css'
import CostChart from '../../components/CostChart'

'use client';
import { useState } from 'react';
import { Box, Card, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/auth/validate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          accessKeyId: credentials.accessKeyId?.trim() || '',
          secretAccessKey: credentials.secretAccessKey?.trim() || ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid AWS credentials');
      }

      // Store only if validation successful
      sessionStorage.setItem('awsCredentials', JSON.stringify({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }));
      
      router.push('/insightsDashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      <Card sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Box sx={{ 
          mb: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Image
            src="/aws-logo.png"
            alt="AWS Logo"
            width={180}
            height={120}
            style={{ 
              cursor: 'pointer',
              objectFit: 'contain'
            }}
            onClick={() => setShowForm(true)}
          />
          
        </Box>

        {showForm && (
          <Box>
            <TextField
              fullWidth
              label="AWS Access Key ID"
              margin="normal"
              value={credentials.accessKeyId}
              onChange={(e) => setCredentials({...credentials, accessKeyId: e.target.value})}
            />
            <TextField
              fullWidth
              label="AWS Secret Access Key"
              margin="normal"
              type="password"
              value={credentials.secretAccessKey}
              onChange={(e) => setCredentials({...credentials, secretAccessKey: e.target.value})}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Validating...' : 'Connect to AWS'}
            </Button>
          </Box>
        )}

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Snackbar>
      </Card>
    </Box>
  );
}
