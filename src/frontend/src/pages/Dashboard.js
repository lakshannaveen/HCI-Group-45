import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, Card, CardContent, CardActions, List, ListItem, ListItemText, Divider } from '@mui/material';
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

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f7f1e3', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ width: 250, backgroundColor: '#f9f6f0', p: 2, borderRight: '1px solid #d4c5a9' }}>
        <Typography variant="h6" sx={{ color: '#6b4f35', mb: 2 }}>
          Athlier Home
        </Typography>
        <List>
          <ListItem button onClick={() => navigate('/dashboard')}>
            <ListItemText primary="Dashboard" sx={{ color: '#6b4f35' }} />
          </ListItem>
          <ListItem button onClick={() => navigate('/design')}>
            <ListItemText primary="New Design" sx={{ color: '#6b4f35' }} />
          </ListItem>
          <Divider sx={{ my: 2 }} />
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" sx={{ color: '#6b4f35' }} />
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" sx={{ color: '#6b4f35', mb: 3 }}>
          Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#f9f6f0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#6b4f35' }}>
                  Total Designs
                </Typography>
                <Typography variant="h4" sx={{ color: '#8b6f47' }}>
                  {designs.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#f9f6f0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#6b4f35' }}>
                  Active Projects
                </Typography>
                <Typography variant="h4" sx={{ color: '#8b6f47' }}>
                  {designs.filter(d => new Date(d.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
                  <Button size="small" sx={{ color: '#6b4f35' }}>Edit</Button>
                  <Button size="small" sx={{ color: '#6b4f35' }}>Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;