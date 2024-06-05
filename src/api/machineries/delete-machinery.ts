import { apiClient } from '~/lib/api-client';

export async function deleteMachinery(machineryId: number) {
  await apiClient.delete(`/api/machineries/${machineryId}`);
}
