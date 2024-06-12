import { Box, Button, Card, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { deleteProfile } from '~/api/profile/delete-profile';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';

export const Route = createLazyFileRoute('/_auth/')({
  component: IndexPage,
  pendingComponent: PageLoader,
});

function IndexPage() {
  const { user } = useAuth();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutateAsync: deleteProfileMutation, isPending } = useMutation({
    mutationFn: deleteProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth.user'] });

      await router.invalidate();

      await navigate({ to: '/login' });

      notifications.show({
        title: 'Успех',
        message: 'Ваш профиль был удалён из системы',
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

  const handleDelete = async () => {
    const dialogResult = confirm(
      'Вы действительно хотите удалить свой профиль? После этого вы не сможете восстановить его!'
    );

    if (!dialogResult) {
      return;
    }

    await deleteProfileMutation();
  };

  return (
    <Box pos='relative'>
      <LoadingOverlay visible={isPending} />
      <Stack>
        <Title>Профиль пользователя</Title>
        <Card withBorder shadow='xl' padding='lg' radius='md'>
          <Card.Section withBorder inheritPadding py='lg'>
            <Title order={2} mb={20}>
              Основная информация
            </Title>
            <Group justify='space-between' h='100%'>
              <Stack gap='sm'>
                <Text>
                  <Text span fw='bold' fs='italic'>
                    Фамилия:
                  </Text>{' '}
                  {user?.data.lastName}
                </Text>
                <Text>
                  <Text span fw='bold' fs='italic'>
                    Имя:
                  </Text>{' '}
                  {user?.data.firstName}
                </Text>
                <Text>
                  <Text span fw='bold' fs='italic'>
                    Отчество:
                  </Text>{' '}
                  {user?.data.middleName}
                </Text>
                <Text>
                  <Text span fw='bold' fs='italic'>
                    Электронная почта:
                  </Text>{' '}
                  {user?.data.email}
                </Text>
              </Stack>
              <Stack justify='flex-end' w='100%' maw={300}>
                <Button fullWidth renderRoot={props => <Link to='/edit-profile' {...props} />}>
                  Изменить данные
                </Button>
                <Button fullWidth color='red' onClick={handleDelete}>
                  Удалить профиль
                </Button>
              </Stack>
            </Group>
          </Card.Section>
          <Card.Section withBorder inheritPadding py='lg'>
            <Title order={2} mb={20}>
              Статистика
            </Title>
            <Stack gap='sm'>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Добавлено установок:
                </Text>{' '}
                {user?.data.machineryCount}
              </Text>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Добавлено параметров:
                </Text>{' '}
                {user?.data.machineryParameterCount}
              </Text>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Добавлено исследований:
                </Text>{' '}
                {user?.data.researchCount}
              </Text>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Количество исследований других людей, в которых принимается участие:
                </Text>{' '}
                {user?.data.participatoryResearchCount}
              </Text>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Добавлено экспериментов:
                </Text>{' '}
                {user?.data.experimentCount}
              </Text>
            </Stack>
          </Card.Section>
        </Card>
      </Stack>
    </Box>
  );
}
