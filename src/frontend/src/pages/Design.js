import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, TextField, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Design = () => {
  const navigate = useNavigate();

  // Room configuration state
  const [roomData, setRoomData] = useState({ width: 10, height: 10, color: '#ffffff' });
  const [furnitureList, setFurnitureList] = useState([]); // This will eventually hold the 3D items
  const [currentDesignId, setCurrentDesignId] = useState(null);

  // Load design on page load
  useEffect(() => {
    const loadDesign = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/designs', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const designs = await response.json();
          if (designs.length > 0) {
            const design = designs[0]; // Load first design
            setCurrentDesignId(design._id);
            setRoomData(design.roomData || { width: 10, height: 10, color: '#ffffff' });
            setFurnitureList(design.furniture || []);
          }
        }
      } catch (error) {
        console.error('Error loading design:', error);
      }
    };

    loadDesign();
  }, []);

  // Handle save design
  const handleSave = async () => {
    try {
      const designData = {
        name: 'My Design', // You can add a name input field later
        roomData: {
          width: roomData.width,
          height: roomData.height,
          color: roomData.color
        },
        furniture: furnitureList
      };

      const response = await fetch('http://localhost:5000/api/designs', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(designData)
      });

      if (response.ok) {
        const savedDesign = await response.json();
        setCurrentDesignId(savedDesign._id);
        console.log('Design saved successfully:', savedDesign);
        alert('Design saved successfully!');
      } else {
        console.error('Failed to save design');
        alert('Failed to save design. Please try again.');
      }
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Error saving design. Please try again.');
    }
  };

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