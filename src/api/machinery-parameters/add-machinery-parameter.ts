import { apiClient } from '~/lib/api-client';

import { MachineryParameterData } from '~/types/schema';

export async function addMachineryParameter(data: MachineryParameterData) {
  await apiClient.post('/api/machinery-parameters', {
    name: data.name,
    parameter_type: data.parameterType,
    value_type: data.valueType,
    machinery_id: data.machineryId,
  });
}
