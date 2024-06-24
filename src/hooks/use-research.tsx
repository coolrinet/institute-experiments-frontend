import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getRouteApi, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { editResearch } from '~/api/research/edit-research';
import { getResearchQueryOptions } from '~/api/research/get-research';

import { ApiErrorResponse } from '~/types/api';
import { ResearchData } from '~/types/schema';

const route = getRouteApi('/_auth/research/$researchId');

export default function useResearch(researchId: number) {
  const router = useRouter();
  const navigate = route.useNavigate();

  const queryClient = useQueryClient();

  const { data: research } = useSuspenseQuery(getResearchQueryOptions(researchId));

  const { mutate: editResearchMutation, isPending: isResearchEditing } = useMutation({
    mutationFn: (data: ResearchData) => editResearch(researchId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['research-list'] });

      await queryClient.invalidateQueries({
        queryKey: ['research', researchId],
      });

      await router.invalidate();

      await navigate({ to: '/research', search: { page: 1 } });

      notifications.show({
        title: 'Успех',
        message: 'Исследование успешно изменено',
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
    isResearchEditing,
    editResearch: editResearchMutation,
  };
}
