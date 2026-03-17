import React, { useState } from 'react';
import {
  TextField, Button, Paper, Typography, Box,
  Alert, Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const Register = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, text: '' });
  const navigate = useNavigate();

  const showError = (text) => setSnackbar({ open: true, text });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    // Build a valid username (alphanumeric, 3–20 chars) from Full Name
    const rawUsername = (form.fullName || '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 20);

    if (rawUsername.length < 3) {
      showError('Full Name must produce at least 3 letters/numbers for the username.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/register', {
        username: rawUsername,
        password: form.password,
        email: form.email || undefined,
      });
      // Navigate back to login and pass a success message via state
      navigate('/', { state: { registered: 'Account created! You can now log in.' } });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed';
      showError(msg);
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
          maxWidth: 420,
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--grid-lines)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <Box sx={{ p: 4 }}>
          {/* Logo */}
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
            align="center"
            sx={{ color: 'var(--text-high)', mb: 0.5 }}
          >
            Create Designer Account
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 3, color: 'var(--text-med)' }}
          >
            Join the Athlier Home design team
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Full Name */}
            <Box>
              <Typography variant="caption" sx={{ color: 'var(--text-med)', mb: 0.5, display: 'block' }}>
                Full Name
              </Typography>
              <TextField
                fullWidth
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="e.g. Jane Smith"
                helperText="Letters and numbers only — used as your username"
              />
            </Box>

            {/* Email */}
            <Box>
              <Typography variant="caption" sx={{ color: 'var(--text-med)', mb: 0.5, display: 'block' }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="Optional"
              />
            </Box>

            {/* Password group */}
            <Box
              sx={{
                border: '1px solid var(--grid-lines)',
                borderRadius: 1,
                backgroundColor: 'var(--surface-2)',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--text-med)', mb: 0.5, display: 'block' }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  helperText="Min 6 chars, must include uppercase, lowercase & a number"
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--text-med)', mb: 0.5, display: 'block' }}>
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 0.5 }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>

            <Typography align="center" variant="body2">
              <span style={{ color: 'var(--text-med)' }}>Already have an account?</span>{' '}
              <span
                onClick={() => navigate('/')}
                style={{
                  color: 'var(--brand-primary)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 500,
                }}
              >
                Log in
              </span>
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Error snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity="error"
          sx={{ width: '100%' }}
        >
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;
