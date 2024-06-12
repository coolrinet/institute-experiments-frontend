import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Center, PasswordInput, Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconLock, IconX } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { useForm } from 'react-hook-form';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';
import { ResetPasswordData, ResetPasswordInput, resetPasswordSchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_guest/reset-password')({
  component: ResetPasswordPage,
  pendingComponent: PageLoader,
});

function ResetPasswordPage() {
  const router = useRouter();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { passwordReset } = useAuth();

  const { handleSubmit, register, formState } = useForm<ResetPasswordInput>({
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutateAsync: resetPasswordMutation, isPending } = useMutation({
    mutationFn: (data: ResetPasswordData) => passwordReset(data),
    onSuccess: async () => {
      await router.invalidate();

      await navigate({ to: '/login' });

      notifications.show({
        title: 'Успех',
        message: 'Пароль успешно сброшен.',
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
  const handleResetPassword = async (values: ResetPasswordInput) => {
    const data = {
      ...values,
      token: search.token,
      email: search.email,
    };

    await resetPasswordMutation(data);
  };

  return (
    <Center>
      <Stack gap={20} align='center'>
        <Title ta='center'>Сброс пароля</Title>
        <Card withBorder w={450} padding='xl' radius='md' shadow='xl'>
          <form onSubmit={handleSubmit(handleResetPassword)}>
            <Stack gap={15}>
              <PasswordInput
                {...register('password')}
                label='Пароль'
                leftSection={<IconLock size={16} />}
                leftSectionPointerEvents='none'
                placeholder='Введите новый пароль'
                disabled={isPending}
                error={formState.errors.password?.message}
              />
              <PasswordInput
                {...register('passwordConfirmation')}
                label='Подтверждение пароля'
                leftSection={<IconLock size={16} />}
                leftSectionPointerEvents='none'
                placeholder='Подтвердите пароль'
                disabled={isPending}
                error={formState.errors.passwordConfirmation?.message}
              />
              <Button type='submit' fullWidth loading={isPending} disabled={isPending}>
                Сменить пароль
              </Button>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Center>
  );
}