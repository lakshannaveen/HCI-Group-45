import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, Card, CardContent, CardActions, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import FurnitureItem from '../components/FurnitureItem';
import AppSidebar from '../components/AppSidebar';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Design Tool', path: '/design' },
];

const Dashboard = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'success' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDesigns();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (text, severity = 'success') => {
    setMessage({ text, severity });
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchDesigns = async () => {
    try {
      const res = await axios.get('/api/designs');
      setDesigns(res.data);
    } catch (err) {
      console.error('Failed to fetch designs', err);
      showMessage('Failed to fetch designs', 'error');
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    try {
      await axios.post('/api/auth/logout');
      showMessage('Logged out successfully');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/');
    }
  };

  const handleDeleteDesign = async (id) => {
    if (loading) return;
    if (!window.confirm('Are you sure you want to delete this design?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/designs/${id}`);
      showMessage('Design deleted successfully');
      fetchDesigns();
    } catch (err) {
      console.error('Failed to delete design', err);
      showMessage('Failed to delete design', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'var(--canvas-base)', minHeight: '100vh' }}>
      <AppSidebar navItems={NAV_ITEMS} onLogout={handleLogout} />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" sx={{ color: 'var(--text-high)', mb: 3 }}>
          Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'var(--surface-1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'var(--text-high)' }}>
                  Total Designs
                </Typography>
                <Typography variant="h4" sx={{ color: 'var(--brand-primary)' }}>
                  {designs.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'var(--surface-1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'var(--text-high)' }}>
                  Active Projects
                </Typography>
                <Typography variant="h4" sx={{ color: 'var(--brand-primary)' }}>
                  {designs.filter(d => new Date(d.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" sx={{ mb: 2, color: 'var(--brand-primary)' }}>
          Furniture Designer — Interactive 3D Scene
        </Typography>
        <Box sx={{ height: '400px', mb: 3 }}>
          <FurnitureItem />
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/design')}
          sx={{ mb: 3 }}
        >
          Create New Design
        </Button>

        <Typography variant="h5" sx={{ mb: 2, color: 'var(--brand-primary)' }}>
          Your Designs
        </Typography>

        <Grid container spacing={3}>
          {designs.map((design) => (
            <Grid item xs={12} sm={6} md={4} key={design._id}>
              <Card sx={{ backgroundColor: 'var(--surface-1)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'var(--text-high)' }}>
                    {design.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(design.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ color: 'var(--brand-primary)' }}
                    onClick={() => navigate(`/design/${design._id}`)}
                    disabled={loading}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ color: 'var(--color-error)', '&:hover': { backgroundColor: 'rgba(207,102,121,0.08)' } }}
                    onClick={() => handleDeleteDesign(design._id)}
                    disabled={loading}
                  >
                    {loading ? 'Deleting…' : 'Delete'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
