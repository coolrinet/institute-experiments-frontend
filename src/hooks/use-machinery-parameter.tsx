import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { editMachineryParameter } from '~/api/machinery-parameters/edit-machinery-parameter';
import { getMachineryParameterQueryOptions } from '~/api/machinery-parameters/get-machinery-parameter';

import { ApiErrorResponse } from '~/types/api';
import { MachineryParameterData } from '~/types/schema';

const route = getRouteApi('/_auth/machinery-parameters/$machineryParameterId/edit');

export default function useMachineryParameter(machineryParameterId: number) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = route.useNavigate();

  const { data: machineryParameter } = useSuspenseQuery(
    getMachineryParameterQueryOptions(machineryParameterId)
  );

  const { mutate: editMachineryParameterMutation, isPending: isMachineryParameterEditing } =
    useMutation({
      mutationFn: (data: MachineryParameterData) =>
        editMachineryParameter(machineryParameterId, data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['machinery-parameters'] });

        await queryClient.invalidateQueries({
          queryKey: ['machinery-parameter', machineryParameterId],
        });

        await router.invalidate();

        await navigate({ to: '/machinery-parameters', search: { page: 1 } });

        notifications.show({
          title: 'Успех',
          message: 'Параметр успешно изменен',
          color: 'teal',
          icon: <IconCheck size={16} />,
        });
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
    machineryParameter,
    isMachineryParameterEditing,
    editMachineryParameter: editMachineryParameterMutation,
  };
}
