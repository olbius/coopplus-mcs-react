import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { useToast } from '../../../contexts/ToastContext';
import type { LoginRequest } from '../../../types/auth.types';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { setAuth, logout: logoutStore, isAuthenticated } = useAuthStore();
  const { setSelectedModule, loadModuleFromServer } = useUIStore();
  const navigate = useNavigate();
  const { showError } = useToast();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: async (data) => {
      setAuth(data.token, data.refreshToken, data.user, data.permissions);
      await loadModuleFromServer();
      navigate('/');
    },
    onError: (error: Error) => {
      showError(error.message || 'Login failed. Please check your credentials.');
    },
  });

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      logoutStore();
      setSelectedModule(null);
      navigate('/login');
    }
  };

  return {
    login: loginMutation.mutate,
    logout: handleLogout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    isAuthenticated,
  };
};
