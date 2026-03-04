import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, Card, CardContent, CardActions, List, ListItem, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axios';
import FurnitureItem from '../components/FurnitureItem';

const Dashboard = () => {
  const [designs, setDesigns] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Edit dialog state
  const [editingDesign, setEditingDesign] = useState(null);
  const [editName, setEditName] = useState('');
  // Delete confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const openEdit = (design) => {
    setEditingDesign(design);
    setEditName(design.name || '');
  };

  const closeEdit = () => {
    setEditingDesign(null);
    setEditName('');
  };

  const handleSaveEdit = async () => {
    if (!editingDesign) return;
    try {
      const res = await axios.put(`/api/designs/${editingDesign._id}`, { name: editName });
      // update local list
      setDesigns((prev) => prev.map(d => d._id === res.data._id ? res.data : d));
      closeEdit();
    } catch (err) {
      console.error('Failed to save design name', err);
      alert('Failed to save changes');
    }
  };

  const handleDelete = (id) => {
    setConfirmTarget(id);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const performDelete = async () => {
    if (!confirmTarget) return;
    try {
      await axios.delete(`/api/designs/${confirmTarget}`);
      setDesigns((prev) => prev.filter(d => d._id !== confirmTarget));
      closeConfirm();
    } catch (err) {
      console.error('Failed to delete design', err);
      alert('Delete failed');
      closeConfirm();
    }
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f7f1e3', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ width: 250, backgroundColor: '#f9f6f0', p: 2, borderRight: '1px solid #d4c5a9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <img src="/user.png" alt="Athlier Home" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <Typography variant="h6" sx={{ color: '#6b4f35' }}>
            Athlier Home
          </Typography>
        </Box>
        <List>
          <ListItem
            button
            onClick={() => navigate('/dashboard')}
            sx={{
              backgroundColor: (location.pathname === '/' || location.pathname.startsWith('/dashboard')) ? '#efe6d4' : 'transparent',
              borderRadius: 1,
              pl: (location.pathname === '/' || location.pathname.startsWith('/dashboard')) ? 1.5 : 1,
              borderLeft: (location.pathname === '/' || location.pathname.startsWith('/dashboard')) ? '4px solid #6b4f35' : '4px solid transparent'
            }}
          >
            <ListItemText
              primary="Dashboard"
              sx={{
                color: (location.pathname === '/' || location.pathname.startsWith('/dashboard')) ? '#5a4230' : '#6b4f35',
                fontWeight: (location.pathname === '/' || location.pathname.startsWith('/dashboard')) ? '700' : '400'
              }}
            />
          </ListItem>
          <ListItem
            button
            onClick={() => navigate('/design')}
            sx={{
              backgroundColor: location.pathname.startsWith('/design') ? '#efe6d4' : 'transparent',
              borderRadius: 1,
              pl: location.pathname.startsWith('/design') ? 1.5 : 1,
              borderLeft: location.pathname.startsWith('/design') ? '4px solid #6b4f35' : '4px solid transparent'
            }}
          >
            <ListItemText primary="Design Tool" sx={{ color: location.pathname.startsWith('/design') ? '#5a4230' : '#6b4f35', fontWeight: location.pathname.startsWith('/design') ? '700' : '400' }} />
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
                    {design.name || 'My Design'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(design.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Box>
                    <Button size="small" sx={{ color: '#6b4f35' }} onClick={() => navigate('/design')}>Open</Button>
                  </Box>
                  <Box>
                    <IconButton aria-label="edit" onClick={() => openEdit(design)} sx={{ color: '#6b4f35' }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => handleDelete(design._id)} sx={{ color: '#c0392b' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        {/* Edit Name Dialog */}
        <Dialog open={Boolean(editingDesign)} onClose={closeEdit}>
          <DialogTitle>Edit Design</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Design name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEdit}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained" sx={{ backgroundColor: '#6b4f35' }}>Save</Button>
          </DialogActions>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={closeConfirm}>
          <DialogTitle>Delete design?</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this design? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirm}>Cancel</Button>
            <Button onClick={performDelete} variant="contained" sx={{ backgroundColor: '#c0392b' }}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Dashboard;