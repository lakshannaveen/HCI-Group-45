import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Design = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3, backgroundColor: '#f7f1e3', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#6b4f35' }}>
          Design Studio
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
          sx={{ borderColor: '#6b4f35', color: '#6b4f35', '&:hover': { borderColor: '#5a4230', backgroundColor: '#f9f6f0' } }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Paper sx={{ p: 3, backgroundColor: '#f9f6f0', minHeight: '60vh' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#8b6f47' }}>
          Design Canvas (2D/3D View)
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b4f35' }}>
          This is where the furniture design interface will be implemented.
          Features will include:
          - Room setup (size, shape, color)
          - Furniture placement (chairs, tables)
          - 2D and 3D visualization
          - Color and scale adjustments
        </Typography>
      </Paper>
    </Box>
  );
};

export default Design;