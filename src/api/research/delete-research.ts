import { apiClient } from '~/lib/api-client';

export async function deleteResearch(researchId: number) {
  await apiClient.delete(`api/research/${researchId}`);
}
