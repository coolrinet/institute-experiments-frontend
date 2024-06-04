import {
  Anchor,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAt, IconCheck, IconLock, IconX } from '@tabler/icons-react';
import { Link, createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { useState } from 'react';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';
import { loginSchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_guest/login')({
  component: LoginPage,
});

const fallbackRedirect = '/' as const;

function LoginPage() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { login } = useAuth();

  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      shouldRemember: false,
    },
    validate: zodResolver(loginSchema),
  });

  const handleLogin = async (values: typeof form.values) => {
    setIsPending(true);
    try {
      await login(values);

      await router.invalidate();

      await navigate({ to: search.redirect || fallbackRedirect });

      notifications.show({
        title: 'Успешная авторизация',
        message: 'Вы авторизованы!',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        if (error.response && error.status !== 500) {
          notifications.show({
            title: 'Произошла ошибка',
            message: error.response.data.message,
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
    } finally {
      form.setFieldValue('password', '');
      setIsPending(false);
    }
  };

  return (
    <Center>
      <Stack gap={20} align='center'>
        <Title ta='center'>Авторизация</Title>
        <Card withBorder w={450} padding='xl' radius='md' shadow='xl'>
          <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack gap={15}>
              <TextInput
                label='Email'
                leftSection={<IconAt size={16} />}
                leftSectionPointerEvents='none'
                type='email'
                placeholder='Введите ваш email'
                key={form.key('email')}
                disabled={isPending}
                {...form.getInputProps('email')}
              />
              <TextInput
                label='Пароль'
                leftSection={<IconLock size={16} />}
                leftSectionPointerEvents='none'
                type='password'
                placeholder='Введите ваш пароль'
                key={form.key('password')}
                disabled={isPending}
                {...form.getInputProps('password')}
              />
              <Group justify='space-between'>
                <Checkbox
                  label='Запомнить меня'
                  disabled={isPending}
                  key={form.key('remember')}
                  {...form.getInputProps('shouldRemember')}
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
