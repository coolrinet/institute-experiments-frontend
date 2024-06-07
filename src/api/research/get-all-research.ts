import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { apiClient } from '~/lib/api-client';

import { ResearchList } from '~/types/api';

type GetAllResearchParams = {
  page?: number;
  name?: string;
  machineryId?: number;
};

async function fetchResearch(params: GetAllResearchParams) {
  const response = await apiClient.get<ResearchList>('/api/research', {
    params: {
      page: params.page,
      name: params.name,
      machinery_id: params.machineryId,
    },
  });

  return response.data;
}

export const getAllResearchQueryOptions = ({ page, name, machineryId }: GetAllResearchParams) =>
  queryOptions({
    queryKey: ['research-list', page, name, machineryId],
    queryFn: () => fetchResearch({ page, name, machineryId }),
    placeholderData: keepPreviousData,
  });
