import { apiClient } from '~/lib/api-client';

import { MachineryData } from '~/types/schema';

export async function editMachinery(machineryId: number, data: MachineryData) {
  await apiClient.put(`api/machineries/${machineryId}`, data);
}
