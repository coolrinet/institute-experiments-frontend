import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { deleteMachinery } from '~/api/machineries/delete-machinery';
import {
  GetMachineriesParams,
  getMachineriesQueryOptions,
} from '~/api/machineries/get-machineries';

import { ApiErrorResponse } from '~/types/api';

const route = getRouteApi('/_auth/machineries/');

export default function useMachineries(params: GetMachineriesParams) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = route.useNavigate();
  const search = route.useSearch();

  const { data: machineries, isFetching: isMachineriesFetching } = useSuspenseQuery(
    getMachineriesQueryOptions(params)
  );

  const { mutate: deleteMachineryMutation, isPending: isMachineryDeleting } = useMutation({
    mutationFn: (id: number) => deleteMachinery(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['machineries'] });

      await router.invalidate();

      await navigate({ search: { ...search, page: 1 } });

      notifications.show({
        title: 'Успех',
        message: 'Установка успешно удалена',
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
    machineries,
    isMachineriesFetching,
    isMachineryDeleting,
    deleteMachinery: deleteMachineryMutation,
  };
}
