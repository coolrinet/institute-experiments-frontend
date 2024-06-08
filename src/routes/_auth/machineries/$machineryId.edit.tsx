import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { editMachinery } from '~/api/machineries/edit-machinery';
import { getMachineryQueryOptions } from '~/api/machineries/get-machinery';

import PageLoader from '~/components/Loader';

import { ApiErrorResponse } from '~/types/api';
import { MachineryData, machinerySchema } from '~/types/schema';

export const Route = createFileRoute('/_auth/machineries/$machineryId/edit')({
  parseParams: ({ machineryId }) => ({ machineryId: Number(machineryId) }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(getMachineryQueryOptions(params.machineryId)),
  component: EditMachineryPage,
  pendingComponent: PageLoader,
});

function EditMachineryPage() {
  const { machineryId } = Route.useParams();
  const router = useRouter();
  const navigate = Route.useNavigate();

  const queryClient = useQueryClient();

  const { data: machinery, isFetching } = useSuspenseQuery(getMachineryQueryOptions(machineryId));

  const { mutateAsync: editMachineryMutation, isPending } = useMutation({
    mutationFn: (data: MachineryData) => editMachinery(machineryId, data),
    onSuccess: async () => {
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

  const { handleSubmit, register, formState } = useForm<MachineryData>({
    defaultValues: {
      name: machinery.data.name,
      description: machinery.data.description,
    },
    resolver: zodResolver(machinerySchema),
  });

  const onSubmit = async (data: MachineryData) => {
    await editMachineryMutation(data);
  };

  return (
    <Stack align='center'>
      <Title ta='center'>Изменить данные установки</Title>

      <Box pos='relative' w='100%'>
        <LoadingOverlay visible={isFetching} />

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
                  Изменить
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Box>
    </Stack>
  );
}
