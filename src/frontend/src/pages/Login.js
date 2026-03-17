import React, { useState } from 'react';
import {
  TextField, Button, Paper, Typography, Box,
  Alert, Snackbar,
  Dialog, DialogContent, DialogTitle, DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

// ── Screen 2: Registration Modal ────────────────────────────────────────────
function RegisterModal({ open, onClose, onSuccess, onError }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setForm({ fullName: '', email: '', password: '', confirmPassword: '' });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      onError('Passwords do not match');
      return;
    }

    // Build a valid username (alphanumeric, 3-20 chars) from Full Name
    const rawUsername =
      (form.fullName || '')
        .replace(/[^a-zA-Z0-9]/g, '') // strip non-alphanumeric
        .slice(0, 20);

    if (rawUsername.length < 3) {
      onError('Full Name must produce at least 3 letters/numbers for the username.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/register', {
        username: rawUsername,
        password: form.password,
        email: form.email || undefined,
      });
      handleClose();
      onSuccess('Account created! You can now log in.');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed';
      onError(msg);
    } finally {
      setLoading(false);
    }
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
        Create Designer Account
        <Typography variant="body2" sx={{ color: 'var(--text-med)', fontWeight: 400, mt: 0.5 }}>
          Join the Athlier Home design team
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: 'var(--surface-1)' }}>
        <Box
          id="register-form"
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}
        >
          <TextField
            label="Full Name"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            fullWidth
            size="small"
            required
            disabled={loading}
            placeholder="e.g. JaneSmith"
            helperText="Letters and numbers only — used as your username"
          />
          <TextField
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            fullWidth
            size="small"
            disabled={loading}
            placeholder="Optional"
          />

          {/* Password group with background */}
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
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              fullWidth
              size="small"
              required
              disabled={loading}
              helperText="Min 6 chars, must include uppercase, lowercase & a number"
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              fullWidth
              size="small"
              required
              disabled={loading}
            />
          </Box>

        </Box>
      </DialogContent>

      <DialogActions
        sx={{ borderTop: '1px solid var(--grid-lines)', px: 3, py: 2, gap: 1, backgroundColor: 'var(--surface-1)' }}
      >
        <Button
          variant="text"
          onClick={handleClose}
          disabled={loading}
          sx={{ color: 'var(--text-med)', mr: 'auto' }}
        >
          Back to Login
        </Button>
        <Button
          type="submit"
          form="register-form"
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Creating…' : 'Create Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Screen 1: Login ──────────────────────────────────────────────────────────
const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, text: '', severity: 'success' });
  const navigate = useNavigate();

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

            {/* Registration link (text link, not a button) */}
            <Typography align="center" variant="body2">
              <span style={{ color: 'var(--text-med)' }}>Don't have an account?</span>{' '}
              <span
                onClick={() => setRegisterOpen(true)}
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

      {/* Registration Modal */}
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={(text) => showSnackbar(text, 'success')}
        onError={(text) => showSnackbar(text, 'error')}
      />

      {/* Success snackbar (same pattern as other pages) */}
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
