import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import FurnitureItem from '../components/FurnitureItem';

const Dashboard = () => {
  const [designs, setDesigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const res = await axios.get('/api/designs');
      setDesigns(res.data);
    } catch (err) {
      console.error('Failed to fetch designs', err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    }
    navigate('/');
  };

  const handleNewDesign = () => {
    navigate('/design');
  };

  const handleEdit = (designId) => {
    navigate(`/design/${designId}`);
  };

  const handleDelete = async (designId) => {
    try {
      await axios.delete(`/api/designs/${designId}`);
      setDesigns(designs.filter(design => design._id !== designId));
    } catch (err) {
      console.error('Failed to delete design', err);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f7f1e3', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#6b4f35' }}>
          Furniture Designer Dashboard
        </Typography>
        <Button
          variant="outlined"
          onClick={handleLogout}
          sx={{ borderColor: '#6b4f35', color: '#6b4f35', '&:hover': { borderColor: '#5a4230', backgroundColor: '#f9f6f0' } }}
        >
          Logout
        </Button>
      </Box>

      <Typography variant="h5" sx={{ mb: 2, color: '#8b6f47' }}>
        Furniture Designer - Interactive 3D Scene
      </Typography>
      <Box sx={{ height: '400px', mb: 3 }}>
        <FurnitureItem />
      </Box>

      <Button
        variant="contained"
        onClick={handleNewDesign}
        sx={{ mb: 3, backgroundColor: '#6b4f35', '&:hover': { backgroundColor: '#5a4230' } }}
      >
        Create New Design
      </Button>

      <Typography variant="h5" sx={{ mb: 2, color: '#8b6f47' }}>
        Your Designs
      </Typography>

      <Grid container spacing={3}>
        {designs.map((design) => (
          <Grid item xs={12} sm={6} md={4} key={design._id}>
            <Card sx={{ backgroundColor: '#f9f6f0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#6b4f35' }}>
                  {design.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(design.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" sx={{ color: '#6b4f35' }} onClick={() => handleEdit(design._id)}>Edit</Button>
                <Button size="small" sx={{ color: '#6b4f35' }} onClick={() => handleDelete(design._id)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;