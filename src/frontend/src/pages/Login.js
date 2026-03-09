import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/auth/login', formData);
      setSuccess('Login successful! Redirecting...');

      // Fetch user info
      const res = await axios.get('/api/auth/me');
      const user = res.data;

      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Login failed';
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
      {/* Brand mark */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <img src="/logo.PNG" alt="Athlier Home" style={{ width: 40, height: 40, objectFit: 'contain' }} />
        <Typography variant="h5" sx={{ color: 'var(--text-high)', fontWeight: 700 }}>
          Athlier Home
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--grid-lines)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ color: 'var(--text-high)', mb: 0.5 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3, color: 'var(--text-med)' }}>
          Sign in to continue designing
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
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
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={() => navigate('/register')}
            disabled={loading}
          >
            Create an account
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
