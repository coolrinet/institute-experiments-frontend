import { Button, Card, Checkbox, Group, Stack, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { addUser } from '~/api/users/add-user';

import { ApiErrorResponse } from '~/types/api';
import { AddUserData, addUserSchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_auth/users/add')({
  component: AddNewUserPage,
});

function AddNewUserPage() {
  const navigate = Route.useNavigate();
  const router = useRouter();

  const { isPending, mutateAsync: addUserMutation } = useMutation({
    mutationFn: addUser,
    onSuccess: async () => {
      await router.invalidate();

      await navigate({ to: '/users' });

      notifications.show({
        title: 'Успех',
        message: 'Пользователь добавлен в систему. Письмо отправлено на его электронную почту',
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

  const handleSubmit = async (data: AddUserData) => {
    await addUserMutation(data);
  };

  const form = useForm<AddUserData>({
    mode: 'uncontrolled',
    initialValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      email: '',
      isAdmin: false,
    },
    validate: zodResolver(addUserSchema),
  });

  return (
    <Stack align='center'>
      <Title ta='center'>Добавить нового пользователя</Title>
      <Card withBorder w={550} padding='xl' radius='md' shadow='xl'>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap={15}>
            <TextInput
              type='text'
              withAsterisk
              key={form.key('lastName')}
              {...form.getInputProps('lastName')}
              label='Фамилия'
              placeholder='Иванов'
              disabled={isPending}
            />
            <TextInput
              type='text'
              withAsterisk
              key={form.key('firstName')}
              {...form.getInputProps('firstName')}
              label='Имя'
              placeholder='Иван'
              disabled={isPending}
            />
            <TextInput
              type='text'
              key={form.key('middleName')}
              {...form.getInputProps('middleName')}
              label='Отчество'
              placeholder='Иванович'
              disabled={isPending}
            />
            <TextInput
              type='email'
              withAsterisk
              key={form.key('email')}
              {...form.getInputProps('email')}
              label='Электронная почта'
              placeholder='LpH1b@example.com'
              disabled={isPending}
            />
            <Checkbox
              key={form.key('isAdmin')}
              {...form.getInputProps('isAdmin')}
              label='Предоставить права администратора'
            />
            <Group justify='flex-end'>
              <Button type='submit' disabled={isPending} loading={isPending}>
                Добавить пользователя
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
