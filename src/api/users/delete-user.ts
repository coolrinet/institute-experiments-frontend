import { apiClient } from '~/lib/api-client';

export async function deleteUser(id: number) {
  await apiClient.delete(`/api/users/${id}`);
}
