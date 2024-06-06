import { apiClient } from '~/lib/api-client';

import { MachineryParameter } from '~/types/api';

export async function getMachineryParameter(id: number) {
  const response = await apiClient.get<MachineryParameter>(`/api/machinery-parameters/${id}`);

  return response.data;
}
