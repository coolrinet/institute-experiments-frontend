import { zodResolver } from '@hookform/resolvers/zod';
import {
  Anchor,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAt, IconCheck, IconLock, IconX } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Link, createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { useForm } from 'react-hook-form';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';
import { LoginData, loginSchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_guest/login')({
  component: LoginPage,
  pendingComponent: PageLoader,
});

const fallbackRedirect = '/' as const;

function LoginPage() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { login } = useAuth();

  const { register, handleSubmit, resetField, formState } = useForm<LoginData>({
    defaultValues: {
      email: '',
      password: '',
      shouldRemember: false,
    },
    resolver: zodResolver(loginSchema),
  });

  const { mutateAsync: loginMutation, isPending } = useMutation({
    mutationFn: (data: LoginData) => login(data),
    onSuccess: async () => {
      await router.invalidate();

      await navigate({ to: search.redirect || fallbackRedirect });

      notifications.show({
        title: 'Успешная авторизация',
        message: 'Вы авторизованы!',
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

      resetField('password');
    },
  });

  const handleLogin = async (data: LoginData) => {
    await loginMutation(data);
  };

  return (
    <Center>
      <Stack gap={20} align='center'>
        <Title ta='center'>Авторизация</Title>
        <Card withBorder w={450} padding='xl' radius='md' shadow='xl'>
          <form onSubmit={handleSubmit(handleLogin)}>
            <Stack gap={15}>
              <TextInput
                {...register('email')}
                label='Email'
                leftSection={<IconAt size={16} />}
                leftSectionPointerEvents='none'
                type='email'
                placeholder='Введите ваш email'
                disabled={isPending}
                error={formState.errors.email?.message}
              />
              <PasswordInput
                {...register('password')}
                label='Пароль'
                leftSection={<IconLock size={16} />}
                leftSectionPointerEvents='none'
                placeholder='Введите ваш пароль'
                disabled={isPending}
                error={formState.errors.password?.message}
              />
              <Group justify='space-between'>
                <Checkbox
                  label='Запомнить меня'
                  disabled={isPending}
                  {...register('shouldRemember')}
                />
                <Anchor
                  underline='hover'
                  renderRoot={props => <Link to='/forgot-password' {...props} />}
                >
                  Забыли пароль?
                </Anchor>
              </Group>
              <Button type='submit' fullWidth loading={isPending} disabled={isPending}>
                Войти
              </Button>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Center>
  );
}
