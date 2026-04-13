import { useState, type FC } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Typography, Divider, Box } from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const UserMenu: FC = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <AccountCircle />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">{user.firstName} {user.lastName}</Typography>
            <Typography variant="caption" color="text.secondary">{user.username}</Typography>
          </Box>
        )}
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
