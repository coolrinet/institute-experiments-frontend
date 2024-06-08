import { apiClient } from '~/lib/api-client';

import { Research } from '~/types/api';

async function getResearch(researchId: number) {
  const response = await apiClient.get<Research>(`api/research/${researchId}`);

  return response.data;
}

export const getResearchQueryOptions = (researchId: number) => ({
  queryKey: ['research', researchId],
  queryFn: () => getResearch(researchId),
  keepPreviousData: true,
});
