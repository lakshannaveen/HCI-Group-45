import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Divider, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
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

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="text"
        startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 18 }} />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2, color: 'var(--text-med)', px: 0 }}
      >
        Back
      </Button>

      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>User Profile Settings</Typography>

      <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid var(--grid-lines)', backgroundColor: 'var(--surface-1)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '220px 1px 1fr' }}>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Box sx={{ width: 96, height: 96, border: '2px solid var(--grid-lines)', borderRadius: '50%', backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AccountCircleOutlinedIcon sx={{ fontSize: 56, color: 'var(--text-low)' }} />
            </Box>

            <Typography variant="subtitle2" sx={{ color: 'var(--text-high)', fontWeight: 700, textAlign: 'center' }}>{user?.displayName || user?.username || '—'}</Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-med)', mt: -1.5 }}>{user?.role === 'admin' ? 'Administrator' : 'Interior Designer'}</Typography>

            <Box sx={{ border: '1px solid var(--grid-lines)', borderRadius: 1, backgroundColor: 'var(--surface-2)', p: 2, width: '100%', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'var(--text-med)', display: 'block', mb: 0.5 }}>Total Designs Saved</Typography>
              <Typography variant="h4" sx={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{designCount}</Typography>
            </Box>

            <Button fullWidth variant="outlined" onClick={openLogoutConfirm} sx={{ borderColor: 'var(--color-error)', color: 'var(--color-error)', '&:hover': { backgroundColor: 'rgba(207,102,121,0.08)', borderColor: 'var(--color-error)' } }}>Logout</Button>

            <Dialog open={confirmLogoutOpen} onClose={() => setConfirmLogoutOpen(false)} maxWidth="xs" fullWidth>
              <DialogTitle sx={{ color: 'var(--text-high)', fontWeight: 700 }}>Confirm Logout</DialogTitle>
              <DialogContent sx={{ color: 'var(--text-med)' }}>Are you sure you want to logout?</DialogContent>
              <DialogActions sx={{ px: 2, pb: 2 }}>
                <Button onClick={() => setConfirmLogoutOpen(false)} variant="outlined">Cancel</Button>
                <Button onClick={confirmLogout} variant="contained" color="error">Logout</Button>
              </DialogActions>
            </Dialog>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'var(--grid-lines)' }} />

          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {error && <Alert severity="error" sx={{ mb: 0 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 0 }}>{success}</Alert>}

            <Box>
              <Typography variant="subtitle2" sx={{ color: 'var(--text-high)', fontWeight: 700, pb: 1, mb: 1.5, borderBottom: '1px solid var(--grid-lines)' }}>Profile Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField label="Username" value={user?.username || ''} size="small" fullWidth disabled helperText="Username cannot be changed" InputProps={{ readOnly: true }} />
                <TextField label="Display Name" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} size="small" fullWidth disabled={loading} placeholder={user?.username} />
                <TextField label="Email Address" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} size="small" fullWidth disabled={loading} />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ color: 'var(--text-high)', fontWeight: 700, pb: 1, mb: 1.5, borderBottom: '1px solid var(--grid-lines)' }}>Change Password</Typography>
              <Box sx={{ border: '1px solid var(--grid-lines)', borderRadius: 1, backgroundColor: 'var(--surface-2)', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField label="Current Password" type="password" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} size="small" fullWidth disabled={loading} />
                <TextField label="New Password" type="password" value={pwForm.newPw} onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))} size="small" fullWidth disabled={loading} />
                <TextField label="Confirm New Password" type="password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} size="small" fullWidth disabled={loading} />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', borderTop: '1px solid var(--grid-lines)', pt: 2 }}>
              <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>Cancel</Button>
              <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
