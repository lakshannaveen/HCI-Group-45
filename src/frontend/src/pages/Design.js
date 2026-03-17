import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Typography, TextField, Divider, Tooltip,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  List, ListItem, ListItemText, ListItemButton, CircularProgress,
  Switch, FormControlLabel,
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import FurnitureItem from '../components/FurnitureItem';
import TopNavbar from '../components/TopNavbar';

// ─── Colour swatches ─────────────────────────────────────────────────────────
const COLOR_SWATCHES = [
  '#4a90e2', '#6b4f35', '#5a9e6f', '#e2844a',
  '#9b59b6', '#e24a4a', '#2ecc71', '#e2c94a',
  '#1abc9c', '#e74c3c', '#3498db', '#95a5a6',
];

// ─── Default furniture catalogue (overridden from API) ────────────────────────
const FURNITURE_CATALOGUE = [
  { type: 'chair',        label: 'Chair',        icon: '🪑', color: '#e2844a', scale: [0.7,  1.0,  0.7] },
  { type: 'table',        label: 'Table',        icon: '🪵', color: '#6b4f35', scale: [1.6,  0.5,  1.0] },
  { type: 'sofa',         label: 'Sofa',         icon: '🛋️', color: '#9b59b6', scale: [2.0,  0.8,  0.9] },
  { type: 'wardrobe',     label: 'Wardrobe',     icon: '🗄️', color: '#95a5a6', scale: [1.2,  2.0,  0.6] },
  { type: 'bed',          label: 'Bed',          icon: '🛏️', color: '#3498db', scale: [1.4,  0.5,  2.0] },
  { type: 'lamp',         label: 'Lamp',         icon: '💡', color: '#e2c94a', scale: [0.4,  1.5,  0.4] },
  { type: 'dining-table', label: 'Dining Table', icon: '🍽️', color: '#8B4513', scale: [1.8,  0.5,  0.9] },
  { type: 'bookshelf',    label: 'Bookshelf',    icon: '📚', color: '#DEB887', scale: [1.0,  1.8,  0.3] },
  { type: 'desk',         label: 'Desk',         icon: '🖥️', color: '#A0522D', scale: [1.2,  0.5,  0.7] },
  { type: 'coffee-table', label: 'Coffee Table', icon: '☕', color: '#D2691E', scale: [0.9,  0.4,  0.5] },
];

// ─── Tool palette ─────────────────────────────────────────────────────────────
const TOOLS = [
  { id: 'select',   label: 'Select',   symbol: '▶',  hasLibrary: false },
  { id: 'seating',  label: 'Seating',  symbol: '🪑', hasLibrary: true, filter: ['chair', 'sofa'] },
  { id: 'beds',     label: 'Beds',     symbol: '🛏️', hasLibrary: true, filter: ['bed'] },
  { id: 'tables',   label: 'Tables',   symbol: '🍽️', hasLibrary: true, filter: ['table', 'dining-table', 'coffee-table', 'desk'] },
  { id: 'storage',  label: 'Storage',  symbol: '🗄️', hasLibrary: true, filter: ['wardrobe', 'bookshelf'] },
  { id: 'lighting', label: 'Lighting', symbol: '💡', hasLibrary: true, filter: ['lamp'] },
  { id: 'all',      label: 'All',      symbol: '🏠', hasLibrary: true, filter: null },
];

// ─── Numeric field for properties panel ──────────────────────────────────────
function PropField({ label, value, onChange, step = 0.1, min }) {
  const safeVal = (value != null && !isNaN(value)) ? value : 0;
  return (
    <TextField
      label={label}
      type="number"
      value={parseFloat(safeVal.toFixed(2))}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      size="small"
      fullWidth
      inputProps={{ step, ...(min !== undefined ? { min } : {}) }}
    />
  );
}

// ─── "Open Design" dialog ─────────────────────────────────────────────────────
function OpenDesignDialog({ open, onClose, onOpen }) {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axiosInstance
      .get('/api/designs')
      .then((res) => setDesigns(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ color: 'var(--text-high)', borderBottom: '1px solid var(--grid-lines)', fontWeight: 700 }}
      >
        Open Design
      </DialogTitle>
      <DialogContent sx={{ p: 0, backgroundColor: 'var(--surface-1)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : designs.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: 'var(--text-med)', p: 3, textAlign: 'center' }}
          >
            No saved designs found.
          </Typography>
        ) : (
          <List disablePadding>
            {designs.map((d) => (
              <ListItemButton
                key={d._id}
                onClick={() => onOpen(d)}
                sx={{
                  borderBottom: '1px solid var(--grid-lines)',
                  '&:hover': { backgroundColor: 'var(--surface-2)' },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ color: 'var(--text-high)', fontWeight: 600 }}>
                      {d.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: 'var(--text-low)' }}>
                      {d.roomData
                        ? `${d.roomData.width || '?'}m × ${d.roomData.length || d.roomData.height || '?'}m`
                        : 'No room data'}{' '}
                      — {new Date(d.createdAt).toLocaleDateString()}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Design component ────────────────────────────────────────────────────
const Design = () => {
  const navigate = useNavigate();
  const { id: designId } = useParams();
  const location = useLocation();
  const roomConfig = location.state?.roomConfig;

  // Room state (init from Room Config Modal if provided)
  const [roomData, setRoomData] = useState({
    width:      roomConfig?.width  ? parseFloat(roomConfig.width)  : 10,
    height:     roomConfig?.length ? parseFloat(roomConfig.length) : 10,
    color:      roomConfig?.wallColor  || '#e8e8e8',
    floorColor: roomConfig?.floorColor || '#c8b89a',
  });

  const [currentDesignId, setCurrentDesignId] = useState(designId || null);
  const [designName, setDesignName]           = useState('Untitled Design');
  const [loading, setLoading]                 = useState(false);

  // Furniture
  const [items, setItems]                         = useState([]);
  const [selectedId, setSelectedId]               = useState(null);
  const [snapToGridEnabled, setSnapToGridEnabled]  = useState(true);
  const [furnitureCatalogue, setFurnitureCatalogue] = useState(FURNITURE_CATALOGUE);

  // CAD toolbar
  const [activeTool, setActiveTool]   = useState('select');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [is2DMode, setIs2DMode]       = useState(false);
  const [transformMode, setTransformMode] = useState('translate');
  const [openDialogOpen, setOpenDialogOpen] = useState(false);

  // Undo / Redo
  const [history, setHistory]         = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [message, setMessage]         = useState({ text: '', severity: 'success' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const copiedItemRef = useRef(null);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const showMessage = (text, severity = 'success') => {
    setMessage({ text, severity });
    setSnackbarOpen(true);
  };

  // ── Load furniture catalogue from API ───────────────────────────────────────
  useEffect(() => {
    axiosInstance
      .get('/api/admin/furniture/public')
      .then((res) => {
        if (res.data.length > 0) {
          setFurnitureCatalogue(
            res.data.map((f) => ({
              type: f.type, label: f.label, icon: f.icon,
              color: f.color || '#888888', scale: f.scale || [1, 1, 1],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // ── Load existing design by URL id ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!designId) return;
      try {
        const res    = await axiosInstance.get('/api/designs');
        const design = res.data.find((d) => d._id === designId);
        if (!design) return;

        setCurrentDesignId(design._id);
        setDesignName(design.name || 'Untitled Design');

        const rd = design.roomData || {};
        setRoomData({
          width:      rd.width              || 10,
          height:     rd.length             || rd.height || 10,
          color:      rd.wallColor          || rd.color  || '#e8e8e8',
          floorColor: rd.floorColor         || '#c8b89a',
        });

        if (design.furniture?.length) {
          const loaded = design.furniture.map((f, idx) => {
            // f.scale may be a number (legacy save) or a 3-element array
            const scaleArr = Array.isArray(f.scale)
              ? f.scale.map((v) => (typeof v === 'number' && !isNaN(v) ? v : 1))
              : [f.scale ?? 1, f.scale ?? 1, f.scale ?? 1];
            return {
              id:       f.id || idx + 1,
              name:     f.name || `Object ${idx + 1}`,
              color:    f.color || COLOR_SWATCHES[idx % COLOR_SWATCHES.length],
              position: [f.position?.x ?? 0, f.position?.y ?? -2, f.position?.z ?? 0],
              rotation: [f.rotation?.x ?? 0, f.rotation?.y ?? 0, f.rotation?.z ?? 0],
              scale:    scaleArr,
            };
          });
          setItems(loaded);
          setHistory([loaded]);
          setHistoryIndex(0);
        } else {
          setItems([]);
          setHistory([[]]);
          setHistoryIndex(0);
        }
      } catch {
        showMessage('Failed to load design', 'error');
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designId]);

  // ── History ────────────────────────────────────────────────────────────────
  const pushHistory = (newItems) => {
    const next = history.slice(0, historyIndex + 1);
    next.push(newItems);
    setHistory(next);
    setHistoryIndex(next.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex === 0) return;
    const idx = historyIndex - 1;
    setHistoryIndex(idx);
    setItems(history[idx]);
    setSelectedId(null);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    setHistoryIndex(idx);
    setItems(history[idx]);
    setSelectedId(null);
  };

  // ── Save (POST for new, PUT for existing) ──────────────────────────────────
  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = {
        name: designName || 'Untitled Design',
        roomData: {
          width:      roomData.width,
          height:     roomData.height,
          color:      roomData.color,
          wallColor:  roomData.color,
          floorColor: roomData.floorColor,
        },
        furniture: items.map((item) => ({
          id:       item.id,
          name:     item.name,
          color:    item.color,
          position: { x: item.position[0], y: item.position[1], z: item.position[2] },
          rotation: { x: item.rotation?.[0] ?? 0, y: item.rotation?.[1] ?? 0, z: item.rotation?.[2] ?? 0 },
          scale:    Array.isArray(item.scale) ? item.scale : [item.scale ?? 1, item.scale ?? 1, item.scale ?? 1],
        })),
      };

      let response;
      if (currentDesignId) {
        response = await axiosInstance.put(`/api/designs/${currentDesignId}`, payload);
      } else {
        response = await axiosInstance.post('/api/designs', payload);
        setCurrentDesignId(response.data._id);
        // Update URL without remounting (replace so Back works cleanly)
        navigate(`/design/${response.data._id}`, { replace: true, state: location.state });
      }

      showMessage('Design saved successfully!');
    } catch {
      showMessage('Error saving design. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Open dialog ────────────────────────────────────────────────────────────
  const handleOpenDesign = (design) => {
    setOpenDialogOpen(false);
    navigate(`/design/${design._id}`);
  };

  // ── Tool palette ───────────────────────────────────────────────────────────
  const handleToolSelect = (tool) => {
    setActiveTool(tool.id);
    if (tool.hasLibrary) {
      setLibraryOpen(true);
      setActiveFilter(tool.filter);
    } else {
      setLibraryOpen(false);
    }
  };

  const getLibraryItems = () => {
    if (!activeFilter) return furnitureCatalogue;
    if (Array.isArray(activeFilter)) return furnitureCatalogue.filter((f) => activeFilter.includes(f.type));
    return furnitureCatalogue.filter((f) => f.type === activeFilter);
  };

  // ── Furniture operations ───────────────────────────────────────────────────
  const handleAddFurniture = (template) => {
    const newId  = Date.now();
    const count  = items.filter((i) => i.name?.startsWith(template.label)).length;
    const newItems = [
      ...items,
      {
        id:       newId,
        name:     count > 0 ? `${template.label} ${count + 1}` : template.label,
        color:    template.color,
        scale:    [...template.scale],
        position: [0, -2, 0],
        rotation: [0, 0, 0],
      },
    ];
    setItems(newItems);
    pushHistory(newItems);
    setSelectedId(newId);
    setActiveTool('select');
    setLibraryOpen(false);
  };

  const handleTransformChange = (id, data) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
  };

  const updateSelected = (patch) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) => (item.id === selectedId ? { ...item, ...patch } : item))
    );
  };

  const handlePositionChange = (axis, value) => {
    if (!selectedItem) return;
    const idx    = { x: 0, y: 1, z: 2 }[axis];
    const newPos = [...selectedItem.position];
    newPos[idx]  = value;
    updateSelected({ position: newPos });
  };

  const handleScaleChange = (axis, value) => {
    if (!selectedItem) return;
    const idx      = { x: 0, y: 1, z: 2 }[axis];
    const newScale = [...selectedItem.scale];
    newScale[idx]  = Math.max(0.1, value);
    updateSelected({ scale: newScale });
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const newItems = items.filter((i) => i.id !== selectedId);
    setItems(newItems);
    pushHistory(newItems);
    setSelectedId(null);
  };

  const handleRotationChange = (axis, value) => {
    if (!selectedItem) return;
    const idx = { x: 0, y: 1, z: 2 }[axis];
    const newRot = [...(selectedItem.rotation || [0, 0, 0])];
    newRot[idx] = (value * Math.PI) / 180;
    updateSelected({ rotation: newRot });
  };

  const handleRotate90 = (direction) => {
    if (!selectedItem) return;
    const rot = [...(selectedItem.rotation || [0, 0, 0])];
    rot[1] = rot[1] + (direction * Math.PI) / 2;
    updateSelected({ rotation: rot });
  };

  const handleFlip = (axis) => {
    if (!selectedItem) return;
    const idx = { h: 0, v: 2 }[axis];
    const newScale = [...selectedItem.scale];
    newScale[idx] = -newScale[idx];
    updateSelected({ scale: newScale });
  };

  const handleDuplicate = () => {
    if (!selectedItem) return;
    const newItem = {
      ...selectedItem,
      id: Date.now(),
      name: `${selectedItem.name} (copy)`,
      position: [
        selectedItem.position[0] + 0.5,
        selectedItem.position[1],
        selectedItem.position[2] + 0.5,
      ],
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    pushHistory(newItems);
    setSelectedId(newItem.id);
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!target) return false;
      const tag = target.tagName?.toLowerCase();
      return target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
    };

    const cloneItemForClipboard = (item) => ({
      ...item,
      position: [...(item.position || [0, -2, 0])],
      rotation: [...(item.rotation || [0, 0, 0])],
      scale: [...(item.scale || [1, 1, 1])],
    });

    const handleKeyDown = (event) => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const raw = event.key;
      const isModifier = event.ctrlKey || event.metaKey;

      // Escape → deselect
      if (raw === 'Escape') {
        setSelectedId(null);
        return;
      }

      // Delete / Backspace → delete selected
      if ((key === 'delete' || key === 'backspace') && selectedItem) {
        event.preventDefault();
        handleDeleteSelected();
        return;
      }

      // Arrow keys → nudge selected item (0.5u; 0.1u with Shift)
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key) && selectedItem) {
        event.preventDefault();
        const step = event.shiftKey ? 0.1 : 0.5;
        const [x, y, z] = selectedItem.position;
        const offset = {
          arrowleft:  [-step, 0,     0    ],
          arrowright: [ step, 0,     0    ],
          arrowup:    [ 0,    0,    -step ],
          arrowdown:  [ 0,    0,     step ],
        }[key];
        updateSelected({ position: [x + offset[0], y + offset[1], z + offset[2]] });
        return;
      }

      // [ / ] → rotate selected ±90°
      if (raw === '[' && selectedItem) { event.preventDefault(); handleRotate90(-1); return; }
      if (raw === ']' && selectedItem) { event.preventDefault(); handleRotate90(1);  return; }

      if (!isModifier) {
        // R → toggle Move / Rotate mode
        if (key === 'r') { setTransformMode((m) => (m === 'translate' ? 'rotate' : 'translate')); return; }
        // G → toggle grid snap
        if (key === 'g') { setSnapToGridEnabled((s) => !s); return; }
        // 2 / 3 → switch 2D / 3D view
        if (raw === '2') { setIs2DMode(true);  return; }
        if (raw === '3') { setIs2DMode(false); return; }
        return;
      }

      // Ctrl/Cmd+S → save
      if (key === 's') {
        event.preventDefault();
        handleSave();
        return;
      }

      // Ctrl/Cmd+D → duplicate selected
      if (key === 'd' && selectedItem) {
        event.preventDefault();
        handleDuplicate();
        return;
      }

      // Ctrl/Cmd+C → copy selected
      if (key === 'c' && selectedItem) {
        event.preventDefault();
        copiedItemRef.current = cloneItemForClipboard(selectedItem);
        showMessage('Item copied');
        return;
      }

      // Ctrl/Cmd+V → paste
      if (key === 'v' && copiedItemRef.current) {
        event.preventDefault();
        const base = copiedItemRef.current;
        const newItem = {
          ...cloneItemForClipboard(base),
          id: Date.now(),
          name: `${base.name} (copy)`,
          position: [
            (base.position?.[0] ?? 0) + 0.5,
            base.position?.[1] ?? -2,
            (base.position?.[2] ?? 0) + 0.5,
          ],
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        pushHistory(newItems);
        setSelectedId(newItem.id);
        return;
      }

      // Ctrl/Cmd+Z → undo
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
        return;
      }

      // Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z → redo
      if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, items, historyIndex, history.length, loading]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'var(--canvas-base)',
        overflow: 'hidden',
      }}
    >
      <TopNavbar />

      {/* ════ DESIGN SUB-NAVBAR ════ */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 0.75,
          backgroundColor: 'var(--surface-1)',
          borderBottom: '1px solid var(--grid-lines)',
          flexShrink: 0,
          minHeight: 48,
          gap: 1,
          position: 'relative',
        }}
      >
        {/* Dashboard button */}
        <Button
          size="small"
          variant="text"
          onClick={() => navigate('/dashboard')}
          sx={{ color: 'var(--text-med)', flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          ← Dashboard
        </Button>

        {/* 1px divider */}
        <Box sx={{ width: '1px', height: 22, backgroundColor: 'var(--grid-lines)', flexShrink: 0 }} />

        {/* File ops: open · save · undo · redo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {[
            { title: 'Open Design',         symbol: '📁', onClick: () => setOpenDialogOpen(true), disabled: false },
            { title: 'Save (Ctrl+S)',       symbol: loading ? null : '💾', onClick: handleSave,  disabled: loading },
            { title: 'Undo (Ctrl+Z)',       symbol: '↩',  onClick: handleUndo,  disabled: historyIndex === 0 },
            { title: 'Redo (Ctrl+Y)',       symbol: '↪',  onClick: handleRedo,  disabled: historyIndex >= history.length - 1 },
          ].map(({ title, symbol, onClick, disabled }) => (
            <Tooltip key={title} title={title}>
              <span>
                <Button size="small" variant="outlined" disabled={disabled} onClick={onClick}
                  sx={{ minWidth: 34, width: 34, px: 0, py: 0.5, fontSize: 16, lineHeight: 1 }}>
                  {symbol ?? <CircularProgress size={14} />}
                </Button>
              </span>
            </Tooltip>
          ))}
        </Box>

        {/* 1px divider */}
        <Box sx={{ width: '1px', height: 22, backgroundColor: 'var(--grid-lines)', flexShrink: 0 }} />

        {/* Design name */}
        <TextField
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          size="small"
          variant="outlined"
          placeholder="Design name…"
          sx={{ width: 180, '& .MuiOutlinedInput-input': { py: 0.6, fontSize: '0.8125rem' } }}
        />

        {/* 1px divider */}
        <Box sx={{ width: '1px', height: 22, backgroundColor: 'var(--grid-lines)', flexShrink: 0 }} />

        {/* Snap toggle */}
        <Tooltip title="Snap objects to 0.5-unit grid (G)">
          <FormControlLabel
            control={
              <Switch size="small" checked={snapToGridEnabled}
                onChange={(e) => setSnapToGridEnabled(e.target.checked)}
                sx={{ '& .MuiSwitch-thumb': { width: 14, height: 14 } }} />
            }
            label={
              <Typography variant="caption" sx={{ color: 'var(--text-med)' }}>
                Snap
              </Typography>
            }
            sx={{ m: 0, gap: 0.5 }}
          />
        </Tooltip>

        {/* 1px divider */}
        <Box sx={{ width: '1px', height: 22, backgroundColor: 'var(--grid-lines)', flexShrink: 0 }} />

        {/* Move / Rotate toggle */}
        <Tooltip title="Switch between Move and Rotate (R)">
          <Box sx={{ display: 'flex', border: '1px solid var(--grid-lines)', borderRadius: 1, overflow: 'hidden' }}>
            {[
              { mode: 'translate', label: '↕', title: 'Move' },
              { mode: 'rotate',    label: '↻', title: 'Rotate' },
            ].map(({ mode, label, title }) => {
              const active = transformMode === mode;
              return (
                <Button key={mode} size="small" onClick={() => setTransformMode(mode)} title={title}
                  sx={{
                    px: 1.5, py: 0.5, borderRadius: 0, minWidth: 36, fontSize: '0.875rem',
                    backgroundColor: active ? 'var(--brand-primary)' : 'transparent',
                    color: active ? 'var(--canvas-base)' : 'var(--text-med)',
                    fontWeight: active ? 700 : 400,
                    '&:hover': { backgroundColor: active ? 'var(--brand-primary-hover)' : 'var(--surface-2)' },
                  }}>{label}</Button>
              );
            })}
          </Box>
        </Tooltip>

        {/* Selection actions — only visible when an item is selected */}
        {selectedItem && (
          <>
            <Box sx={{ width: '1px', height: 22, backgroundColor: 'var(--grid-lines)', flexShrink: 0 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {[
                { title: 'Rotate −90°',     symbol: '↺', onClick: () => handleRotate90(-1) },
                { title: 'Rotate +90°',     symbol: '↻', onClick: () => handleRotate90(1)  },
                { title: 'Flip Horizontal', symbol: '⇔', onClick: () => handleFlip('h')    },
                { title: 'Flip Vertical',   symbol: '⇕', onClick: () => handleFlip('v')    },
                { title: 'Duplicate (Ctrl+D)', symbol: '⧉', onClick: handleDuplicate        },
                { title: 'Delete',          symbol: '🗑️', onClick: handleDeleteSelected,  danger: true },
              ].map(({ title, symbol, onClick, danger }) => (
                <Tooltip key={title} title={title}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={onClick}
                    sx={{
                      minWidth: 34, width: 34, px: 0, py: 0.5,
                      fontSize: 15, lineHeight: 1,
                      ...(danger && {
                        borderColor: 'var(--color-error)',
                        color: 'var(--color-error)',
                        '&:hover': { backgroundColor: 'rgba(207,102,121,0.08)', borderColor: 'var(--color-error)' },
                      }),
                    }}
                  >
                    {symbol}
                  </Button>
                </Tooltip>
              ))}
            </Box>
          </>
        )}

      </Box>

      {/* ════ THREE-COLUMN LAYOUT ════ */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Narrow tool palette ── */}
        <Box
          sx={{
            width: 56,
            flexShrink: 0,
            backgroundColor: 'var(--surface-1)',
            borderRight: '1px solid var(--grid-lines)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 1,
            gap: 0.5,
          }}
        >
          {TOOLS.map((tool) => (
            <Tooltip key={tool.id} title={tool.label} placement="right">
              <span>
                <Box
                  onClick={() => handleToolSelect(tool)}
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      activeTool === tool.id
                        ? 'var(--brand-primary-muted)'
                        : 'transparent',
                    border:
                      activeTool === tool.id
                        ? '1px solid var(--brand-primary)'
                        : '1px solid transparent',
                    color:
                      activeTool === tool.id
                        ? 'var(--brand-primary)'
                        : 'var(--text-med)',
                    fontSize: tool.symbol.length > 1 ? 18 : 16,
                    transition: 'all 0.15s',
                    '&:hover': {
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--grid-lines)',
                    },
                  }}
                >
                  {tool.symbol}
                </Box>
              </span>
            </Tooltip>
          ))}
        </Box>

        {/* ── Expandable furniture library ── */}
        {libraryOpen && (
          <Box
            sx={{
              width: 200,
              flexShrink: 0,
              backgroundColor: 'var(--surface-1)',
              borderRight: '1px solid var(--grid-lines)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.5,
                py: 1,
                borderBottom: '1px solid var(--grid-lines)',
                flexShrink: 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'var(--brand-primary)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: '0.625rem',
                }}
              >
                {TOOLS.find((t) => t.id === activeTool)?.label || 'Library'}
              </Typography>
              <Box
                onClick={() => setLibraryOpen(false)}
                sx={{
                  cursor: 'pointer',
                  color: 'var(--text-med)',
                  fontSize: '0.8125rem',
                  lineHeight: 1,
                  p: 0.5,
                  '&:hover': { color: 'var(--text-high)' },
                }}
              >
                ✕
              </Box>
            </Box>

            {/* 2-column grid of furniture items */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {getLibraryItems().map((item) => (
                  <Box
                    key={item.type}
                    onClick={() => handleAddFurniture(item)}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: '1px solid var(--grid-lines)',
                      backgroundColor: 'var(--canvas-base)',
                      transition: 'all 0.15s',
                      '&:hover': {
                        borderColor: 'var(--brand-primary)',
                        backgroundColor: 'var(--surface-2)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--grid-lines)',
                        borderRadius: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 0.5,
                        fontSize: 20,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-med)',
                        fontSize: '0.625rem',
                        display: 'block',
                        lineHeight: 1.2,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Centre canvas ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'var(--surface-2)',
            position: 'relative',
          }}
        >
          <FurnitureItem
            externalItems={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onTransformChange={handleTransformChange}
            snapToGridEnabled={snapToGridEnabled}
            is2DOverride={is2DMode}
            roomData={roomData}
            transformMode={transformMode}
          />

          {/* 2D / 3D toggle — top-right canvas overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'flex',
              border: '1px solid var(--grid-lines)',
              borderRadius: 1,
              overflow: 'hidden',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {['2D', '3D'].map((mode) => {
              const active = mode === '2D' ? is2DMode : !is2DMode;
              return (
                <Button
                  key={mode}
                  size="small"
                  onClick={() => setIs2DMode(mode === '2D')}
                  sx={{
                    px: 1.5, py: 0.5, borderRadius: 0, minWidth: 36, fontSize: '0.8125rem',
                    backgroundColor: active ? 'var(--brand-primary)' : 'var(--surface-1)',
                    color: active ? 'var(--canvas-base)' : 'var(--text-med)',
                    fontWeight: active ? 700 : 400,
                    '&:hover': { backgroundColor: active ? 'var(--brand-primary)' : 'var(--surface-2)' },
                  }}
                >
                  {mode}
                </Button>
              );
            })}
          </Box>

          {/* Room size indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              pointerEvents: 'none',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-low)',
                fontFamily: 'monospace',
                fontSize: '0.625rem',
                backgroundColor: 'rgba(18,20,21,0.7)',
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
              }}
            >
              {roomData.width}m × {roomData.height}m
            </Typography>
          </Box>
        </Box>

        {/* ── Right properties inspector ── */}
        <Box
          sx={{
            width: 240,
            flexShrink: 0,
            backgroundColor: 'var(--surface-1)',
            borderLeft: '1px solid var(--grid-lines)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderBottom: '1px solid var(--grid-lines)',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-high)',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.6875rem',
                letterSpacing: '0.05em',
              }}
            >
              Properties
            </Typography>
          </Box>

          {!selectedItem ? (
            <>
              {/* Room properties when nothing is selected */}
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-med)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.625rem',
                  }}
                >
                  Room
                </Typography>
                <TextField
                  label="Width (m)"
                  type="number"
                  size="small"
                  fullWidth
                  value={roomData.width}
                  onChange={(e) =>
                    setRoomData((r) => ({ ...r, width: parseFloat(e.target.value) || 1 }))
                  }
                  inputProps={{ step: 0.5, min: 1 }}
                />
                <TextField
                  label="Depth (m)"
                  type="number"
                  size="small"
                  fullWidth
                  value={roomData.height}
                  onChange={(e) =>
                    setRoomData((r) => ({ ...r, height: parseFloat(e.target.value) || 1 }))
                  }
                  inputProps={{ step: 0.5, min: 1 }}
                />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'var(--text-med)', display: 'block', mb: 0.75 }}
                  >
                    Wall Color
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="color"
                      value={roomData.color}
                      onChange={(e) =>
                        setRoomData((r) => ({ ...r, color: e.target.value }))
                      }
                      style={{
                        width: 36,
                        height: 36,
                        border: '1px solid var(--grid-lines)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        padding: 2,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-med)',
                        fontFamily: 'monospace',
                        fontSize: '0.6875rem',
                      }}
                    >
                      {(roomData.color || '#e8e8e8').toUpperCase()}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'var(--text-med)', display: 'block', mb: 0.75 }}
                  >
                    Floor Color
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="color"
                      value={roomData.floorColor || '#c8b89a'}
                      onChange={(e) =>
                        setRoomData((r) => ({ ...r, floorColor: e.target.value }))
                      }
                      style={{
                        width: 36,
                        height: 36,
                        border: '1px solid var(--grid-lines)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        padding: 2,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-med)',
                        fontFamily: 'monospace',
                        fontSize: '0.6875rem',
                      }}
                    >
                      {(roomData.floorColor || '#c8b89a').toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'var(--text-low)', textAlign: 'center' }}
                >
                  Click a furniture item to edit its properties
                </Typography>
              </Box>
            </>
          ) : (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* Object name */}
              <Typography
                variant="caption"
                sx={{ color: 'var(--brand-primary)', fontWeight: 700 }}
              >
                {selectedItem.name}
              </Typography>

              {/* Dimensions (position) */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-med)',
                    fontWeight: 600,
                    display: 'block',
                    mb: 1,
                    textTransform: 'uppercase',
                    fontSize: '0.625rem',
                  }}
                >
                  Dimensions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <PropField
                    label="X Position"
                    value={selectedItem.position[0]}
                    onChange={(v) => handlePositionChange('x', v)}
                  />
                  <PropField
                    label="Y Position"
                    value={selectedItem.position[1]}
                    onChange={(v) => handlePositionChange('y', v)}
                  />
                  <PropField
                    label="Z Position"
                    value={selectedItem.position[2]}
                    onChange={(v) => handlePositionChange('z', v)}
                  />
                </Box>
              </Box>

              <Divider />

              {/* Rotation */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-med)',
                    fontWeight: 600,
                    display: 'block',
                    mb: 1,
                    textTransform: 'uppercase',
                    fontSize: '0.625rem',
                  }}
                >
                  Rotation
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <PropField
                    label="Y (deg)"
                    value={Math.round(((selectedItem.rotation?.[1] || 0) * 180) / Math.PI)}
                    onChange={(v) => handleRotationChange('y', v)}
                    step={15}
                  />
                  <PropField
                    label="X (deg)"
                    value={Math.round(((selectedItem.rotation?.[0] || 0) * 180) / Math.PI)}
                    onChange={(v) => handleRotationChange('x', v)}
                    step={15}
                  />
                  <PropField
                    label="Z (deg)"
                    value={Math.round(((selectedItem.rotation?.[2] || 0) * 180) / Math.PI)}
                    onChange={(v) => handleRotationChange('z', v)}
                    step={15}
                  />
                </Box>
              </Box>

              <Divider />

              {/* Color */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-med)',
                    fontWeight: 600,
                    display: 'block',
                    mb: 1,
                    textTransform: 'uppercase',
                    fontSize: '0.625rem',
                  }}
                >
                  Color
                </Typography>

                {/* Fill */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'var(--text-low)', width: 36, flexShrink: 0 }}
                  >
                    Fill
                  </Typography>
                  <TextField
                    size="small"
                    value={(selectedItem.color || '#888888').toUpperCase()}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                    sx={{
                      flex: 1,
                      '& input': { fontSize: '0.625rem', fontFamily: 'monospace', py: 0.75 },
                    }}
                  />
                  <input
                    type="color"
                    value={selectedItem.color || '#888888'}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                    style={{
                      width: 28,
                      height: 28,
                      border: '1px solid var(--grid-lines)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      padding: 2,
                      flexShrink: 0,
                    }}
                  />
                </Box>

              </Box>

              <Divider />

              {/* Size */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'var(--text-med)',
                    fontWeight: 600,
                    display: 'block',
                    mb: 1,
                    textTransform: 'uppercase',
                    fontSize: '0.625rem',
                  }}
                >
                  Size
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <PropField
                    label="Width"
                    value={selectedItem.scale[0]}
                    onChange={(v) => handleScaleChange('x', v)}
                    step={0.05}
                    min={0.1}
                  />
                  <PropField
                    label="Height"
                    value={selectedItem.scale[1]}
                    onChange={(v) => handleScaleChange('y', v)}
                    step={0.05}
                    min={0.1}
                  />
                  <PropField
                    label="Depth"
                    value={selectedItem.scale[2]}
                    onChange={(v) => handleScaleChange('z', v)}
                    step={0.05}
                    min={0.1}
                  />
                </Box>
              </Box>

              <Divider />

              {/* Colour swatches */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                {COLOR_SWATCHES.map((c) => (
                  <Box
                    key={c}
                    onClick={() => updateSelected({ color: c })}
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: c,
                      cursor: 'pointer',
                      border:
                        selectedItem.color === c
                          ? '2px solid var(--brand-primary)'
                          : '2px solid transparent',
                      transition: 'transform 0.1s',
                      '&:hover': { transform: 'scale(1.2)' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Open design dialog */}
      <OpenDesignDialog
        open={openDialogOpen}
        onClose={() => setOpenDialogOpen(false)}
        onOpen={handleOpenDesign}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
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

export default Design;
