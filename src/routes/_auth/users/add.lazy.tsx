import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Checkbox, Group, Stack, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { useForm } from 'react-hook-form';
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

      await navigate({ to: '/users', search: { page: 1 } });

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

  const onSubmit = async (data: AddUserData) => {
    await addUserMutation(data);
  };

  const { handleSubmit, register, formState } = useForm<AddUserData>({
    defaultValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      email: '',
      isAdmin: false,
    },
    resolver: zodResolver(addUserSchema),
  });

  return (
    <Stack align='center'>
      <Title ta='center'>Добавить нового пользователя</Title>
      <Card withBorder padding='xl' radius='md' shadow='xl'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={15}>
            <TextInput
              {...register('lastName')}
              type='text'
              withAsterisk
              label='Фамилия'
              placeholder='Иванов'
              disabled={isPending}
              error={formState.errors.lastName?.message}
            />
            <TextInput
              {...register('firstName')}
              type='text'
              withAsterisk
              label='Имя'
              placeholder='Иван'
              disabled={isPending}
              error={formState.errors.firstName?.message}
            />
            <TextInput
              {...register('middleName')}
              type='text'
              label='Отчество'
              placeholder='Иванович'
              disabled={isPending}
              error={formState.errors.middleName?.message}
            />
            <TextInput
              {...register('email')}
              type='email'
              withAsterisk
              label='Электронная почта'
              placeholder='LpH1b@example.com'
              disabled={isPending}
              error={formState.errors.email?.message}
            />
            <Checkbox
              {...register('isAdmin')}
              label='Предоставить права администратора'
              disabled={isPending}
              error={formState.errors.isAdmin?.message}
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
