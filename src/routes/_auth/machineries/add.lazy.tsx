import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Group, Stack, TextInput, Textarea, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { addMachinery } from '~/api/machineries/add-machinery';

import PageLoader from '~/components/Loader';

import { ApiErrorResponse } from '~/types/api';
import { MachineryData, machinerySchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_auth/machineries/add')({
  component: AddMachineryPage,
  pendingComponent: PageLoader,
});

function AddMachineryPage() {
  const router = useRouter();
  const navigate = Route.useNavigate();

  const queryClient = useQueryClient();

  const { isPending, mutateAsync: addMachineryMutation } = useMutation({
    mutationFn: addMachinery,
    onSuccess: async () => {
      await router.invalidate();

      await queryClient.invalidateQueries({ queryKey: ['machineries'] });

      await navigate({ to: '/machineries', search: { page: 1 } });

      notifications.show({
        title: 'Успех',
        message: 'Установка успешно добавлена в систему',
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

  const onSubmit = async (data: MachineryData) => {
    await addMachineryMutation(data);
  };

  const { handleSubmit, register, formState } = useForm<MachineryData>({
    defaultValues: {
      name: '',
      description: '',
    },
    resolver: zodResolver(machinerySchema),
  });

  return (
    <Stack align='center' w='100%'>
      <Title ta='center'>Добавить новую установку</Title>

      <Card withBorder w='100%' maw={550} mx='auto' padding='xl' radius='md' shadow='xl'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={20}>
            <TextInput
              {...register('name')}
              withAsterisk
              label='Название установки'
              placeholder='Введите название установки'
              type='text'
              description='Название установки должно быть уникальным'
              disabled={isPending}
              error={formState.errors.name?.message}
            />

            <Textarea
              {...register('description')}
              label='Описание'
              placeholder='Введите описание установки'
              autosize
              minRows={4}
              maxRows={6}
              disabled={isPending}
              error={formState.errors.description?.message}
            />

            <Group justify='flex-end'>
              <Button
                variant='outline'
                color='red'
                disabled={isPending}
                onClick={() => router.history.back()}
              >
                Отменить
              </Button>
              <Button type='submit' disabled={isPending} loading={isPending}>
                Добавить
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
