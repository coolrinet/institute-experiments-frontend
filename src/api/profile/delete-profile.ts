import { apiClient } from '~/lib/api-client';

export async function deleteProfile() {
  await apiClient.delete('/api/profile');
}
