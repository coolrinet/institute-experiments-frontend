import { Button, Card, Center, Stack, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconLock, IconX } from '@tabler/icons-react';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { useState } from 'react';
import { z } from 'zod';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';
import { resetPasswordSchema } from '~/types/schema';

export const Route = createFileRoute('/_guest/reset-password')({
  validateSearch: z.object({
    token: z.string().catch(''),
    email: z.string().email().catch(''),
  }),
  beforeLoad: ({ search }) => {
    if (!(search.email || search.token)) {
      throw redirect({ to: '/login' });
    }
  },
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { passwordReset } = useAuth();

  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      password: '',
      passwordConfirmation: '',
    },
    validate: zodResolver(resetPasswordSchema),
  });

  const handleResetPassword = async (values: typeof form.values) => {
    setIsPending(true);

    const data = {
      ...values,
      token: search.token,
      email: search.email,
    };

    try {
      await passwordReset(data);

      await router.invalidate();

      await navigate({ to: '/login' });

      notifications.show({
        title: 'Успех',
        message: 'Пароль успешно сброшен.',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        if (error.response) {
          notifications.show({
            title: 'Произошла ошибка',
            message: error.response.data.message,
            color: 'red',
            icon: <IconX size={16} />,
          });
        }
      } else {
        console.error(error);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Center>
      <Stack gap={20} align='center'>
        <Title ta='center'>Сброс пароля</Title>
        <Card withBorder w={450} padding='xl' radius='md' shadow='xl'>
          <form onSubmit={form.onSubmit(handleResetPassword)}>
            <Stack gap={15}>
              <TextInput
                label='Пароль'
                leftSection={<IconLock size={16} />}
                leftSectionPointerEvents='none'
                type='password'
                placeholder='Введите новый пароль'
                key={form.key('password')}
                disabled={isPending}
                {...form.getInputProps('password')}
              />
              <TextInput
                label='Подтверждение пароля'
                leftSection={<IconLock size={16} />}
                leftSectionPointerEvents='none'
                type='password'
                placeholder='Подтвердите пароль'
                key={form.key('passwordConfirmation')}
                disabled={isPending}
                {...form.getInputProps('passwordConfirmation')}
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
