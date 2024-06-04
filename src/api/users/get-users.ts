import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { apiClient } from '~/lib/api-client';

import { Users } from '~/types/api';

type GetUsersParams = {
  page?: number;
};

async function fetchUsers(params: GetUsersParams) {
  const response = await apiClient.get<Users>('/api/users', {
    params,
  });
  return response.data;
}

export const getUsersQueryOptions = ({ page }: GetUsersParams) =>
  queryOptions({
    queryKey: ['users', page],
    queryFn: () => fetchUsers({ page }),
    placeholderData: keepPreviousData,
  });
