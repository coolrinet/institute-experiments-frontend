import { useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '~/lib/api-client';

import { User } from '~/types/api';
import { LoginData } from '~/types/schema';

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

  return { isAuthenticated: !!user, user, userError, isUserLoading, login, logout };
}

export type AuthContext = ReturnType<typeof useAuth>;
