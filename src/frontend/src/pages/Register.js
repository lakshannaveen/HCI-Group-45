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
        password: formData.password
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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--canvas-base)' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, backgroundColor: 'var(--surface-1)' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'var(--text-high)' }}>
          Create Account
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 3, color: 'var(--brand-primary)' }}>
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
            disabled={loading}
            sx={{ mb: 2, backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-primary)', '&:hover': { backgroundColor: 'var(--brand-primary-pressed)' } }}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/')}
            disabled={loading}
            sx={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', '&:hover': { borderColor: 'var(--brand-primary-pressed)', backgroundColor: 'var(--surface-1)' } }}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;