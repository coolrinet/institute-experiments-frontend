import { useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '~/lib/api-client';

import { User } from '~/types/api';
import { ForgotPasswordData, LoginData, ResetPasswordData } from '~/types/schema';

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: user,
    error: userError,
    isFetching,
  } = useQuery({
    queryKey: ['auth.user'],
    queryFn: () => {
      try {
        return apiClient.get<User>('/api/profile').then(response => response.data);
      } catch (error) {
        return null;
      }
    },
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

  const passwordReset = async (data: ResetPasswordData) => {
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
    isUserLoading: isFetching,
    login,
    logout,
    forgotPassword,
    passwordReset,
  };
}

export type AuthContext = ReturnType<typeof useAuth>;
