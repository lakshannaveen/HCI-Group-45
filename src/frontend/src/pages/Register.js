import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/register', {
        username: formData.username,
        password: formData.password,
      });
      setSuccess('Account created successfully! Please log in.');
      setError('');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
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
          Create account
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3, color: 'var(--text-med)' }}>
          Register to start designing
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
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
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
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Back to sign in
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
