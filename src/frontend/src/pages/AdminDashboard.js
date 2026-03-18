import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, List, ListItem, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, IconButton, Alert, Snackbar, Divider,
  InputAdornment, Select, MenuItem, FormControl, FormHelperText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Tooltip from '@mui/material/Tooltip';
import TopNavbar from '../components/TopNavbar';

const ADMIN_SECTIONS = [
  { label: 'User Management',    index: 0 },
  { label: 'Furniture Catalogue', index: 1 },
  { label: 'Project Archives',   index: 2 },
];

const AdminDashboard = () => {
  const [tabValue, setTabValue]             = useState(0);
  const [currentUser, setCurrentUser]       = useState(null);
  const [users, setUsers]                   = useState([]);
  const [designs, setDesigns]               = useState([]);
  const [furniture, setFurniture]           = useState([]);
  const [furnitureSearch, setFurnitureSearch] = useState('');
  const [furnitureCategory, setFurnitureCategory] = useState('');
  const [open, setOpen]                     = useState(false);
  const [currentFurniture, setCurrentFurniture] = useState(null);
  const [scaleStr, setScaleStr]             = useState('1, 1, 1');
  const [loading, setLoading]               = useState(false);
  const [message, setMessage]               = useState({ text: '', severity: 'success' });
  const [snackbarOpen, setSnackbarOpen]     = useState(false);
  // Confirm-delete dialog state: { type: 'user'|'design'|'furniture', id, label }
  const [confirmDelete, setConfirmDelete]   = useState(null);
  // Confirm-role dialog state: { user }
  const [confirmRole, setConfirmRole]       = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/auth/me').then((r) => setCurrentUser(r.data)).catch(() => {});
  }, []);

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

  const handleDeleteUser = (id) => {
    if (loading) return;
    setConfirmDelete({ type: 'user', id, label: 'Delete this user and all their designs?' });
  };

  const handleToggleRole = (user) => {
    if (loading) return;
    setConfirmRole({ user });
  };

  const handleConfirmRole = async () => {
    if (!confirmRole) return;
    const { user } = confirmRole;
    setConfirmRole(null);
    setLoading(true);
    try {
      const res = await axios.put(`/api/admin/users/${user._id}/role`);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data : u)));
      showMessage(`Role updated: ${res.data.username} is now ${res.data.role}`);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = (id) => {
    if (loading) return;
    setConfirmDelete({ type: 'design', id, label: 'Delete this design?' });
  };

  const handleDeleteFurniture = (id) => {
    if (loading) return;
    setConfirmDelete({ type: 'furniture', id, label: 'Delete this furniture item?' });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    setConfirmDelete(null);
    setLoading(true);
    try {
      if (type === 'user') {
        await axios.delete(`/api/admin/users/${id}`);
        showMessage('User deleted successfully');
        fetchUsers();
      } else if (type === 'design') {
        await axios.delete(`/api/admin/designs/${id}`);
        showMessage('Design deleted successfully');
        fetchDesigns();
      } else if (type === 'furniture') {
        await axios.delete(`/api/admin/furniture/${id}`);
        showMessage('Furniture deleted successfully');
        fetchFurniture();
      }
    } catch {
      showMessage('Failed to delete item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFurniture = () => {
    setCurrentFurniture({ type: '', label: '', icon: '', color: '#839705', scale: [1, 1, 1] });
    setScaleStr('1, 1, 1');
    setOpen(true);
  };

  const handleEditFurniture = (item) => {
    setCurrentFurniture(item);
    setScaleStr(item.scale?.join(', ') || '1, 1, 1');
    setOpen(true);
  };

  const handleSaveFurniture = async () => {
    // Parse scaleStr now so clicking Save without blurring still captures the latest value
    const parsedScale = scaleStr.split(',').map(Number).filter((n) => !isNaN(n));
    const furnitureToSave = parsedScale.length === 3
      ? { ...currentFurniture, scale: parsedScale }
      : currentFurniture;
    setLoading(true);
    try {
      if (furnitureToSave._id) {
        await axios.put(`/api/admin/furniture/${furnitureToSave._id}`, furnitureToSave);
        showMessage('Furniture updated successfully');
      } else {
        await axios.post('/api/admin/furniture', furnitureToSave);
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
      <TopNavbar />

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
                    px: 1.5,
                    cursor: 'pointer',
                    backgroundColor: active ? 'var(--brand-primary-muted)' : 'transparent',
                    border: active
                      ? '1px solid var(--brand-primary)'
                      : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: active ? 'var(--brand-primary-muted)' : 'var(--surface-2)',
                    },
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

        </Box>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, p: 3 }}>

          {/* ── User Management ── */}
          {tabValue === 0 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ color: 'var(--text-high)', fontWeight: 700 }}>
                  User Management
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-med)', mt: 0.5 }}>
                  View and manage all registered designer accounts
                </Typography>
              </Box>
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
                    {users.map((user) => {
                      const isSelf = currentUser?._id === user._id;
                      const isAdmin = user.role === 'admin';
                      return (
                        <TableRow key={user._id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email || '—'}</TableCell>
                          <TableCell>
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                backgroundColor: isAdmin
                                  ? 'var(--brand-primary-muted)'
                                  : 'var(--surface-2)',
                                color: isAdmin
                                  ? 'var(--brand-primary)'
                                  : 'var(--text-med)',
                                border: isAdmin
                                  ? '1px solid var(--brand-primary)'
                                  : '1px solid var(--grid-lines)',
                              }}
                            >
                              {user.role}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title={isSelf ? 'Cannot change your own role' : isAdmin ? 'Revoke Admin' : 'Make Admin'}>
                                <span>
                                  <IconButton
                                    onClick={() => handleToggleRole(user)}
                                    disabled={loading || isSelf}
                                    sx={{
                                      color: isAdmin ? 'var(--brand-primary)' : 'var(--text-low)',
                                      '&:hover': { backgroundColor: 'var(--brand-primary-muted)' },
                                      '&.Mui-disabled': { opacity: 0.3 },
                                    }}
                                  >
                                    {isAdmin
                                      ? <AdminPanelSettingsOutlinedIcon fontSize="small" />
                                      : <PersonOutlineIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={isSelf ? 'Cannot delete yourself' : 'Delete user'}>
                                <span>
                                  <IconButton
                                    onClick={() => handleDeleteUser(user._id)}
                                    disabled={loading || isSelf}
                                    sx={{
                                      color: 'var(--color-error)',
                                      '&:hover': { backgroundColor: 'rgba(207,102,121,0.1)' },
                                      '&.Mui-disabled': { opacity: 0.3 },
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                <Box>
                  <Typography variant="h5" sx={{ color: 'var(--text-high)', fontWeight: 700 }}>
                    Furniture Inventory
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-med)', mt: 0.5 }}>
                    Manage furniture items and catalogue
                  </Typography>
                </Box>
                <Button variant="contained" size="small" onClick={handleAddFurniture}>
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
                      <TableRow key={item._id}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.6875rem' }}>
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
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.6875rem' }}>
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ color: 'var(--text-high)', fontWeight: 700 }}>
                  Project Archives
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-med)', mt: 0.5 }}>
                  All saved room designs across all designers
                </Typography>
              </Box>
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
                        <TableRow key={design._id}>
                          <TableCell>{design.name}</TableCell>
                          <TableCell>{design.userId?.username || '—'}</TableCell>
                          <TableCell>
                            {design.roomData
                              ? `${design.roomData.width || '?'}m × ${design.roomData.length || design.roomData.height || '?'}m`
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

      {/* ── Confirm-delete dialog ── */}
      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            color: 'var(--text-high)',
            fontWeight: 700,
            borderBottom: '1px solid var(--grid-lines)',
            pb: 2,
            backgroundColor: 'var(--surface-1)',
          }}
        >
          Confirm Deletion
          <Typography variant="body2" sx={{ color: 'var(--text-med)', fontWeight: 400, mt: 0.5 }}>
            This action is permanent and cannot be undone
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'var(--surface-1)', pt: '16px !important' }}>
          <Typography variant="body2" sx={{ color: 'var(--text-med)' }}>
            {confirmDelete?.label}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--color-error)', display: 'block', mt: 1 }}>
            All associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ borderTop: '1px solid var(--grid-lines)', px: 3, py: 2, gap: 1, backgroundColor: 'var(--surface-1)' }}
        >
          <Button variant="outlined" onClick={() => setConfirmDelete(null)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={loading}
            sx={{
              backgroundColor: 'var(--color-error)',
              color: '#fff',
              '&:hover': { backgroundColor: '#b5566a' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirm-role dialog ── */}
      <Dialog
        open={Boolean(confirmRole)}
        onClose={() => setConfirmRole(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            color: 'var(--text-high)',
            fontWeight: 700,
            borderBottom: '1px solid var(--grid-lines)',
            pb: 2,
            backgroundColor: 'var(--surface-1)',
          }}
        >
          {confirmRole?.user.role === 'admin' ? 'Revoke Admin Access' : 'Grant Admin Access'}
          <Typography variant="body2" sx={{ color: 'var(--text-med)', fontWeight: 400, mt: 0.5 }}>
            {confirmRole?.user.role === 'admin'
              ? 'This will downgrade the user to a regular account'
              : 'This will grant full dashboard access to this user'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'var(--surface-1)', pt: '16px !important' }}>
          <Typography variant="body2" sx={{ color: 'var(--text-med)' }}>
            {confirmRole?.user.role === 'admin'
              ? <>Remove admin privileges from <strong style={{ color: 'var(--text-high)' }}>{confirmRole?.user.username}</strong>? They will become a regular user.</>
              : <>Grant admin privileges to <strong style={{ color: 'var(--text-high)' }}>{confirmRole?.user.username}</strong>? They will have full access to this dashboard.</>
            }
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ borderTop: '1px solid var(--grid-lines)', px: 3, py: 2, gap: 1, backgroundColor: 'var(--surface-1)' }}
        >
          <Button variant="outlined" onClick={() => setConfirmRole(null)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmRole}
            disabled={loading}
            sx={{
              backgroundColor: confirmRole?.user.role === 'admin' ? 'var(--color-error)' : 'var(--brand-primary)',
              color: '#fff',
              '&:hover': {
                backgroundColor: confirmRole?.user.role === 'admin' ? '#b5566a' : 'var(--brand-primary-hover)',
              },
            }}
          >
            {confirmRole?.user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Furniture Add/Edit Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            color: 'var(--text-high)',
            fontWeight: 700,
            borderBottom: '1px solid var(--grid-lines)',
            pb: 2,
            backgroundColor: 'var(--surface-1)',
          }}
        >
          {currentFurniture?._id ? 'Edit Furniture Item' : 'Add New Furniture Item'}
          <Typography variant="body2" sx={{ color: 'var(--text-med)', fontWeight: 400, mt: 0.5 }}>
            {currentFurniture?._id
              ? 'Update the furniture item properties'
              : 'Configure a new furniture item for the catalogue'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'var(--surface-1)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Type (identifier)"
              size="small"
              value={currentFurniture?.type || ''}
              onChange={(e) => setCurrentFurniture({ ...currentFurniture, type: e.target.value })}
              helperText="e.g. chair, sofa, bed — used for filtering"
            />
            <TextField
              fullWidth
              label="Label (display name)"
              size="small"
              value={currentFurniture?.label || ''}
              onChange={(e) => setCurrentFurniture({ ...currentFurniture, label: e.target.value })}
            />
            <TextField
              fullWidth
              label="Icon (emoji)"
              size="small"
              value={currentFurniture?.icon || ''}
              onChange={(e) => setCurrentFurniture({ ...currentFurniture, icon: e.target.value })}
            />
            <TextField
              fullWidth
              label="Color (hex)"
              size="small"
              value={currentFurniture?.color || ''}
              onChange={(e) => setCurrentFurniture({ ...currentFurniture, color: e.target.value })}
            />
            <TextField
              fullWidth
              label="Scale (W, H, D — comma separated)"
              size="small"
              value={scaleStr}
              onChange={(e) => setScaleStr(e.target.value)}
              onBlur={(e) => {
                const parsed = e.target.value.split(',').map(Number).filter((n) => !isNaN(n));
                if (parsed.length === 3) setCurrentFurniture({ ...currentFurniture, scale: parsed });
              }}
              helperText="e.g. 1.2, 2.0, 0.6"
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ borderTop: '1px solid var(--grid-lines)', px: 3, py: 2, gap: 1, backgroundColor: 'var(--surface-1)' }}
        >
          <Button variant="outlined" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveFurniture} disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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
