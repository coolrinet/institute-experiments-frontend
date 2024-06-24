import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { apiClient } from '~/lib/api-client';

import { Machineries } from '~/types/api';

export type GetMachineriesParams = {
  page?: number;
  name?: string;
};

async function fetchMachineries(params: GetMachineriesParams) {
  const response = await apiClient.get<Machineries>('/api/machineries', {
    params,
  });
  return response.data;
}

export const getMachineriesQueryOptions = ({ page, name }: GetMachineriesParams) =>
  queryOptions({
    queryKey: ['machineries', page, name],
    queryFn: () => fetchMachineries({ page, name }),
    placeholderData: keepPreviousData,
  });
