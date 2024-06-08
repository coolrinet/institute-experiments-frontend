import { queryOptions } from '@tanstack/react-query';

import { apiClient } from '~/lib/api-client';

import { Experiment } from '~/types/api';

async function getExperiment(researchId: number, experimentId: number) {
  const response = await apiClient.get<Experiment>(
    `/api/research/${researchId}/experiments/${experimentId}`
  );

  return response.data;
}

export const getExperimentQueryOptions = (researchId: number, experimentId: number) =>
  queryOptions({
    queryKey: ['experiment', researchId, experimentId],
    queryFn: () => getExperiment(researchId, experimentId),
  });
