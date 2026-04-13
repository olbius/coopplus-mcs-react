import { Container, Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { type FC } from 'react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: FC = () => {
  const { login, isLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => login(data);

  return (
    <Box sx={{
      minHeight: '100vh', width: '100vw',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'background.default', position: 'fixed', top: 0, left: 0,
    }}>
      <Container maxWidth="sm">
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 600 }}>
              CoopPlus MCS
            </Typography>
            <Typography variant="body1" gutterBottom align="center" color="text.secondary">
              Sign in to continue
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
              <TextField
                {...register('username')}
                label="Username"
                fullWidth
                margin="normal"
                error={!!errors.username}
                helperText={errors.username?.message}
                autoFocus
                autoComplete="username"
              />
              <TextField
                {...register('password')}
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
