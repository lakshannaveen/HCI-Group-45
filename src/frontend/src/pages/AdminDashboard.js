import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Alert, Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [furniture, setFurniture] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentFurniture, setCurrentFurniture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'success' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (tabValue === 0) fetchUsers();
    else if (tabValue === 1) fetchFurniture();
    else if (tabValue === 2) fetchDesigns();
  }, [tabValue]);

  const showMessage = (text, severity = 'success') => {
    setMessage({ text, severity });
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      showMessage('Failed to fetch users', 'error');
    }
  };

  const fetchDesigns = async () => {
    try {
      const res = await axios.get('/api/admin/designs');
      setDesigns(res.data);
    } catch (err) {
      console.error('Failed to fetch designs', err);
      showMessage('Failed to fetch designs', 'error');
    }
  };

  const fetchFurniture = async () => {
    try {
      const res = await axios.get('/api/admin/furniture');
      setFurniture(res.data);
    } catch (err) {
      console.error('Failed to fetch furniture', err);
      showMessage('Failed to fetch furniture', 'error');
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

  const handleDeleteUser = async (id) => {
    if (loading) return;
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/users/${id}`);
      showMessage('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      showMessage('Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async (id) => {
    if (loading) return;
    if (!window.confirm('Are you sure you want to delete this design?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/designs/${id}`);
      showMessage('Design deleted successfully');
      fetchDesigns();
    } catch (err) {
      console.error('Failed to delete design', err);
      showMessage('Failed to delete design', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFurniture = async (id) => {
    if (loading) return;
    if (!window.confirm('Are you sure you want to delete this furniture item?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/furniture/${id}`);
      showMessage('Furniture deleted successfully');
      fetchFurniture();
    } catch (err) {
      console.error('Failed to delete furniture', err);
      showMessage('Failed to delete furniture', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFurniture = () => {
    setCurrentFurniture({ type: '', label: '', icon: '', color: '', scale: [1,1,1] });
    setOpen(true);
  };

  const handleEditFurniture = (item) => {
    setCurrentFurniture(item);
    setOpen(true);
  };

  const handleSaveFurniture = async () => {
    setLoading(true);
    try {
      if (currentFurniture._id) {
        await axios.put(`/api/admin/furniture/${currentFurniture._id}`, currentFurniture);
        showMessage('Furniture updated successfully');
      } else {
        await axios.post('/api/admin/furniture', currentFurniture);
        showMessage('Furniture added successfully');
      }
      setOpen(false);
      fetchFurniture();
    } catch (err) {
      console.error('Failed to save furniture', err);
      const errMsg = err.response?.data?.message || 'Failed to save furniture';
      showMessage(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f7f1e3', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ width: 250, backgroundColor: '#f9f6f0', p: 2, borderRight: '1px solid #d4c5a9' }}>
        <Typography variant="h6" sx={{ color: '#6b4f35', mb: 2 }}>
          Admin Panel
        </Typography>
        <Tabs
          orientation="vertical"
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              alignItems: 'flex-start',
              textAlign: 'left',
              color: '#8b6f47',
              '&:hover': { backgroundColor: '#f2ece0' }
            },
            '& .Mui-selected': {
              backgroundColor: '#f9f6f0',
              color: '#6b4f35',
              fontWeight: 'bold'
            }
          }}
        >
          <Tab label="User Management" />
          <Tab label="Furniture Catalogue" />
          <Tab label="Project Archives" />
        </Tabs>
        <Button
          variant="outlined"
          onClick={handleLogout}
          sx={{ mt: 2, borderColor: '#6b4f35', color: '#6b4f35', '&:hover': { borderColor: '#5a4230', backgroundColor: '#f9f6f0' } }}
        >
          Logout
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" sx={{ color: '#6b4f35', mb: 3 }}>
          Admin Dashboard
        </Typography>

        {tabValue === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: '#8b6f47' }}>
              User Management
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteUser(user._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: '#8b6f47' }}>
              Furniture Catalogue
            </Typography>
            <Button variant="contained" onClick={handleAddFurniture} sx={{ mb: 2, backgroundColor: '#6b4f35' }}>
              Add Furniture
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell>Icon</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Scale</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {furniture.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.label}</TableCell>
                      <TableCell>{item.icon}</TableCell>
                      <TableCell>{item.color}</TableCell>
                      <TableCell>{item.scale.join(', ')}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditFurniture(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteFurniture(item._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: '#8b6f47' }}>
              Project Archives
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {designs.map((design) => (
                    <TableRow key={design._id}>
                      <TableCell>{design.name}</TableCell>
                      <TableCell>{design.userId.username}</TableCell>
                      <TableCell>{new Date(design.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteDesign(design._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Furniture Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{currentFurniture?._id ? 'Edit Furniture' : 'Add Furniture'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Type"
            value={currentFurniture?.type || ''}
            onChange={(e) => setCurrentFurniture({ ...currentFurniture, type: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Label"
            value={currentFurniture?.label || ''}
            onChange={(e) => setCurrentFurniture({ ...currentFurniture, label: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Icon"
            value={currentFurniture?.icon || ''}
            onChange={(e) => setCurrentFurniture({ ...currentFurniture, icon: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Color"
            value={currentFurniture?.color || ''}
            onChange={(e) => setCurrentFurniture({ ...currentFurniture, color: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Scale (comma separated)"
            value={currentFurniture?.scale?.join(', ') || ''}
            onChange={(e) => setCurrentFurniture({ ...currentFurniture, scale: e.target.value.split(',').map(Number) })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSaveFurniture} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;