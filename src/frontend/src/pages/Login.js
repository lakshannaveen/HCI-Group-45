import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5007/api/auth/login', formData, { withCredentials: true });
      // Token is now in httpOnly cookie, no need to store in localStorage
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Login failed';
      setError(errorMessage);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f7f1e3' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, backgroundColor: '#f9f6f0' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: '#6b4f35' }}>
          Furniture Designer
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 3, color: '#8b6f47' }}>
          Sign in to continue
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
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
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mb: 2, backgroundColor: '#6b4f35', '&:hover': { backgroundColor: '#5a4230' } }}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/register')}
            sx={{ borderColor: '#6b4f35', color: '#6b4f35', '&:hover': { borderColor: '#5a4230', backgroundColor: '#f9f6f0' } }}
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;