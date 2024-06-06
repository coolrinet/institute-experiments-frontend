import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { apiClient } from '~/lib/api-client';

import { MachineryParameters } from '~/types/api';

type getMachineryParametersParams = {
  page?: number;
  name?: string;
  parameterType?: 'input' | 'output';
  valueType?: 'quantitative' | 'quality';
};

async function fetchMachineryParameters(params: getMachineryParametersParams) {
  const response = await apiClient.get<MachineryParameters>('/api/machinery-parameters', {
    params: {
      page: params.page,
      name: params.name,
      parameter_type: params.parameterType,
      value_type: params.valueType,
    },
  });

  return response.data;
}

export const getMachineryParametersQueryOptions = ({
  name,
  parameterType,
  valueType,
  page,
}: getMachineryParametersParams) =>
  queryOptions({
    queryKey: ['machinery-parameters', name, parameterType, valueType, page],
    queryFn: () => fetchMachineryParameters({ name, parameterType, valueType, page }),
    placeholderData: keepPreviousData,
  });
