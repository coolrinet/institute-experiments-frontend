import { apiClient } from '~/lib/api-client';

import { MachineryParameterData } from '~/types/schema';

export async function editMachineryParameter(
  machineryParameterId: number,
  data: MachineryParameterData
) {
  await apiClient.put(`api/machinery-parameters/${machineryParameterId}`, {
    name: data.name,
    parameter_type: data.parameterType,
    value_type: data.valueType,
    machinery_id: data.machineryId,
  });
}
