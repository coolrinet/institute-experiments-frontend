import { Button, Card, Center, Group, Stack, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconAt, IconCheck, IconX } from '@tabler/icons-react';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { useState } from 'react';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';
import { forgotPasswordSchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_guest/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const router = useRouter();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { forgotPassword } = useAuth();

  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    validate: zodResolver(forgotPasswordSchema),
  });

  const handleForgotPassword = async (values: typeof form.values) => {
    setIsPending(true);

    try {
      await forgotPassword(values);

      await router.invalidate();

      await navigate({ to: '/login', search });

      notifications.show({
        title: 'Успешная отправка',
        message:
          'Письмо с инструкциями по восстановлению пароля было отправлено на указанный email.',
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
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Center>
      <Stack gap={20} align='center'>
        <Title ta='center'>Восстановление пароля</Title>
        <Card withBorder w={450} padding='xl' radius='md' shadow='xl'>
          <form onSubmit={form.onSubmit(handleForgotPassword)}>
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
              <Group justify='space-between'>
                <Button
                  variant='transparent'
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => router.history.back()}
                >
                  Назад
                </Button>
                <Button type='submit' loading={isPending} disabled={isPending}>
                  Отправить письмо
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Center>
  );
}
