import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Design from './pages/Design';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6b4f35',
    },
    secondary: {
      main: '#8b6f47',
    },
    background: {
      default: '#f7f1e3',
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
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
