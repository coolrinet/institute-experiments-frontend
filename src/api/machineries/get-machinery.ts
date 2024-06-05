import { apiClient } from '~/lib/api-client';

import { Machinery } from '~/types/api';

async function getMachinery(machineryId: number) {
  const response = await apiClient.get<Machinery>(`api/machineries/${machineryId}`);

  return response.data;
}

export const getMachineryQueryOptions = (machineryId: number) => ({
  queryKey: ['machinery', machineryId],
  queryFn: () => getMachinery(machineryId),
});
