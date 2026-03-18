import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * AppSidebar — shared sidebar used across all authenticated pages.
 *
 * Props:
 *   navItems  — array of { label: string, path: string, icon?: ReactNode }
 *   onLogout  — optional logout handler; if provided, a Logout item is shown at the bottom
 */
const AppSidebar = ({ navItems = [], onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Box
      sx={{
        width: 250,
        minWidth: 250,
        backgroundColor: 'var(--surface-1)',
        borderRight: '1px solid var(--grid-lines)',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        minHeight: '100vh',
      }}
    >
      {/* Brand mark */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, px: 1 }}>
        <img
          src="/logo.PNG"
          alt="Athlier Home"
          style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
        />
        <Typography
          variant="h6"
          sx={{ color: 'var(--text-high)', fontWeight: 700, letterSpacing: '-0.01em' }}
        >
          Athlier Home
        </Typography>
      </Box>

      {/* Nav items */}
      <List disablePadding sx={{ flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '6px',
                mb: 0.5,
                pl: active ? 1.5 : 2,
                cursor: 'pointer',
                backgroundColor: active ? 'var(--surface-2)' : 'transparent',
                borderLeft: active
                  ? '3px solid var(--brand-primary)'
                  : '3px solid transparent',
                '&:hover': {
                  backgroundColor: 'var(--surface-2)',
                },
                transition: 'background-color 0.15s, border-color 0.15s',
              }}
            >
              {item.icon && (
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: active ? 'var(--brand-primary)' : 'var(--text-low)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--brand-primary)' : 'var(--text-med)',
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      {onLogout && (
        <>
          <Divider sx={{ my: 2 }} />
          <ListItem
            onClick={() => setConfirmOpen(true)}
            sx={{
              borderRadius: '6px',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'var(--surface-2)' },
            }}
          >
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 400,
                color: 'var(--text-high)',
              }}
            />
          </ListItem>

          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ color: 'var(--text-high)', fontWeight: 700 }}>Confirm Logout</DialogTitle>
            <DialogContent sx={{ color: 'var(--text-med)' }}>
              Are you sure you want to logout?
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 2 }}>
              <Button onClick={() => setConfirmOpen(false)} variant="outlined">Cancel</Button>
              <Button onClick={() => { setConfirmOpen(false); onLogout(); }} variant="contained" color="error">Logout</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default AppSidebar;
