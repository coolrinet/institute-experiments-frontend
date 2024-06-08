import { apiClient } from '~/lib/api-client';

import { ExperimentData } from '~/types/schema';

export async function addExperiment(researchId: number, data: ExperimentData) {
  await apiClient.post(`/api/research/${researchId}/experiments`, {
    name: data.name,
    date: data.date,
    quantitative_inputs: data.quantitativeInputs.map(item => ({
      parameter_id: item.parameterId,
      value: item.value,
    })),
    quality_inputs: data.qualityInputs.map(item => ({
      parameter_id: item.parameterId,
      value: item.value,
    })),
    quantitative_outputs: data.quantitativeOutputs.map(item => ({
      parameter_id: item.parameterId,
      value: item.value,
    })),
    quality_outputs: data.qualityOutputs.map(item => ({
      parameter_id: item.parameterId,
      value: item.value,
    })),
  });
}
