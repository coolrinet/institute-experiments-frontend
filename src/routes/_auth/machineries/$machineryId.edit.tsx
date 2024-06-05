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
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
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

  const { data: machinery, isFetching } = useSuspenseQuery(getMachineryQueryOptions(machineryId));

  const { mutateAsync: editMachineryMutation, isPending } = useMutation({
    mutationFn: (data: MachineryData) => editMachinery(machineryId, data),
    onSuccess: async () => {
      await router.invalidate();

      notifications.show({
        title: 'Успех',
        message: 'Установка успешно изменена',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });

      await navigate({ to: '/machineries' });
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

  const form = useForm<MachineryData>({
    mode: 'uncontrolled',
    initialValues: {
      name: machinery.data.name,
      description: machinery.data.description,
    },
    validate: zodResolver(machinerySchema),
  });

  const handleSubmit = async (data: MachineryData) => {
    await editMachineryMutation(data);
  };

  return (
    <Stack align='center'>
      <Title ta='center'>Изменить данные установки</Title>

      <Box pos='relative'>
        <LoadingOverlay visible={isFetching} />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Card withBorder w={550} padding='xl' radius='md' shadow='xl'>
            <Stack gap={20}>
              <TextInput
                withAsterisk
                label='Название установки'
                placeholder='Введите название установки'
                type='text'
                description='Название установки должно быть уникальным'
                disabled={isPending}
                key={form.key('name')}
                {...form.getInputProps('name')}
              />

              <Textarea
                label='Описание'
                placeholder='Введите описание установки'
                autosize
                minRows={4}
                maxRows={6}
                disabled={isPending}
                key={form.key('description')}
                {...form.getInputProps('description')}
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
          </Card>
        </form>
      </Box>
    </Stack>
  );
}
