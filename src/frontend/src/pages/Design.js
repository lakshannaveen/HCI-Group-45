import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, TextField, Grid,
  Divider, Slider, InputAdornment,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import FurnitureItem from '../components/FurnitureItem';

// ─── Palette ────────────────────────────────────────────────────────────────
const BROWN       = '#6b4f35';
const BROWN_DARK  = '#5a4230';
const TAN         = '#8b6f47';
const BG_PAGE     = '#f7f1e3';
const BG_PAPER    = '#f9f6f0';
const BG_PANEL    = '#f2ece0';
const BORDER      = '#d4c5a9';

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
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: BORDER },
          '&:hover fieldset': { borderColor: TAN },
          '&.Mui-focused fieldset': { borderColor: BROWN },
        },
        '& .MuiInputLabel-root': { color: TAN },
        '& .MuiInputLabel-root.Mui-focused': { color: BROWN },
      }}
    />
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
const Design = () => {
  const navigate = useNavigate();
  const { id: designId } = useParams();

  // ── Room state ──────────────────────────────────────────────────────────────
  const [roomData, setRoomData]   = useState({ width: 10, height: 10, color: '#ffffff' });
  // eslint-disable-next-line no-unused-vars
  const [currentDesignId, setCurrentDesignId] = useState(designId || null);

  // ── Furniture + selection state ─────────────────────────────────────────────
  const [items, setItems]                         = useState(DEFAULT_ITEMS);
  const [selectedId, setSelectedId]               = useState(null);
  const [snapToGridEnabled, setSnapToGridEnabled]  = useState(true);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  // ── Load design on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    const loadDesign = async () => {
      try {
        if (designId) {
          // Load specific design by ID
          const response = await axiosInstance.get(`/api/designs`);
          const designs = response.data;
          const design = designs.find(d => d._id === designId);
          
          if (design) {
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
        }
      } catch (error) {
        console.error('Error loading design:', error);
      }
    };
    loadDesign();
  }, [designId]);

  // ── Save design ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
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
      alert('Design saved successfully!');
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Error saving design. Please try again.');
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleRoomDataChange = (field, value) =>
    setRoomData((prev) => ({ ...prev, [field]: value }));

  /** Called by FurnitureItem when user drags a 3D object → push new pos/scale into state */
  const handleTransformChange = (id, data) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  /** Update any scalar property of the selected item from the Properties Panel */
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

  /** Add a new furniture item from the catalogue */
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

  /** Delete the currently selected item */
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setItems((prev) => prev.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 2, backgroundColor: BG_PAGE, minHeight: '100vh' }}>

      {/* ── Top bar ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ color: BROWN, fontWeight: 600 }}>
          Design Studio
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ backgroundColor: BROWN, '&:hover': { backgroundColor: BROWN_DARK } }}
          >
            Save Design
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            sx={{ borderColor: BROWN, color: BROWN, '&:hover': { borderColor: BROWN_DARK, backgroundColor: BG_PAPER } }}
          >
            ← Dashboard
          </Button>
        </Box>
      </Box>

      {/* ── Three-column layout ── */}
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>

        {/* ── LEFT: Room Configuration ── */}
        <Grid item xs={12} md={2.5}>
          <Paper sx={{ p: 2.5, backgroundColor: BG_PAPER, height: '100%', border: `1px solid ${BORDER}`, overflowY: 'auto' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, color: BROWN, fontWeight: 700, letterSpacing: 0.5 }}>
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
                sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: BORDER } }}
              />
              <TextField
                label="Depth (m)"
                type="number"
                value={roomData.height}
                onChange={(e) => handleRoomDataChange('height', parseFloat(e.target.value) || 0)}
                size="small"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: BORDER } }}
              />
              <Box>
                <Typography variant="caption" sx={{ color: TAN, mb: 0.5, display: 'block' }}>
                  Wall Colour
                </Typography>
                <input
                  type="color"
                  value={roomData.color}
                  onChange={(e) => handleRoomDataChange('color', e.target.value)}
                  style={{ width: '100%', height: 40, border: `1px solid ${BORDER}`, borderRadius: 4, cursor: 'pointer', padding: 2 }}
                />
              </Box>

              <Divider sx={{ borderColor: BORDER, my: 1 }} />

              <Typography variant="subtitle2" sx={{ color: BROWN, fontWeight: 700 }}>
                SNAP TO GRID
              </Typography>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: BROWN }}>
                <input
                  type="checkbox"
                  checked={snapToGridEnabled}
                  onChange={(e) => setSnapToGridEnabled(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: BROWN, width: 16, height: 16 }}
                />
                Enable (0.5 unit grid)
              </label>

              <Divider sx={{ borderColor: BORDER, my: 1 }} />

              {/* ── Furniture Library ── */}
              <Typography variant="subtitle2" sx={{ color: BROWN, fontWeight: 700 }}>
                FURNITURE LIBRARY
              </Typography>
              <Typography variant="caption" sx={{ color: TAN, mt: -1 }}>
                Click to add to scene
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {FURNITURE_CATALOGUE.map((template) => (
                  <Button
                    key={template.type}
                    variant="outlined"
                    size="small"
                    onClick={() => handleAddFurniture(template)}
                    sx={{
                      justifyContent: 'flex-start',
                      gap: 1,
                      borderColor: BORDER,
                      color: BROWN,
                      backgroundColor: BG_PAGE,
                      textTransform: 'none',
                      fontSize: 13,
                      '&:hover': {
                        borderColor: BROWN,
                        backgroundColor: BG_PANEL,
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
              backgroundColor: '#e8e0d4',
              border: `1px solid ${BORDER}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${BORDER}`, backgroundColor: BG_PANEL, flexShrink: 0 }}>
              <Typography variant="caption" sx={{ color: TAN, fontWeight: 600 }}>
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
              backgroundColor: BG_PAPER,
              height: '100%',
              border: `1px solid ${BORDER}`,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, color: BROWN, fontWeight: 700, letterSpacing: 0.5 }}>
              PROPERTIES
            </Typography>

            {!selectedItem ? (
              <Box
                sx={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center', border: `2px dashed ${BORDER}`, borderRadius: 2, px: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: TAN }}>
                  Click an object in the scene to edit its properties
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                {/* Object name + delete */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ color: BROWN, fontWeight: 700 }}>
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
                      borderColor: '#c0392b',
                      color: '#c0392b',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#fdecea', borderColor: '#a93226' },
                    }}
                  >
                    Delete
                  </Button>
                </Box>

                <Divider sx={{ borderColor: BORDER }} />

                {/* ── Position ── */}
                <Box>
                  <Typography variant="caption" sx={{ color: TAN, fontWeight: 600, display: 'block', mb: 1 }}>
                    POSITION
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <PropField label="X" value={selectedItem.position[0]} onChange={(v) => handlePositionChange('x', v)} adornment="m" />
                    <PropField label="Y" value={selectedItem.position[1]} onChange={(v) => handlePositionChange('y', v)} adornment="m" />
                    <PropField label="Z" value={selectedItem.position[2]} onChange={(v) => handlePositionChange('z', v)} adornment="m" />
                  </Box>
                </Box>

                <Divider sx={{ borderColor: BORDER }} />

                {/* ── Scale ── */}
                <Box>
                  <Typography variant="caption" sx={{ color: TAN, fontWeight: 600, display: 'block', mb: 1 }}>
                    SCALE
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <PropField label="W" value={selectedItem.scale[0]} onChange={(v) => handleScaleChange('x', v)} step={0.05} min={0.1} />
                    <PropField label="H" value={selectedItem.scale[1]} onChange={(v) => handleScaleChange('y', v)} step={0.05} min={0.1} />
                    <PropField label="D" value={selectedItem.scale[2]} onChange={(v) => handleScaleChange('z', v)} step={0.05} min={0.1} />
                  </Box>
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" sx={{ color: TAN, display: 'block', mb: 0.5 }}>
                      Uniform scale
                    </Typography>
                    <Slider
                      min={0.1} max={3} step={0.05}
                      value={selectedItem.scale[0]}
                      onChange={(_, v) => updateSelected({ scale: [v, v, v] })}
                      sx={{ color: BROWN, '& .MuiSlider-thumb': { width: 14, height: 14 } }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ borderColor: BORDER }} />

                {/* ── Colour ── */}
                <Box>
                  <Typography variant="caption" sx={{ color: TAN, fontWeight: 600, display: 'block', mb: 1 }}>
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
                            ? `3px solid ${BROWN}`
                            : `2px solid transparent`,
                          boxShadow: selectedItem.color === c
                            ? `0 0 0 1px ${BORDER}`
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
                        border: `1px solid ${BORDER}`,
                        borderRadius: 4, cursor: 'pointer', padding: 2,
                      }}
                    />
                    <Typography variant="caption" sx={{ color: TAN, fontFamily: 'monospace' }}>
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
  );
};

export default Design;