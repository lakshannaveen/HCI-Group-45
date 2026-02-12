import React, { useState } from 'react';
import { Box, Button, Typography, Paper, TextField, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Design = () => {
  const navigate = useNavigate();

  // Room configuration state
  const [roomData, setRoomData] = useState({ width: 10, height: 10, color: '#ffffff' });
  const [furnitureList, setFurnitureList] = useState([]); // This will eventually hold the 3D items

  // Handle room data changes
  const handleRoomDataChange = (field, value) => {
    setRoomData(prev => ({ ...prev, [field]: value }));
  };

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

      <Grid container spacing={3} sx={{ minHeight: '60vh' }}>
        {/* Room Configuration Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: '#f9f6f0', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#8b6f47' }}>
              Room Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Width"
                type="number"
                value={roomData.width}
                onChange={(e) => handleRoomDataChange('width', parseFloat(e.target.value) || 0)}
                fullWidth
              />
              <TextField
                label="Height"
                type="number"
                value={roomData.height}
                onChange={(e) => handleRoomDataChange('height', parseFloat(e.target.value) || 0)}
                fullWidth
              />
              <TextField
                label="Room Color"
                type="color"
                value={roomData.color}
                onChange={(e) => handleRoomDataChange('color', e.target.value)}
                fullWidth
                sx={{ '& input': { height: 56 } }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Design Canvas */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, backgroundColor: '#f9f6f0', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#8b6f47' }}>
              Design Canvas (2D/3D View)
            </Typography>
            {/* Placeholder for 3D Canvas - passing props */}
            <Box sx={{ 
              border: '2px dashed #8b6f47', 
              height: '400px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: roomData.color,
              color: '#6b4f35'
            }}>
              <Typography variant="body1">
                3D Canvas Placeholder<br/>
                Room Size: {roomData.width} x {roomData.height}<br/>
                Furniture Items: {furnitureList.length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Design;