import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Grid, Paper,
  Dialog, DialogContent, DialogTitle,
  TextField, Select, MenuItem, FormControl, InputLabel,
  InputAdornment, Snackbar, Alert,
} from '@mui/material';
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
          borderBottom: '1px solid var(--grid-lines)',
          pb: 2,
          fontWeight: 700,
        }}
      >
        New Room Setup
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

          {/* Footer actions — right-aligned */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
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
          </Box>
        </Box>
      </DialogContent>
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

  const handleDeleteDesign = async (id) => {
    if (loading) return;
    if (!window.confirm('Delete this design?')) return;
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
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ color: 'var(--text-high)', fontWeight: 600 }}>
            Recent Designs
          </Typography>
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
          /* Design card grid — 4 cols on lg, 3 on md, 2 on sm, 1 on xs */
          <Grid container spacing={2}>
            {designs.map((design) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={design._id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--grid-lines)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background-color 0.15s',
                    '&:hover': {
                      borderColor: 'var(--brand-primary)',
                      backgroundColor: 'var(--surface-2)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    minHeight: 180,
                  }}
                  onClick={() => navigate(`/design/${design._id}`)}
                >
                  {/* Design icon placeholder */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: design.roomData?.wallColor || design.roomData?.color || 'var(--surface-2)',
                      border: '1px solid var(--grid-lines)',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    🏠
                    {/* Furniture count badge */}
                    {design.furniture?.length > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'var(--brand-primary)',
                          color: 'var(--canvas-base)',
                          borderRadius: 10,
                          fontSize: 9,
                          fontWeight: 700,
                          px: 0.6,
                          py: 0.1,
                          lineHeight: 1.4,
                        }}
                      >
                        {design.furniture.length}
                      </Box>
                    )}
                  </Box>

                  {/* Design title */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--text-high)',
                      fontWeight: 600,
                      textAlign: 'center',
                      wordBreak: 'break-word',
                    }}
                  >
                    {design.name}
                  </Typography>

                  {/* Room dimensions */}
                  {design.roomData && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--brand-primary)',
                        fontFamily: 'monospace',
                        fontSize: 10,
                        mt: -0.5,
                      }}
                    >
                      {design.roomData.width || '?'}m × {design.roomData.length || design.roomData.height || '?'}m
                    </Typography>
                  )}

                  <Typography variant="caption" sx={{ color: 'var(--text-low)' }}>
                    {new Date(design.createdAt).toLocaleDateString()}
                  </Typography>

                  {/* Card actions */}
                  <Box
                    sx={{ display: 'flex', gap: 0.5, mt: 'auto', width: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/design/${design._id}`)}
                      sx={{ fontSize: 11 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={() => handleDeleteDesign(design._id)}
                      disabled={loading}
                      sx={{
                        fontSize: 11,
                        borderColor: 'var(--color-error)',
                        color: 'var(--color-error)',
                        '&:hover': { backgroundColor: 'rgba(207,102,121,0.08)' },
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

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
