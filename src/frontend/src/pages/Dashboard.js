import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Grid, Paper,
  Dialog, DialogContent, DialogTitle, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  InputAdornment, Snackbar, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import TopNavbar from '../components/TopNavbar';

// ── Screen 4: Room Configuration Modal ──────────────────────────────────────
function RoomConfigModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({ length: '', width: '', wallColor: '#ffffff', floorColor: '#c8b89a' });
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setForm({ length: '', width: '', wallColor: '#ffffff', floorColor: '#c8b89a' });
    onClose();
  };

  const handleCreate = () => {
    setLoading(true);
    onCreate(form);
    setLoading(false);
    setForm({ length: '', width: '', wallColor: '#ffffff', floorColor: '#c8b89a' });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          color: 'var(--text-high)',
          fontWeight: 700,
          borderBottom: '1px solid var(--grid-lines)',
          pb: 2,
          backgroundColor: 'var(--surface-1)',
        }}
      >
        New Room Setup
        <Typography variant="body2" sx={{ color: 'var(--text-med)', fontWeight: 400, mt: 0.5 }}>
          Configure your room dimensions
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: 'var(--surface-1)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
          {/* Room Length */}
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--text-med)', display: 'block', mb: 0.5 }}>
              Room Length
            </Typography>
            <TextField
              type="number"
              value={form.length}
              onChange={(e) => setForm((f) => ({ ...f, length: e.target.value }))}
              fullWidth
              size="small"
              placeholder="e.g. 5"
              InputProps={{
                endAdornment: <InputAdornment position="end">m</InputAdornment>,
              }}
            />
          </Box>

          {/* Room Width */}
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--text-med)', display: 'block', mb: 0.5 }}>
              Room Width
            </Typography>
            <TextField
              type="number"
              value={form.width}
              onChange={(e) => setForm((f) => ({ ...f, width: e.target.value }))}
              fullWidth
              size="small"
              placeholder="e.g. 4"
              InputProps={{
                endAdornment: <InputAdornment position="end">m</InputAdornment>,
              }}
            />
          </Box>

          {/* Wall Color */}
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--text-med)', display: 'block', mb: 0.5 }}>
              Wall Color
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={form.wallColor}
                onChange={(e) => setForm((f) => ({ ...f, wallColor: e.target.value }))}
              >
                <MenuItem value="#ffffff">White</MenuItem>
                <MenuItem value="#f5f5dc">Beige</MenuItem>
                <MenuItem value="#e8e8e8">Light Grey</MenuItem>
                <MenuItem value="#d4e4f7">Light Blue</MenuItem>
                <MenuItem value="#d4f7d4">Light Green</MenuItem>
                <MenuItem value="#f7d4d4">Light Pink</MenuItem>
                <MenuItem value="#fffde7">Cream</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Floor Color */}
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--text-med)', display: 'block', mb: 0.5 }}>
              Floor Color
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={form.floorColor}
                onChange={(e) => setForm((f) => ({ ...f, floorColor: e.target.value }))}
              >
                <MenuItem value="#c8b89a">Timber (default)</MenuItem>
                <MenuItem value="#e8dcc8">Light Oak</MenuItem>
                <MenuItem value="#a0856b">Dark Oak</MenuItem>
                <MenuItem value="#d9d0c4">Stone</MenuItem>
                <MenuItem value="#b8b8b8">Concrete</MenuItem>
                <MenuItem value="#f5f5f5">White Tile</MenuItem>
                <MenuItem value="#2d2d2d">Dark Tile</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ borderTop: '1px solid var(--grid-lines)', px: 3, py: 2, gap: 1, backgroundColor: 'var(--surface-1)' }}
      >
        <Button variant="outlined" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading || !form.length || !form.width}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Screen 3: Main Dashboard ─────────────────────────────────────────────────
const Dashboard = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roomConfigOpen, setRoomConfigOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'success' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDesigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (text, severity = 'success') => {
    setMessage({ text, severity });
    setSnackbarOpen(true);
  };

  const fetchDesigns = async () => {
    try {
      const res = await axios.get('/api/designs');
      setDesigns(res.data);
    } catch (err) {
      showMessage('Failed to fetch designs', 'error');
    }
  };

  const handleDeleteDesign = async () => {
    if (!deleteConfirmId || loading) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setLoading(true);
    try {
      await axios.delete(`/api/designs/${id}`);
      showMessage('Design deleted successfully');
      fetchDesigns();
    } catch {
      showMessage('Failed to delete design', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to editor with room config via location state
  const handleCreateRoom = (roomConfig) => {
    setRoomConfigOpen(false);
    navigate('/design', { state: { roomConfig } });
  };

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

      {/* ── Main Content ── */}
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          maxWidth: 1400,
          mx: 'auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Header row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ color: 'var(--text-high)', fontWeight: 600 }}>
              Recent Designs
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-low)', mt: 0.5 }}>
              Your saved room configurations
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => setRoomConfigOpen(true)}>
            + Create New Room
          </Button>
        </Box>

        {/* Empty state */}
        {designs.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              border: '2px dashed var(--grid-lines)',
              borderRadius: 2,
            }}
          >
            <Typography sx={{ fontSize: 48, mb: 2 }}>🏠</Typography>
            <Typography variant="h6" sx={{ color: 'var(--text-med)', mb: 1 }}>
              No designs yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-low)', mb: 3 }}>
              Create your first room design to get started
            </Typography>
            <Button variant="contained" onClick={() => setRoomConfigOpen(true)}>
              Create New Room
            </Button>
          </Box>
        ) : (
          <>
          {/* Design card grid */}
          <Grid container spacing={2}>
            {designs.map((design) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={design._id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, var(--surface-1) 0%, var(--surface-2) 100%)',
                    border: '1px solid var(--grid-lines)',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'var(--brand-primary)',
                      background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--brand-primary-light, rgba(99, 102, 241, 0.05)) 100%)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    width: '100%',
                    minHeight: 280,
                    overflow: 'hidden',
                  }}
                  onClick={() => navigate(`/design/${design._id}`)}
                >
                  {/* (Removed three-dot menu - replaced by visible action buttons) */}

                  {/* Design icon */}
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      background: `linear-gradient(135deg, ${design.roomData?.wallColor || design.roomData?.color || 'var(--surface-2)'} 0%, rgba(255,255,255,0.1) 100%)`,
                      border: '2px solid var(--grid-lines)',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48,
                      flexShrink: 0,
                      position: 'relative',
                      mt: 2,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    🏠
                    {design.furniture?.length > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark, #6366f1) 100%)',
                          color: 'white',
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: '2px solid var(--surface-1)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        {design.furniture.length}
                      </Box>
                    )}
                  </Box>

                  {/* Design title */}
                  <Box sx={{ textAlign: 'center', mb: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'var(--text-high)',
                        fontWeight: 700,
                        textAlign: 'center',
                        wordBreak: 'break-word',
                        mb: 0.5,
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {design.name}
                    </Typography>

                    {/* Room dimensions */}
                    {design.roomData && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'var(--brand-primary)',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block',
                        }}
                      >
                        {design.roomData.width || '?'}m × {design.roomData.length || design.roomData.height || '?'}m
                      </Typography>
                    )}
                  </Box>

                  {/* Card actions */}
                  <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center', mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/design/${design._id}`);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(design._id);
                      }}
                      sx={{
                        textTransform: 'none',
                        borderColor: 'var(--color-error)',
                        color: 'var(--color-error)',
                        '&:hover': {
                          backgroundColor: 'rgba(207,102,121,0.08)',
                          borderColor: 'var(--color-error)'
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Box>

                  {/* Footer info */}
                  <Box sx={{ width: '100%', textAlign: 'center', mt: 'auto', pt: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-low)',
                        fontSize: '0.7rem',
                        opacity: 0.8,
                      }}
                    >
                      Created {new Date(design.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* context menu removed; actions are now visible on each card */}
          </>
        )}
      </Box>

      {/* ── Delete confirmation dialog ── */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
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
          Delete Design?
          <Typography variant="body2" sx={{ color: 'var(--text-med)', fontWeight: 400, mt: 0.5 }}>
            This action is permanent and cannot be undone
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'var(--surface-1)', pt: '16px !important' }}>
          <Typography variant="body2" sx={{ color: 'var(--color-error)' }}>
            The design and all its furniture placements will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ borderTop: '1px solid var(--grid-lines)', px: 3, py: 2, gap: 1, backgroundColor: 'var(--surface-1)' }}
        >
          <Button variant="outlined" onClick={() => setDeleteConfirmId(null)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteDesign}
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

      {/* ── Modals ── */}
      <RoomConfigModal
        open={roomConfigOpen}
        onClose={() => setRoomConfigOpen(false)}
        onCreate={handleCreateRoom}
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

export default Dashboard;
