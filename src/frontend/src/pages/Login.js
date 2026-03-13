import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Paper, Typography, Box, Alert,
  Dialog, DialogContent, DialogTitle,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

// ── Screen 2: Registration Modal ────────────────────────────────────────────
function RegisterModal({ open, onClose }) {
  const [form, setForm] = useState({
    fullName: '',
    staffId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setForm({ fullName: '', staffId: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Build a valid username (alphanumeric, 3-20 chars) from Full Name or Staff ID
    const rawUsername =
      (form.fullName || form.staffId || '')
        .replace(/[^a-zA-Z0-9]/g, '') // strip non-alphanumeric
        .slice(0, 20);

    if (rawUsername.length < 3) {
      setError('Full Name must produce at least 3 letters/numbers for the username.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/register', {
        username: rawUsername,
        password: form.password,
        email: form.email || undefined,
      });
      setSuccess('Account created successfully!');
      setTimeout(() => handleClose(), 1800);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed';
      setError(msg);
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
        Create Account
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: 'var(--surface-1)' }}>
        {error && <Alert severity="error" sx={{ mt: 2, mb: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2, mb: 1 }}>{success}</Alert>}

        <Box
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
            label="Staff ID"
            value={form.staffId}
            onChange={(e) => setForm((f) => ({ ...f, staffId: e.target.value }))}
            fullWidth
            size="small"
            disabled={loading}
            placeholder="Optional"
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

          {/* Footer: two equal-width buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating…' : 'Create Account'}
            </Button>
          </Box>

          <Button
            variant="text"
            onClick={handleClose}
            size="small"
            disabled={loading}
            sx={{ alignSelf: 'center', color: 'var(--text-med)' }}
          >
            Back to Login
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ── Screen 1: Login ──────────────────────────────────────────────────────────
const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const navigate = useNavigate();

  // Auto-dismiss error after 3 seconds (per wireframe spec)
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(t);
  }, [error]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/auth/login', formData);
      setSuccess('Login successful! Redirecting…');
      const res = await axios.get('/api/auth/me');
      const user = res.data;
      setTimeout(() => {
        if (user.role === 'admin') navigate('/admin-dashboard');
        else navigate('/dashboard');
      }, 1000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Login failed';
      setError(errorMessage);
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
      {/* Logo / brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <img
          src="/logo.PNG"
          alt="Athlier Home"
          style={{ width: 40, height: 40, objectFit: 'contain' }}
        />
        <Typography variant="h5" sx={{ color: 'var(--text-high)', fontWeight: 700 }}>
          Athlier Home
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--grid-lines)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Error banner — full-width at top of card, auto-dismisses */}
        {error && (
          <Alert
            severity="error"
            icon={false}
            sx={{ borderRadius: 0, py: 1.5, fontSize: '0.875rem' }}
          >
            {error}
          </Alert>
        )}

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
            Welcome back
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 3, color: 'var(--text-med)' }}
          >
            Sign in to continue designing
          </Typography>

          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
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
      />
    </Box>
  );
};

export default Login;
