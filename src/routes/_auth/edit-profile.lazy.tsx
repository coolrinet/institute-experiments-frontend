import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { editProfile } from '~/api/profile/edit-profile';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';
import { EditProfileData, editProfileSchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_auth/edit-profile')({
  component: EditProfilePage,
  pendingComponent: PageLoader,
});

function EditProfilePage() {
  const navigate = Route.useNavigate();
  const router = useRouter();

  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { handleSubmit, register, formState } = useForm<EditProfileData>({
    defaultValues: {
      lastName: user?.data.lastName,
      firstName: user?.data.firstName,
      middleName: user?.data.middleName,
      email: user?.data.email,
      isAdmin: user?.data.isAdmin,
      currentPassword: '',
      currentPasswordConfirmation: '',
      newPassword: null,
    },
    resolver: zodResolver(editProfileSchema),
  });

  const { mutateAsync: editProfileMutation, isPending } = useMutation({
    mutationFn: editProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth.user'] });

      await router.invalidate();

      await navigate({ to: '/' });

      notifications.show({
        title: 'Успех',
        message: 'Ваш профиль был обновлен',
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

  const onSubmit = async (data: EditProfileData) => {
    await editProfileMutation(data);
  };

  return (
    <Box pos='relative'>
      <LoadingOverlay visible={isPending} />
      <Stack align='center'>
        <Title ta='center'>Редактирование профиля</Title>
        <Card withBorder w='100%' maw={550} mx='auto' padding='xl' radius='md' shadow='xl'>
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
              <PasswordInput
                {...register('newPassword')}
                withAsterisk
                label='Новый пароль'
                placeholder='Новый пароль'
                disabled={isPending}
                error={formState.errors.newPassword?.message}
              />
              <PasswordInput
                {...register('currentPassword')}
                withAsterisk
                label='Текущий пароль'
                placeholder='Текущий пароль'
                disabled={isPending}
                error={formState.errors.currentPassword?.message}
              />
              <PasswordInput
                {...register('currentPasswordConfirmation')}
                withAsterisk
                label='Подтвердите текущий пароль'
                placeholder='Подтвердите текущий пароль'
                disabled={isPending}
                error={formState.errors.currentPasswordConfirmation?.message}
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
      </Stack>
    </Box>
  );
}
