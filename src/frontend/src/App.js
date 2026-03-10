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
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#839705',
          color: '#121415',
          '&:hover': { backgroundColor: '#657504' },
          '&.Mui-disabled': { opacity: 0.5, color: '#121415' },
        },
        outlinedPrimary: {
          borderColor: '#839705',
          color: '#839705',
          '&:hover': {
            borderColor: '#657504',
            backgroundColor: 'rgba(131,151,5,0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root fieldset': { borderColor: 'var(--grid-lines)' },
          '& .MuiOutlinedInput-root:hover fieldset': { borderColor: 'var(--text-med)' },
          '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: 'var(--brand-primary)' },
          '& .MuiInputLabel-root': { color: 'var(--text-med)' },
          '& .MuiInputLabel-root.Mui-focused': { color: 'var(--brand-primary)' },
          '& .MuiOutlinedInput-input': { color: 'var(--text-high)' },
        },
      },
    },
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'var(--surface-1)',
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
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
    MuiDivider: {
      styleOverrides: { root: { borderColor: 'var(--grid-lines)' } },
    },
    MuiListItem: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
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
