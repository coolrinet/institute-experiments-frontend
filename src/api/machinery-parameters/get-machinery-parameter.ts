import { queryOptions } from '@tanstack/react-query';

import { apiClient } from '~/lib/api-client';

import { MachineryParameter } from '~/types/api';

async function getMachineryParameter(id: number) {
  const response = await apiClient.get<MachineryParameter>(`/api/machinery-parameters/${id}`);

  return response.data;
}

export const getMachineryParameterQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['machinery-parameter', id],
    queryFn: () => getMachineryParameter(id),
  });
