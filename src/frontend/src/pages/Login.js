import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Paper, Typography, Box,
  Alert, Snackbar,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axios';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, text: '', severity: 'success' });
  const navigate = useNavigate();
  const location = useLocation();

  // Show success toast if redirected here after registration
  useEffect(() => {
    if (location.state?.registered) {
      setSnackbar({ open: true, text: location.state.registered, severity: 'success' });
      // Clear the state so refreshing doesn't re-show it
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const showSnackbar = (text, severity = 'error') =>
    setSnackbar({ open: true, text, severity });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/login', formData);
      const res = await axios.get('/api/auth/me');
      const user = res.data;
      if (user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Login failed';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--canvas-base)',
        gap: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--grid-lines)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <Box sx={{ p: 4 }}>
          {/* Logo placeholder (centered) */}
          <Box
            sx={{
              width: 56,
              height: 56,
              border: '1px solid var(--grid-lines)',
              borderRadius: 1,
              backgroundColor: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <img
              src="/logo.PNG"
              alt="logo"
              style={{ width: 40, height: 40, objectFit: 'contain' }}
            />
          </Box>

          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            align="center"
            sx={{ color: 'var(--text-high)', mb: 0.5 }}
          >
            Designer Login Portal
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 3, color: 'var(--text-med)' }}
          >
            Sign in to Athlier Home
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Username field */}
            <Typography
              variant="caption"
              sx={{ color: 'var(--text-med)', mb: 0.5, display: 'block' }}
            >
              Username
            </Typography>
            <TextField
              fullWidth
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="none"
              required
              disabled={loading}
              placeholder="Enter your username"
              sx={{ mb: 2 }}
            />

            {/* Password field */}
            <Typography
              variant="caption"
              sx={{ color: 'var(--text-med)', mb: 0.5, display: 'block' }}
            >
              Password
            </Typography>
            <TextField
              fullWidth
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="none"
              required
              disabled={loading}
              placeholder="Enter your password"
              sx={{ mb: 2 }}
            />

            {/* Forget Password link */}
            <Typography align="center" variant="body2" sx={{ mb: 2 }}>
              <a
                href="mailto:athlieircontact@gmail.com"
                style={{
                  color: 'var(--brand-primary)',
                  textDecoration: 'underline',
                  fontWeight: 500,
                }}
              >
                Forget Password
              </a>
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Signing in…' : 'Log In'}
            </Button>

            {/* Registration link */}
            <Typography align="center" variant="body2">
              <span style={{ color: 'var(--text-med)' }}>Don't have an account?</span>{' '}
              <span
                onClick={() => navigate('/register')}
                style={{
                  color: 'var(--brand-primary)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 500,
                }}
              >
                Register
              </span>
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for login errors + post-registration success */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
