import { type FC } from 'react';
import { Typography, Box } from '@mui/material';
import { useAuthStore } from '../../../store/authStore';

export const DashboardPage: FC = () => {
  const { user } = useAuthStore();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Welcome back, {user?.firstName || 'User'}
      </Typography>
    </Box>
  );
};
