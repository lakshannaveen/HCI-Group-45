import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Design from './pages/Design';
import AdminDashboard from './pages/AdminDashboard';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#839705',
      contrastText: '#121415',
    },
    secondary: {
      main: '#9DB306',
    },
    background: {
      default: '#121415',
      paper: '#1E2022',
    },
    text: {
      primary: '#F5F5F6',
      secondary: '#A0AAB2',
    },
    error: { main: '#CF6679' },
    warning: { main: '#FFB74D' },
    success: { main: '#81C784' },
    info: { main: '#64B5F6' },
  },
  typography: {
    fontFamily: "'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    // ── Buttons ─────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#839705',
          color: '#121415',                               // WCAG AAA on olive
          '&:hover':  { backgroundColor: '#9DB306' },    // lighter = hover
          '&:active': { backgroundColor: '#657504' },    // darker  = pressed
          '&.Mui-disabled': { opacity: 0.5, color: '#121415' },
        },
        outlinedPrimary: {
          borderColor: '#839705',
          color: '#839705',
          '&:hover': {
            borderColor: '#9DB306',
            backgroundColor: 'rgba(131,151,5,0.06)',
          },
          '&:active': { borderColor: '#657504' },
        },
      },
    },

    // ── All outlined inputs (TextField + Select + FormControl) ───────────────
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--surface-2)',
          '& fieldset': { borderColor: 'var(--grid-lines)' },
          '&:hover:not(.Mui-disabled) fieldset': { borderColor: 'var(--text-med)' },
          '&.Mui-focused fieldset': { borderColor: 'var(--color-focus)' }, // #64B5F6
        },
        input: { color: 'var(--text-high)' },
      },
    },

    // ── Input labels ─────────────────────────────────────────────────────────
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'var(--text-med)',
          '&.Mui-focused': { color: 'var(--color-focus)' },
        },
      },
    },

    // ── Helper / hint text ───────────────────────────────────────────────────
    MuiFormHelperText: {
      styleOverrides: {
        root: { color: 'var(--text-low)' },
      },
    },

    // ── TextField (keeps label + fieldset overrides; background now from MuiOutlinedInput) ──
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': { color: 'var(--text-med)' },
          '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-focus)' },
          '& .MuiOutlinedInput-input': { color: 'var(--text-high)' },
        },
      },
    },

    // ── Switch ───────────────────────────────────────────────────────────────
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: 'var(--brand-primary)',
            '& + .MuiSwitch-track': {
              backgroundColor: 'var(--brand-primary)',
              opacity: 0.5,
            },
          },
        },
        track: { backgroundColor: 'var(--grid-lines)' },
      },
    },

    // ── Select dropdown menu ─────────────────────────────────────────────────
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: 'var(--surface-2)',
          backgroundImage: 'none',
          border: '1px solid var(--grid-lines)',
        },
        list: { padding: '4px 0' },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: 'var(--text-high)',
          fontSize: '0.875rem',
          '&:hover': { backgroundColor: 'var(--surface-1)' },
          '&.Mui-selected': {
            backgroundColor: 'var(--brand-primary-muted)',
            color: 'var(--brand-primary)',
            '&:hover': { backgroundColor: 'var(--brand-primary-muted)' },
          },
        },
      },
    },

    // ── Progress spinner ─────────────────────────────────────────────────────
    MuiCircularProgress: {
      styleOverrides: {
        root: { color: 'var(--brand-primary)' },
      },
    },

    // ── Cards / Paper ────────────────────────────────────────────────────────
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },

    // ── Dialogs ──────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'var(--surface-1)',
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },

    // ── Tables ───────────────────────────────────────────────────────────────
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid var(--grid-lines)',
          color: 'var(--text-high)',
        },
        head: {
          color: 'var(--text-med)',
          fontWeight: 600,
          backgroundColor: 'var(--surface-2)',
        },
      },
    },

    // ── Misc ─────────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: { root: { borderColor: 'var(--grid-lines)' } },
    },
    MuiListItem: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
        standardError:   { backgroundColor: 'rgba(207,102,121,0.12)', color: 'var(--color-error)' },
        standardSuccess: { backgroundColor: 'rgba(129,199,132,0.12)', color: 'var(--color-success)' },
        standardWarning: { backgroundColor: 'rgba(255,183,77,0.12)',  color: 'var(--color-warning)' },
        standardInfo:    { backgroundColor: 'rgba(100,181,246,0.12)', color: 'var(--color-focus)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'var(--surface-2)',
          color: 'var(--text-high)',
          fontSize: '0.75rem',
          borderRadius: 6,
          border: '1px solid var(--grid-lines)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/design" element={<Design />} />
          <Route path="/design/:id" element={<Design />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
