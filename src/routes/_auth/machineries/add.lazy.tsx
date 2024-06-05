import { Button, Card, Group, Stack, TextInput, Textarea, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { addMachinery } from '~/api/machineries/add-machinery';

import { ApiErrorResponse } from '~/types/api';
import { MachineryData, machinerySchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_auth/machineries/add')({
  component: AddMachineryPage,
});

function AddMachineryPage() {
  const router = useRouter();
  const navigate = Route.useNavigate();

  const { isPending, mutateAsync: addMachineryMutation } = useMutation({
    mutationFn: addMachinery,
    onSuccess: async () => {
      await router.invalidate();

      await navigate({ to: '/machineries' });

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

  const handleSubmit = async (data: MachineryData) => {
    await addMachineryMutation(data);
  };

  const form = useForm<MachineryData>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      description: '',
    },
    validate: zodResolver(machinerySchema),
  });

  return (
    <Stack align='center'>
      <Title ta='center'>Добавить новую установку</Title>

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
              <Button type='submit' disabled={isPending} loading={isPending}>
                Добавить
              </Button>
            </Group>
          </Stack>
        </Card>
      </form>
    </Stack>
  );
}
