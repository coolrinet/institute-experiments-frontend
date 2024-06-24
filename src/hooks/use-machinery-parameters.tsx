import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { deleteMachineryParameter } from '~/api/machinery-parameters/delete-machinery-parameter';
import {
  GetMachineryParametersParams,
  getMachineryParametersQueryOptions,
} from '~/api/machinery-parameters/get-machinery-parameters';

import { ApiErrorResponse } from '~/types/api';

const route = getRouteApi('/_auth/machinery-parameters/');

export default function useMachineryParameters(params: GetMachineryParametersParams) {
  const router = useRouter();
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const queryClient = useQueryClient();

  const { data: machineryParameters, isFetching: isMachineryParametersFetching } = useSuspenseQuery(
    getMachineryParametersQueryOptions(params)
  );

  const { mutate: deleteMachineryParameterMutation, isPending: isMachineryParameterDeleting } =
    useMutation({
      mutationFn: (machineryParameterId: number) => deleteMachineryParameter(machineryParameterId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['machinery-parameters'] });

        await router.invalidate();

        notifications.show({
          title: 'Успех',
          message: 'Параметр успешно удалён',
          color: 'teal',
          icon: <IconCheck size={16} />,
        });

        await navigate({ search: { ...search, page: 1 } });
      },
      onError: error => {
        if (axios.isAxiosError<ApiErrorResponse>(error)) {
          if (error.response && error.status !== 500) {
            notifications.show({
              title: 'Произошла ошибка',
              message: error.response.data.message,
              color: 'red',
              icon: <IconX size={16} />,
            });
          } else {
            console.error(error);
            notifications.show({
              title: 'Произошла ошибка',
              message: 'Произошла непредвиденная ошибка',
              color: 'red',
              icon: <IconX size={16} />,
            });
          }
        } else {
          console.error(error);
          notifications.show({
            title: 'Произошла ошибка',
            message: 'Произошла непредвиденная ошибка',
            color: 'red',
            icon: <IconX size={16} />,
          });
        }
      },
    });

  return {
    machineryParameters,
    isMachineryParametersFetching,
    isMachineryParameterDeleting,
    deleteMachineryParameter: deleteMachineryParameterMutation,
  };
}
