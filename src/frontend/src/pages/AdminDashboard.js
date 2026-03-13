import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, List, ListItem, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Alert, Snackbar, Divider,
  InputAdornment, Select, MenuItem, FormControl,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import UserProfileModal from '../components/UserProfileModal';

const ADMIN_SECTIONS = [
  { label: 'User Management',    index: 0 },
  { label: 'Furniture Catalogue', index: 1 },
  { label: 'Project Archives',   index: 2 },
];

const AdminDashboard = () => {
  const [tabValue, setTabValue]             = useState(0);
  const [users, setUsers]                   = useState([]);
  const [designs, setDesigns]               = useState([]);
  const [furniture, setFurniture]           = useState([]);
  const [furnitureSearch, setFurnitureSearch] = useState('');
  const [furnitureCategory, setFurnitureCategory] = useState('');
  const [open, setOpen]                     = useState(false);
  const [currentFurniture, setCurrentFurniture] = useState(null);
  const [loading, setLoading]               = useState(false);
  const [profileOpen, setProfileOpen]       = useState(false);
  const [message, setMessage]               = useState({ text: '', severity: 'success' });
  const [snackbarOpen, setSnackbarOpen]     = useState(false);
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

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch {
      showMessage('Failed to fetch users', 'error');
    }
  };

  const fetchDesigns = async () => {
    try {
      const res = await axios.get('/api/admin/designs');
      setDesigns(res.data);
    } catch {
      showMessage('Failed to fetch designs', 'error');
    }
  };

  const fetchFurniture = async () => {
    try {
      const res = await axios.get('/api/admin/furniture');
      setFurniture(res.data);
    } catch {
      showMessage('Failed to fetch furniture', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  const handleDeleteUser = async (id) => {
    if (loading) return;
    if (!window.confirm('Delete this user and all their designs?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/users/${id}`);
      showMessage('User deleted successfully');
      fetchUsers();
    } catch {
      showMessage('Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async (id) => {
    if (loading) return;
    if (!window.confirm('Delete this design?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/designs/${id}`);
      showMessage('Design deleted successfully');
      fetchDesigns();
    } catch {
      showMessage('Failed to delete design', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFurniture = async (id) => {
    if (loading) return;
    if (!window.confirm('Delete this furniture item?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/furniture/${id}`);
      showMessage('Furniture deleted successfully');
      fetchFurniture();
    } catch {
      showMessage('Failed to delete furniture', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFurniture = () => {
    setCurrentFurniture({ type: '', label: '', icon: '', color: '#839705', scale: [1, 1, 1] });
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
      showMessage(err.response?.data?.message || 'Failed to save furniture', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtered furniture for table
  const filteredFurniture = furniture.filter((item) => {
    const matchSearch =
      !furnitureSearch ||
      item.label.toLowerCase().includes(furnitureSearch.toLowerCase()) ||
      item.type.toLowerCase().includes(furnitureSearch.toLowerCase());
    const matchCategory =
      !furnitureCategory || item.type === furnitureCategory;
    return matchSearch && matchCategory;
  });

  const uniqueCategories = [...new Set(furniture.map((f) => f.type))];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--canvas-base)',
      }}
    >
      {/* ── Top Navigation Bar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          backgroundColor: 'var(--surface-1)',
          borderBottom: '1px solid var(--grid-lines)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Left: Dashboard title (clickable — navigates back) */}
        <Typography
          variant="h6"
          sx={{
            color: 'var(--text-high)',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '-0.01em',
          }}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </Typography>

        {/* Right: Admin Panel (active state) + User icon */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/dashboard')}
            sx={{ fontWeight: 700 }}
          >
            Admin Panel
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setProfileOpen(true)}
            sx={{
              minWidth: 40,
              width: 40,
              height: 36,
              p: 0,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 9, lineHeight: 1 }}>
              USER
            </Typography>
          </Button>
        </Box>
      </Box>

      {/* ── Main Layout: sidebar + content ── */}
      <Box sx={{ display: 'flex', flex: 1 }}>

        {/* Left Sidebar Navigation */}
        <Box
          sx={{
            width: 250,
            minWidth: 250,
            backgroundColor: 'var(--surface-1)',
            borderRight: '1px solid var(--grid-lines)',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
          }}
        >
          {/* Brand mark */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, px: 1 }}>
            <img
              src="/logo.PNG"
              alt="Athlier Home"
              style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
            />
            <Typography
              variant="h6"
              sx={{ color: 'var(--text-high)', fontWeight: 700, letterSpacing: '-0.01em' }}
            >
              Admin Panel
            </Typography>
          </Box>

          {/* Navigation links */}
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
              primaryTypographyProps={{ fontSize: '0.875rem', color: 'var(--text-high)' }}
            />
          </ListItem>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, p: 3 }}>

          {/* ── User Management ── */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2, color: 'var(--text-high)', fontWeight: 700 }}>
                User Management
              </Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: 'var(--surface-1)' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user._id}
                        sx={{ '&:hover': { backgroundColor: 'var(--surface-2)' } }}
                      >
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email || '—'}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={loading}
                            sx={{
                              color: 'var(--color-error)',
                              '&:hover': { backgroundColor: 'rgba(207,102,121,0.1)' },
                            }}
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

          {/* ── Furniture Catalogue ── */}
          {tabValue === 1 && (
            <Box>
              {/* Header row */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h5" sx={{ color: 'var(--text-high)', fontWeight: 700 }}>
                  Furniture Inventory
                </Typography>
                <Button variant="contained" onClick={handleAddFurniture}>
                  + Add New Item
                </Button>
              </Box>

              {/* Search + filter bar */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search furniture…"
                  value={furnitureSearch}
                  onChange={(e) => setFurnitureSearch(e.target.value)}
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: 'var(--text-low)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={furnitureCategory}
                    onChange={(e) => setFurnitureCategory(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {uniqueCategories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TableContainer component={Paper} sx={{ backgroundColor: 'var(--surface-1)' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Thumbnail</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Dimensions</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFurniture.map((item) => (
                      <TableRow
                        key={item._id}
                        sx={{ '&:hover': { backgroundColor: 'var(--surface-2)' } }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {item._id.slice(-6)}
                        </TableCell>
                        <TableCell>
                          {/* Square thumbnail placeholder */}
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              backgroundColor: item.color || 'var(--surface-2)',
                              border: '1px solid var(--grid-lines)',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 18,
                            }}
                          >
                            {item.icon}
                          </Box>
                        </TableCell>
                        <TableCell>{item.label}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {item.scale.join(' × ')}
                        </TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleEditFurniture(item)}
                            sx={{
                              color: 'var(--brand-primary)',
                              '&:hover': { backgroundColor: 'rgba(131,151,5,0.1)' },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteFurniture(item._id)}
                            disabled={loading}
                            sx={{
                              color: 'var(--color-error)',
                              '&:hover': { backgroundColor: 'rgba(207,102,121,0.1)' },
                            }}
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

          {/* ── Project Archives ── */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2, color: 'var(--text-high)', fontWeight: 700 }}>
                Project Archives
              </Typography>
              {designs.length === 0 ? (
                <Box
                  sx={{
                    p: 4,
                    border: '1px dashed var(--grid-lines)',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'var(--text-med)' }}>
                    No projects found
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ backgroundColor: 'var(--surface-1)' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Room</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {designs.map((design) => (
                        <TableRow
                          key={design._id}
                          sx={{ '&:hover': { backgroundColor: 'var(--surface-2)' } }}
                        >
                          <TableCell>{design.name}</TableCell>
                          <TableCell>{design.userId?.username || '—'}</TableCell>
                          <TableCell>
                            {design.roomData
                              ? `${design.roomData.width}m × ${design.roomData.height}m`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {new Date(design.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleDeleteDesign(design._id)}
                              disabled={loading}
                              sx={{
                                color: 'var(--color-error)',
                                '&:hover': { backgroundColor: 'rgba(207,102,121,0.1)' },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Furniture Add/Edit Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{ color: 'var(--text-high)', borderBottom: '1px solid var(--grid-lines)' }}
        >
          {currentFurniture?._id ? 'Edit Furniture' : 'Add New Item'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth label="Type (identifier)"
            value={currentFurniture?.type || ''}
            onChange={(e) =>
              setCurrentFurniture({ ...currentFurniture, type: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth label="Label (display name)"
            value={currentFurniture?.label || ''}
            onChange={(e) =>
              setCurrentFurniture({ ...currentFurniture, label: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth label="Icon (emoji)"
            value={currentFurniture?.icon || ''}
            onChange={(e) =>
              setCurrentFurniture({ ...currentFurniture, icon: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth label="Color (hex)"
            value={currentFurniture?.color || ''}
            onChange={(e) =>
              setCurrentFurniture({ ...currentFurniture, color: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth label="Scale (W, H, D — comma separated)"
            value={currentFurniture?.scale?.join(', ') || ''}
            onChange={(e) =>
              setCurrentFurniture({
                ...currentFurniture,
                scale: e.target.value.split(',').map(Number),
              })
            }
            margin="normal"
            helperText="e.g. 1.2, 2.0, 0.6"
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid var(--grid-lines)', px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveFurniture}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Profile Modal */}
      <UserProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogout={handleLogout}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={message.severity}
          sx={{ width: '100%' }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
