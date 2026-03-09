import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, TextField, Grid,
  Divider, Slider, InputAdornment, Snackbar, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import FurnitureItem from '../components/FurnitureItem';
import AppSidebar from '../components/AppSidebar';

// Pre-defined colour swatches for the Properties Panel colour picker
const COLOR_SWATCHES = [
  '#4a90e2', '#6b4f35', '#5a9e6f', '#e2844a',
  '#9b59b6', '#e24a4a', '#2ecc71', '#e2c94a',
  '#1abc9c', '#e74c3c', '#3498db', '#95a5a6',
];

// ─── Furniture catalogue ────────────────────────────────────────────────────
const FURNITURE_CATALOGUE = [
  { type: 'chair',    label: 'Chair',    icon: '🪑', color: '#e2844a', scale: [0.7, 1.0, 0.7] },
  { type: 'table',    label: 'Table',    icon: '🪵', color: '#6b4f35', scale: [1.6, 0.5, 1.0] },
  { type: 'sofa',     label: 'Sofa',     icon: '🛋️', color: '#9b59b6', scale: [2.0, 0.8, 0.9] },
  { type: 'wardrobe', label: 'Wardrobe', icon: '🗄️', color: '#95a5a6', scale: [1.2, 2.0, 0.6] },
  { type: 'bed',      label: 'Bed',      icon: '🛏️', color: '#3498db', scale: [1.4, 0.5, 2.0] },
  { type: 'lamp',     label: 'Lamp',     icon: '💡', color: '#e2c94a', scale: [0.4, 1.5, 0.4] },
];

// Default furniture items
const DEFAULT_ITEMS = [
  { id: 1, position: [-2, -1.25, 0], scale: [1, 1, 1], color: '#4a90e2', name: 'Object 1' },
  { id: 2, position: [2,  -1.25, 0], scale: [1, 1, 1], color: '#6b4f35', name: 'Object 2' },
  { id: 3, position: [0,  -1.25, 0], scale: [1, 1, 1], color: '#5a9e6f', name: 'Object 3' },
];

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Design Tool', path: '/design' },
];

// ─── Small numeric field used in the Properties Panel ───────────────────────
function PropField({ label, value, onChange, adornment, step = 0.1, min }) {
  return (
    <TextField
      label={label}
      type="number"
      value={parseFloat(value.toFixed(2))}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      size="small"
      inputProps={{ step, ...(min !== undefined ? { min } : {}) }}
      InputProps={adornment ? { endAdornment: <InputAdornment position="end">{adornment}</InputAdornment> } : {}}
    />
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
const Design = () => {
  const navigate = useNavigate();

  // ── Room state ──────────────────────────────────────────────────────────────
  const [roomData, setRoomData]   = useState({ width: 10, height: 10, color: '#ffffff' });
  // eslint-disable-next-line no-unused-vars
  const [currentDesignId, setCurrentDesignId] = useState(null);
  const [loading, setLoading]     = useState(false);

  // ── Furniture + selection state ─────────────────────────────────────────────
  const [items, setItems]                         = useState(DEFAULT_ITEMS);
  const [selectedId, setSelectedId]               = useState(null);
  const [snapToGridEnabled, setSnapToGridEnabled]  = useState(true);
  const [furnitureCatalogue, setFurnitureCatalogue] = useState(FURNITURE_CATALOGUE);
  const [message, setMessage] = useState({ text: '', severity: 'success' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  // ── Load design on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        const res = await axiosInstance.get('/api/admin/furniture/public');
        if (res.data.length > 0) {
          setFurnitureCatalogue(res.data.map(f => ({
            type: f.type,
            label: f.label,
            icon: f.icon,
            color: f.color,
            scale: f.scale,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch furniture', err);
      }
    };
    fetchFurniture();
  }, []);

  const showMessage = (text, severity = 'success') => {
    setMessage({ text, severity });
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const loadDesign = async () => {
      try {
        const response = await axiosInstance.get('/api/designs');
        const designs = response.data;
        if (designs.length > 0) {
          const design = designs[0];
          setCurrentDesignId(design._id);
          setRoomData(design.roomData || { width: 10, height: 10, color: '#ffffff' });
          if (design.furniture?.length) {
            setItems(design.furniture.map((f, idx) => ({
              id: f.id || idx + 1,
              position: [f.position?.x ?? 0, f.position?.y ?? -1.25, f.position?.z ?? 0],
              scale: [f.scale ?? 1, f.scale ?? 1, f.scale ?? 1],
              color: f.color || COLOR_SWATCHES[idx % COLOR_SWATCHES.length],
              name: f.name || `Object ${idx + 1}`,
            })));
          }
        }
      } catch (error) {
        console.error('Error loading design:', error);
        showMessage('Failed to load design', 'error');
      }
    };
    loadDesign();
  }, []);

  // ── Save design ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const designData = {
        name: 'My Design',
        roomData: { width: roomData.width, height: roomData.height, color: roomData.color },
        furniture: items.map((item) => ({
          id: item.id,
          name: item.name,
          color: item.color,
          position: { x: item.position[0], y: item.position[1], z: item.position[2] },
          scale: item.scale[0],
        })),
      };
      const response = await axiosInstance.post('/api/designs', designData);
      setCurrentDesignId(response.data._id);
      showMessage('Design saved successfully!');
    } catch (error) {
      console.error('Error saving design:', error);
      showMessage('Error saving design. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    try {
      await axiosInstance.post('/api/auth/logout');
      showMessage('Logged out successfully');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/');
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleRoomDataChange = (field, value) =>
    setRoomData((prev) => ({ ...prev, [field]: value }));

  const handleTransformChange = (id, data) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const updateSelected = (patch) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) => (item.id === selectedId ? { ...item, ...patch } : item))
    );
  };

  const handlePositionChange = (axis, value) => {
    if (!selectedItem) return;
    const idx = { x: 0, y: 1, z: 2 }[axis];
    const newPos = [...selectedItem.position];
    newPos[idx] = value;
    updateSelected({ position: newPos });
  };

  const handleScaleChange = (axis, value) => {
    if (!selectedItem) return;
    const idx = { x: 0, y: 1, z: 2 }[axis];
    const newScale = [...selectedItem.scale];
    newScale[idx] = Math.max(0.1, value);
    updateSelected({ scale: newScale });
  };

  const handleAddFurniture = (template) => {
    const newId = Date.now();
    const count = items.filter((i) => i.name.startsWith(template.label)).length;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        name: count > 0 ? `${template.label} ${count + 1}` : template.label,
        color: template.color,
        scale: [...template.scale],
        position: [0, -1.25, 0],
      },
    ]);
    setSelectedId(newId);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setItems((prev) => prev.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', backgroundColor: 'var(--canvas-base)', minHeight: '100vh' }}>
      <AppSidebar navItems={NAV_ITEMS} onLogout={handleLogout} />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>

        {/* ── Top bar ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'var(--text-high)' }}>
            Design Studio
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Save Design'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/dashboard')}
            >
              ← Dashboard
            </Button>
          </Box>
        </Box>

        {/* ── Three-column layout ── */}
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>

          {/* ── LEFT: Room Configuration ── */}
          <Grid item xs={12} md={2.5}>
            <Paper
              sx={{
                p: 2.5,
                backgroundColor: 'var(--surface-1)',
                height: '100%',
                border: '1px solid var(--grid-lines)',
                overflowY: 'auto',
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'var(--brand-primary)', fontWeight: 700, letterSpacing: 0.5 }}>
                ROOM CONFIG
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Width (m)"
                  type="number"
                  value={roomData.width}
                  onChange={(e) => handleRoomDataChange('width', parseFloat(e.target.value) || 0)}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Depth (m)"
                  type="number"
                  value={roomData.height}
                  onChange={(e) => handleRoomDataChange('height', parseFloat(e.target.value) || 0)}
                  size="small"
                  fullWidth
                />
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--text-med)', mb: 0.5, display: 'block' }}>
                    Wall Colour
                  </Typography>
                  <input
                    type="color"
                    value={roomData.color}
                    onChange={(e) => handleRoomDataChange('color', e.target.value)}
                    style={{
                      width: '100%',
                      height: 40,
                      border: '1px solid var(--grid-lines)',
                      borderRadius: 6,
                      cursor: 'pointer',
                      padding: 2,
                      backgroundColor: 'transparent',
                    }}
                  />
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" sx={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                  SNAP TO GRID
                </Typography>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontSize: 14,
                    color: 'var(--text-med)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={snapToGridEnabled}
                    onChange={(e) => setSnapToGridEnabled(e.target.checked)}
                    style={{ cursor: 'pointer', accentColor: 'var(--brand-primary)', width: 16, height: 16 }}
                  />
                  Enable (0.5 unit grid)
                </label>

                <Divider sx={{ my: 1 }} />

                {/* ── Furniture Library ── */}
                <Typography variant="subtitle2" sx={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                  FURNITURE LIBRARY
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-med)', mt: -1 }}>
                  Click to add to scene
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {furnitureCatalogue.map((template) => (
                    <Button
                      key={template.type}
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddFurniture(template)}
                      sx={{
                        justifyContent: 'flex-start',
                        gap: 1,
                        borderColor: 'var(--grid-lines)',
                        color: 'var(--brand-primary)',
                        backgroundColor: 'var(--canvas-base)',
                        fontSize: 13,
                        '&:hover': {
                          borderColor: 'var(--brand-primary)',
                          backgroundColor: 'var(--surface-2)',
                        },
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{template.icon}</span>
                      {template.label}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* ── CENTRE: 3-D Canvas ── */}
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                height: '100%',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--grid-lines)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  px: 2, py: 1,
                  borderBottom: '1px solid var(--grid-lines)',
                  backgroundColor: 'var(--surface-2)',
                  flexShrink: 0,
                }}
              >
                <Typography variant="caption" sx={{ color: 'var(--text-med)', fontWeight: 600 }}>
                  3D CANVAS — click an object to select it, drag to move
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FurnitureItem
                  externalItems={items}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onTransformChange={handleTransformChange}
                  snapToGridEnabled={snapToGridEnabled}
                />
              </Box>
            </Paper>
          </Grid>

          {/* ── RIGHT: Properties Panel ── */}
          <Grid item xs={12} md={2.5}>
            <Paper
              sx={{
                p: 2.5,
                backgroundColor: 'var(--surface-1)',
                height: '100%',
                border: '1px solid var(--grid-lines)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'var(--text-high)', fontWeight: 700, letterSpacing: 0.5 }}>
                PROPERTIES
              </Typography>

              {!selectedItem ? (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    border: '2px dashed var(--grid-lines)',
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'var(--text-med)' }}>
                    Click an object in the scene to edit its properties
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                  {/* Object name + delete */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                      {selectedItem.name}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleDeleteSelected}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        py: 0.25,
                        fontSize: 11,
                        borderColor: 'var(--color-error)',
                        color: 'var(--color-error)',
                        '&:hover': {
                          backgroundColor: 'rgba(207,102,121,0.1)',
                          borderColor: 'var(--color-error)',
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </Box>

                  <Divider />

                  {/* ── Position ── */}
                  <Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-med)', fontWeight: 600, display: 'block', mb: 1 }}>
                      POSITION
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <PropField label="X" value={selectedItem.position[0]} onChange={(v) => handlePositionChange('x', v)} adornment="m" />
                      <PropField label="Y" value={selectedItem.position[1]} onChange={(v) => handlePositionChange('y', v)} adornment="m" />
                      <PropField label="Z" value={selectedItem.position[2]} onChange={(v) => handlePositionChange('z', v)} adornment="m" />
                    </Box>
                  </Box>

                  <Divider />

                  {/* ── Scale ── */}
                  <Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-med)', fontWeight: 600, display: 'block', mb: 1 }}>
                      SCALE
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <PropField label="W" value={selectedItem.scale[0]} onChange={(v) => handleScaleChange('x', v)} step={0.05} min={0.1} />
                      <PropField label="H" value={selectedItem.scale[1]} onChange={(v) => handleScaleChange('y', v)} step={0.05} min={0.1} />
                      <PropField label="D" value={selectedItem.scale[2]} onChange={(v) => handleScaleChange('z', v)} step={0.05} min={0.1} />
                    </Box>
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="caption" sx={{ color: 'var(--text-med)', display: 'block', mb: 0.5 }}>
                        Uniform scale
                      </Typography>
                      <Slider
                        min={0.1} max={3} step={0.05}
                        value={selectedItem.scale[0]}
                        onChange={(_, v) => updateSelected({ scale: [v, v, v] })}
                        sx={{ color: 'var(--brand-primary)', '& .MuiSlider-thumb': { width: 14, height: 14 } }}
                      />
                    </Box>
                  </Box>

                  <Divider />

                  {/* ── Colour ── */}
                  <Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-med)', fontWeight: 600, display: 'block', mb: 1 }}>
                      COLOUR
                    </Typography>

                    {/* Swatch grid */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                      {COLOR_SWATCHES.map((c) => (
                        <Box
                          key={c}
                          onClick={() => updateSelected({ color: c })}
                          sx={{
                            width: 28, height: 28,
                            borderRadius: '50%',
                            backgroundColor: c,
                            cursor: 'pointer',
                            border: selectedItem.color === c
                              ? '3px solid var(--brand-primary)'
                              : '2px solid transparent',
                            boxShadow: selectedItem.color === c
                              ? '0 0 0 1px var(--grid-lines)'
                              : 'none',
                            transition: 'transform 0.1s',
                            '&:hover': { transform: 'scale(1.15)' },
                          }}
                        />
                      ))}
                    </Box>

                    {/* Custom colour picker */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={selectedItem.color}
                        onChange={(e) => updateSelected({ color: e.target.value })}
                        style={{
                          width: 36, height: 36,
                          border: '1px solid var(--grid-lines)',
                          borderRadius: 4, cursor: 'pointer', padding: 2,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'var(--text-med)', fontFamily: 'monospace' }}>
                        {selectedItem.color.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>

                </Box>
              )}
            </Paper>
          </Grid>

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

export default Design;
