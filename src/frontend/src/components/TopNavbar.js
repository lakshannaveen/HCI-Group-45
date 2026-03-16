import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import UserProfileModal from './UserProfileModal';

const TopNavbar = () => {
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await axiosInstance.post('/api/auth/logout'); } catch {}
    navigate('/');
  };

  useEffect(() => {
    axiosInstance.get('/api/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, []);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          backgroundColor: 'var(--surface-1)',
          borderBottom: '1px solid var(--grid-lines)',
          position: 'sticky',
          top: 0,
          zIndex: 200,
          flexShrink: 0,
        }}
      >
        {/* Left: Logo + Site name */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <img
            src="/logo.PNG"
            alt="Athlier Home"
            style={{ width: 28, height: 28, objectFit: 'contain' }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h6"
              sx={{ color: 'var(--brand-primary)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}
            >
              Athlier Home
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'var(--text-med)', letterSpacing: '0.05em', lineHeight: 1 }}
            >
              Design Studio
            </Typography>
          </Box>
        </Box>

        {/* Right: Admin Panel + User icon */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/admin-dashboard')}
            >
              Admin Panel
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => setProfileOpen(true)}
            sx={{
              minWidth: 40,
              width: 40,
              height: 36,
              p: 0,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Open profile"
          >
            <AccountCircleOutlinedIcon sx={{ fontSize: 20 }} />
          </Button>
        </Box>
      </Box>

      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} onLogout={handleLogout} />
    </>
  );
};

export default TopNavbar;
