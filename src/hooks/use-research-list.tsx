import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { deleteResearch } from '~/api/research/delete-research';
import { GetAllResearchParams, getAllResearchQueryOptions } from '~/api/research/get-all-research';

import { ApiErrorResponse } from '~/types/api';

const route = getRouteApi('/_auth/research/');

export default function useResearchList(params: GetAllResearchParams) {
  const router = useRouter();
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const queryClient = useQueryClient();

  const { data: research, isFetching: isResearchFetching } = useSuspenseQuery(
    getAllResearchQueryOptions(params)
  );

  const { mutate: deleteResearchMutation, isPending: isResearchDeleting } = useMutation({
    mutationFn: (id: number) => deleteResearch(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['research-list'] });

      await router.invalidate();

      await navigate({ search: { ...search, page: 1 } });

      notifications.show({
        title: 'Успех',
        message: 'Исследование успешно удалено',
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
    research,
    isResearchFetching,
    isResearchDeleting,
    deleteResearch: deleteResearchMutation,
  };
}
