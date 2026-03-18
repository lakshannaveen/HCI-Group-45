import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const TopNavbar = () => {
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin-dashboard';

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
          onClick={() => navigate(isAdminPage ? '/admin-dashboard' : '/dashboard')}
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
              {isAdminPage ? 'Admin Dashboard' : 'Athlier Home'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'var(--text-med)', letterSpacing: '0.05em', lineHeight: 1 }}
            >
              {isAdminPage ? 'System Management' : 'Design Studio'}
            </Typography>
          </Box>
        </Box>

        {/* Right: Admin Panel + User icon */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {user?.role === 'admin' && (
            isAdminPage ? (
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/dashboard')}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                Dashboard
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/admin-dashboard')}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                Admin Panel
              </Button>
            )
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/profile')}
            sx={{
              minWidth: 36,
              width: 36,
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

    </>
  );
};

export default TopNavbar;
