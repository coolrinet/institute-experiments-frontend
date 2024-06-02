import { useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '~/lib/api-client';

import { User } from '~/types/api';
import { ForgotPasswordData, LoginData, PasswordResetData } from '~/types/schema';

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: user,
    error: userError,
    isPending: isUserLoading,
  } = useQuery({
    queryKey: ['auth.user'],
    queryFn: () => apiClient.get<User>('/api/profile').then(res => res.data),
  });

  const csrf = () => apiClient.get('/sanctum/csrf-cookie');

  const login = async (data: LoginData) => {
    await csrf();
    await apiClient.post('/login', { remember: data.shouldRemember, ...data });
    await queryClient.invalidateQueries({ queryKey: ['auth.user'] });
  };

  const logout = async () => {
    await csrf();
    await apiClient.post('/logout');
    await queryClient.invalidateQueries({ queryKey: ['auth.user'] });
  };

  const forgotPassword = async (data: ForgotPasswordData) => {
    await csrf();
    await apiClient.post('/forgot-password', data);
  };

  const passwordReset = async (data: PasswordResetData) => {
    await csrf();
    await apiClient.post('/reset-password', {
      password_confirmation: data.passwordConfirmation,
      password: data.password,
      token: data.token,
      email: data.email,
    });
  };

  return {
    isAuthenticated: !!user,
    user,
    userError,
    isUserLoading,
    login,
    logout,
    forgotPassword,
    passwordReset,
  };
}

export type AuthContext = ReturnType<typeof useAuth>;
