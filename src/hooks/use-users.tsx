import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { deleteUser } from '~/api/users/delete-user';
import { GetUsersParams, getUsersQueryOptions } from '~/api/users/get-users';

import { ApiErrorResponse } from '~/types/api';

const route = getRouteApi('/_auth/users/');

export default function useUsers(params: GetUsersParams) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const { data: users, isFetching: isUsersFetching } = useSuspenseQuery(
    getUsersQueryOptions(params)
  );

  const { mutate: deleteUserMutation, isPending: isUserDeleting } = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onMutate: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });

      await router.invalidate();
    },
    onSuccess: async () => {
      await navigate({ search: { ...search, page: 1 } });

      notifications.show({
        title: 'Успех',
        message: 'Пользователь удален из системы',
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
    users,
    deleteUser: deleteUserMutation,
    isUsersFetching,
    isUserDeleting,
  };
}
