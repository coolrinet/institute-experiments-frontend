import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { editMachinery } from '~/api/machineries/edit-machinery';
import { getMachineryQueryOptions } from '~/api/machineries/get-machinery';

import { ApiErrorResponse } from '~/types/api';
import { MachineryData } from '~/types/schema';

const route = getRouteApi('/_auth/machineries/$machineryId/edit');

export default function useMachinery(machineryId: number) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = route.useNavigate();

  const { data: machinery } = useSuspenseQuery(getMachineryQueryOptions(machineryId));

  const { mutate: editMachineryMutation, isPending: isMachineryEditing } = useMutation({
    mutationFn: (data: MachineryData) => editMachinery(machineryId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['machineries'] });

      await queryClient.invalidateQueries({
        queryKey: ['machinery', machineryId],
      });

      await router.invalidate();

      await navigate({ to: '/machineries', search: { page: 1 } });

      notifications.show({
        title: 'Успех',
        message: 'Установка успешно изменена',
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
    machinery,
    isMachineryEditing,
    editMachinery: editMachineryMutation,
  };
}
