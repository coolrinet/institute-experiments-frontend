import { apiClient } from '~/lib/api-client';

export async function deleteExperiment(researchId: number, experimentId: number) {
  await apiClient.delete(`/api/research/${researchId}/experiments/${experimentId}`);
}
