import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, TextField, Divider, Dialog, DialogContent, Alert,
} from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import axiosInstance from '../utils/axios';

export default function UserProfileModal({ open, onClose, onLogout }) {
  const [user, setUser] = useState(null);
  const [designCount, setDesignCount] = useState(0);
  const [form, setForm] = useState({ displayName: '', email: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setSuccess('');
    const load = async () => {
      try {
        const [userRes, designRes] = await Promise.all([
          axiosInstance.get('/api/auth/me'),
          axiosInstance.get('/api/designs'),
        ]);
        setUser(userRes.data);
        setDesignCount(designRes.data.length);
        setForm({
          displayName: userRes.data.displayName || '',
          email: userRes.data.email || '',
        });
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    load();
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { displayName: form.displayName };
      // Only include email if user typed something or they already have one
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

  const handleClose = () => {
    setError('');
    setSuccess('');
    setPwForm({ current: '', newPw: '', confirm: '' });
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      {/* Header */}
      <Box
        sx={{
          borderBottom: '1px solid var(--grid-lines)',
          px: 3,
          py: 2,
          backgroundColor: 'var(--surface-1)',
        }}
      >
        <Typography variant="h6" sx={{ color: 'var(--text-high)', fontWeight: 700 }}>
          User Profile Settings
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-med)', mt: 0.5 }}>
          Manage your account information
        </Typography>
      </Box>

      <DialogContent sx={{ p: 0, backgroundColor: 'var(--surface-1)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '220px 1px 1fr' }}>
          {/* ── Left column ── */}
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
            }}
          >
            {/* Avatar */}
            <Box
              sx={{
                width: 96,
                height: 96,
                border: '2px solid var(--grid-lines)',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AccountCircleOutlinedIcon sx={{ fontSize: 56, color: 'var(--text-low)' }} />
            </Box>

            <Typography
              variant="subtitle2"
              sx={{ color: 'var(--text-high)', fontWeight: 700, textAlign: 'center' }}
            >
              {user?.displayName || user?.username || '—'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-med)', mt: -1.5 }}>
              {user?.role === 'admin' ? 'Administrator' : 'Interior Designer'}
            </Typography>

            {/* Stats box */}
            <Box
              sx={{
                border: '1px solid var(--grid-lines)',
                borderRadius: 1,
                backgroundColor: 'var(--surface-2)',
                p: 2,
                width: '100%',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'var(--text-med)', display: 'block', mb: 0.5 }}
              >
                Total Designs Saved
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: 'var(--brand-primary)', fontWeight: 700 }}
              >
                {designCount}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={onLogout}
              sx={{
                borderColor: 'var(--color-error)',
                color: 'var(--color-error)',
                '&:hover': { backgroundColor: 'rgba(207,102,121,0.08)', borderColor: 'var(--color-error)' },
              }}
            >
              Logout
            </Button>
          </Box>

          {/* Vertical divider */}
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--grid-lines)' }} />

          {/* ── Right column ── */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {error && <Alert severity="error" sx={{ mb: 0 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 0 }}>{success}</Alert>}

            {/* Profile Details */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--text-high)',
                  fontWeight: 700,
                  pb: 1,
                  mb: 1.5,
                  borderBottom: '1px solid var(--grid-lines)',
                }}
              >
                Profile Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  label="Username"
                  value={user?.username || ''}
                  size="small"
                  fullWidth
                  disabled
                  helperText="Username cannot be changed"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Display Name"
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled={loading}
                  placeholder={user?.username}
                />
                <TextField
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled={loading}
                />
              </Box>
            </Box>

            {/* Change Password */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--text-high)',
                  fontWeight: 700,
                  pb: 1,
                  mb: 1.5,
                  borderBottom: '1px solid var(--grid-lines)',
                }}
              >
                Change Password
              </Typography>
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
                  label="Current Password"
                  type="password"
                  value={pwForm.current}
                  onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled={loading}
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={pwForm.newPw}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled={loading}
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled={loading}
                />
              </Box>
            </Box>

            {/* Footer actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 'auto' }}>
              <Button variant="outlined" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving…' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
