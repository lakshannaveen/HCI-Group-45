import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, List, ListItem, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Alert, Snackbar, Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ADMIN_SECTIONS = [
  { label: 'User Management',    index: 0 },
  { label: 'Furniture Catalogue', index: 1 },
  { label: 'Project Archives',   index: 2 },
];

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setCurrentFurniture({ type: '', label: '', icon: '', color: '', scale: [1, 1, 1] });
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

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'var(--canvas-base)', minHeight: '100vh' }}>

      {/* Sidebar — visually identical to AppSidebar */}
      <Box
        sx={{
          width: 250,
          minWidth: 250,
          backgroundColor: 'var(--surface-1)',
          borderRight: '1px solid var(--grid-lines)',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          minHeight: '100vh',
        }}
      >
        {/* Brand mark */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, px: 1 }}>
          <img
            src="/logo.PNG"
            alt="Athlier Home"
            style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
          />
          <Typography variant="h6" sx={{ color: 'var(--text-high)', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Admin Panel
          </Typography>
        </Box>

        {/* Nav items (section switcher) */}
        <List disablePadding sx={{ flexGrow: 1 }}>
          {ADMIN_SECTIONS.map((section) => {
            const active = tabValue === section.index;
            return (
              <ListItem
                key={section.index}
                onClick={() => setTabValue(section.index)}
                sx={{
                  borderRadius: '6px',
                  mb: 0.5,
                  pl: active ? 1.5 : 2,
                  cursor: 'pointer',
                  backgroundColor: active ? 'var(--surface-2)' : 'transparent',
                  borderLeft: active
                    ? '3px solid var(--brand-primary)'
                    : '3px solid transparent',
                  '&:hover': { backgroundColor: 'var(--surface-2)' },
                  transition: 'background-color 0.15s, border-color 0.15s',
                }}
              >
                <ListItemText
                  primary={section.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--brand-primary)' : 'var(--text-med)',
                  }}
                />
              </ListItem>
            );
          })}
        </List>

        {/* Logout */}
        <Divider sx={{ my: 2 }} />
        <ListItem
          onClick={handleLogout}
          sx={{
            borderRadius: '6px',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'var(--surface-2)' },
          }}
        >
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 400,
              color: 'var(--text-high)',
            }}
          />
        </ListItem>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" sx={{ color: 'var(--text-high)', mb: 3 }}>
          Admin Dashboard
        </Typography>

        {/* ── Users Tab ── */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: 'var(--brand-primary)' }}>
              User Management
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: 'var(--surface-1)' }}>
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
                        <IconButton
                          onClick={() => handleDeleteUser(user._id)}
                          sx={{ color: 'var(--color-error)', '&:hover': { backgroundColor: 'rgba(207,102,121,0.1)' } }}
                          disabled={loading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* ── Furniture Tab ── */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: 'var(--brand-primary)' }}>
              Furniture Catalogue
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddFurniture}
              sx={{ mb: 2 }}
            >
              Add Furniture
            </Button>
            <TableContainer component={Paper} sx={{ backgroundColor: 'var(--surface-1)' }}>
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
                        <IconButton
                          onClick={() => handleEditFurniture(item)}
                          sx={{ color: 'var(--brand-primary)', '&:hover': { backgroundColor: 'rgba(131,151,5,0.1)' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteFurniture(item._id)}
                          sx={{ color: 'var(--color-error)', '&:hover': { backgroundColor: 'rgba(207,102,121,0.1)' } }}
                          disabled={loading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* ── Designs Tab ── */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, color: 'var(--brand-primary)' }}>
              Project Archives
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: 'var(--surface-1)' }}>
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
                        <IconButton
                          onClick={() => handleDeleteDesign(design._id)}
                          sx={{ color: 'var(--color-error)', '&:hover': { backgroundColor: 'rgba(207,102,121,0.1)' } }}
                          disabled={loading}
                        >
                          <DeleteIcon fontSize="small" />
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

      {/* Furniture Dialog — dark theme applied via MUI theme override */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'var(--text-high)', borderBottom: '1px solid var(--grid-lines)' }}>
          {currentFurniture?._id ? 'Edit Furniture' : 'Add Furniture'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
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
        <DialogActions sx={{ borderTop: '1px solid var(--grid-lines)', px: 3, py: 2 }}>
          <Button variant="outlined" color="primary" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveFurniture} disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminDashboard;
