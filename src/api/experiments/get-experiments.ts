import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { apiClient } from '~/lib/api-client';

import { Experiments } from '~/types/api';

type ExperimentParams = {
  page?: number;
};

async function getExperiments(researchId: number, params: ExperimentParams) {
  const response = await apiClient.get<Experiments>(`/api/research/${researchId}/experiments`, {
    params,
  });

  return response.data;
}

export const getExperimentsQueryOptions = (researchId: number, { page }: ExperimentParams) =>
  queryOptions({
    queryKey: ['experiments', page],
    queryFn: () => getExperiments(researchId, { page }),
    placeholderData: keepPreviousData,
  });
