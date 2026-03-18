import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  Divider, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Paper,
  Avatar,
  Chip,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [designCount, setDesignCount] = useState(0);
  const [form, setForm] = useState({ displayName: '', email: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [userRes, designRes] = await Promise.all([
          axiosInstance.get('/api/auth/me'),
          axiosInstance.get('/api/designs'),
        ]);
        if (!mounted) return;
        setUser(userRes.data);
        setDesignCount(designRes.data.length);
        setForm({ displayName: userRes.data.displayName || '', email: userRes.data.email || '' });
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { displayName: form.displayName };
      if (form.email !== '') payload.email = form.email;
      if (pwForm.newPw) {
        if (pwForm.newPw !== pwForm.confirm) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        if (!pwForm.current) {
          setError('Current password is required to change password');
          setLoading(false);
          return;
        }
        payload.currentPassword = pwForm.current;
        payload.newPassword = pwForm.newPw;
      }
      const res = await axiosInstance.put('/api/auth/profile', payload);
      setUser(res.data);
      setForm({ displayName: res.data.displayName || '', email: res.data.email || '' });
      setPwForm({ current: '', newPw: '', confirm: '' });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Update failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await axiosInstance.post('/api/auth/logout'); } catch {}
    navigate('/');
  };

  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const openLogoutConfirm = () => setConfirmLogoutOpen(true);
  const confirmLogout = async () => {
    setConfirmLogoutOpen(false);
    try { await axiosInstance.post('/api/auth/logout'); } catch {}
    navigate('/');
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with back button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 4,
        maxWidth: 1200,
        width: '100%',
        mx: 'auto'
      }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 18 }} />}
          onClick={() => navigate('/dashboard')}
          sx={{ 
            color: 'var(--text-med)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.05)'
            }
          }}
        >
          Back to Dashboard
        </Button>
        
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            color: 'var(--text-high)',
            letterSpacing: '-0.02em'
          }}
        >
          Profile Settings
        </Typography>
        
        <Box sx={{ width: 120 }} /> {/* Spacer for alignment */}
      </Box>

      {/* Main content */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--grid-lines)',
          borderRadius: 3,
          overflow: 'hidden',
          maxWidth: 1200,
          width: '100%',
          mx: 'auto'
        }}
      >
        {/* Mobile layout: stack vertically, desktop: grid */}
        <Box sx={{
          display: { xs: 'block', md: 'grid' },
          gridTemplateColumns: '300px 1px 1fr'
        }}>
          {/* Left sidebar - Profile summary */}
          <Box sx={{ 
            p: 3,
            backgroundColor: 'var(--surface-2)',
            borderRight: { md: '1px solid var(--grid-lines)' },
            borderBottom: { xs: '1px solid var(--grid-lines)', md: 'none' }
          }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              {/* Avatar with status indicator */}
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    backgroundColor: 'var(--surface-3)',
                    border: '3px solid var(--brand-primary)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                  }}
                >
                  <AccountCircleOutlinedIcon sx={{ fontSize: 70, color: 'var(--text-med)' }} />
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: '#4caf50',
                    border: '2px solid var(--surface-2)'
                  }}
                />
              </Box>

              {/* User info */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'var(--text-high)',
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  {user?.displayName || user?.username || '—'}
                </Typography>
                
                <Chip
                  label={user?.role === 'admin' ? 'Administrator' : 'Interior Designer'}
                  size="small"
                  sx={{
                    backgroundColor: user?.role === 'admin' 
                      ? 'rgba(103, 126, 207, 0.15)' 
                      : 'rgba(128, 187, 150, 0.15)',
                    color: user?.role === 'admin' 
                      ? 'var(--brand-primary)' 
                      : '#80bb96',
                    border: '1px solid',
                    borderColor: user?.role === 'admin' 
                      ? 'var(--brand-primary)' 
                      : '#80bb96',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>

              {/* Stats card */}
              <Paper
                elevation={0}
                sx={{
                  width: '100%',
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--grid-lines)',
                  borderRadius: 2,
                  p: 2.5,
                  mt: 2,
                  textAlign: 'center'
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'var(--text-med)',
                    display: 'block',
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem'
                  }}
                >
                  Total Designs Saved
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: 'var(--brand-primary)',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    mb: 0.5
                  }}
                >
                  {designCount}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'var(--text-low)',
                    fontSize: '0.7rem'
                  }}
                >
                  Lifetime creations
                </Typography>
              </Paper>

              {/* Logout button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LogoutOutlinedIcon />}
                onClick={openLogoutConfirm}
                sx={{
                  mt: 3,
                  borderColor: 'var(--color-error)',
                  color: 'var(--color-error)',
                  '&:hover': {
                    backgroundColor: 'rgba(207,102,121,0.08)',
                    borderColor: 'var(--color-error)'
                  },
                  py: 1.2
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>

          {/* Vertical divider - only visible on desktop */}
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              borderColor: 'var(--grid-lines)',
              display: { xs: 'none', md: 'block' }
            }} 
          />

          {/* Right content - Forms */}
          <Box sx={{ p: 4 }}>
            {/* Alerts */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { color: 'var(--color-error)' }
                }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(128, 187, 150, 0.1)',
                  color: '#80bb96'
                }}
              >
                {success}
              </Alert>
            )}

            {/* Profile Details Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 2.5
              }}>
                <PersonOutlineOutlinedIcon sx={{ color: 'var(--brand-primary)' }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: 'var(--text-high)',
                    fontWeight: 600
                  }}
                >
                  Profile Details
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Username"
                  value={user?.username || ''}
                  size="medium"
                  fullWidth
                  disabled
                  helperText="Username cannot be changed"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon sx={{ color: 'var(--text-low)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--surface-2)',
                      '& fieldset': {
                        borderColor: 'var(--grid-lines)'
                      }
                    }
                  }}
                />

                <TextField
                  label="Display Name"
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  size="medium"
                  fullWidth
                  disabled={loading}
                  placeholder={user?.username}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineOutlinedIcon sx={{ color: 'var(--text-low)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--surface-2)',
                      '& fieldset': {
                        borderColor: 'var(--grid-lines)'
                      }
                    }
                  }}
                />

                <TextField
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  size="medium"
                  fullWidth
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: 'var(--text-low)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--surface-2)',
                      '& fieldset': {
                        borderColor: 'var(--grid-lines)'
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Change Password Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 2.5
              }}>
                <LockOutlinedIcon sx={{ color: 'var(--brand-primary)' }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: 'var(--text-high)',
                    fontWeight: 600
                  }}
                >
                  Change Password
                </Typography>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--grid-lines)',
                  borderRadius: 2,
                  p: 3
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="Current Password"
                    type={showPassword.current ? 'text' : 'password'}
                    value={pwForm.current}
                    onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                    size="medium"
                    fullWidth
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('current')}
                            edge="end"
                            size="small"
                            sx={{ color: 'var(--text-low)' }}
                          >
                            {showPassword.current ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'var(--surface-1)',
                        '& fieldset': {
                          borderColor: 'var(--grid-lines)'
                        }
                      }
                    }}
                  />

                  <TextField
                    label="New Password"
                    type={showPassword.new ? 'text' : 'password'}
                    value={pwForm.newPw}
                    onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))}
                    size="medium"
                    fullWidth
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('new')}
                            edge="end"
                            size="small"
                            sx={{ color: 'var(--text-low)' }}
                          >
                            {showPassword.new ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'var(--surface-1)',
                        '& fieldset': {
                          borderColor: 'var(--grid-lines)'
                        }
                      }
                    }}
                  />

                  <TextField
                    label="Confirm New Password"
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                    size="medium"
                    fullWidth
                    disabled={loading}
                    error={pwForm.newPw && pwForm.confirm && pwForm.newPw !== pwForm.confirm}
                    helperText={
                      pwForm.newPw && pwForm.confirm && pwForm.newPw !== pwForm.confirm
                        ? 'Passwords do not match'
                        : ''
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('confirm')}
                            edge="end"
                            size="small"
                            sx={{ color: 'var(--text-low)' }}
                          >
                            {showPassword.confirm ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'var(--surface-1)',
                        '& fieldset': {
                          borderColor: 'var(--grid-lines)'
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'flex-end',
              borderTop: '1px solid var(--grid-lines)',
              pt: 3
            }}>
              <Button
                variant="outlined"
                startIcon={<CloseOutlinedIcon />}
                onClick={() => navigate(-1)}
                disabled={loading}
                sx={{
                  borderColor: 'var(--grid-lines)',
                  color: 'var(--text-med)',
                  '&:hover': {
                    borderColor: 'var(--text-med)',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  },
                  px: 3,
                  py: 1
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  backgroundColor: 'var(--brand-primary)',
                  '&:hover': {
                    backgroundColor: 'var(--brand-hover)'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(103, 126, 207, 0.3)'
                  },
                  px: 4,
                  py: 1
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Logout Confirmation Dialog */}
      <Dialog 
        open={confirmLogoutOpen} 
        onClose={() => setConfirmLogoutOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--grid-lines)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'var(--text-high)', 
          fontWeight: 600,
          pb: 1
        }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ color: 'var(--text-med)' }}>
          Are you sure you want to logout? Any unsaved changes will be lost.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setConfirmLogoutOpen(false)} 
            variant="outlined"
            sx={{
              borderColor: 'var(--grid-lines)',
              color: 'var(--text-med)'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmLogout} 
            variant="contained" 
            color="error"
            sx={{
              backgroundColor: 'var(--color-error)',
              '&:hover': {
                backgroundColor: '#b84c5e'
              }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}