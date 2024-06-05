import { apiClient } from '~/lib/api-client';

import { MachineryData } from '~/types/schema';

export async function addMachinery(data: MachineryData) {
  await apiClient.post('/api/machineries', data);
}
