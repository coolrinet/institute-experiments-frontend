import { apiClient } from '~/lib/api-client';

export async function deleteMachineryParameter(id: number) {
  await apiClient.delete(`/api/machinery-parameters/${id}`);
}
