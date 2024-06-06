import { AppShell, Burger, Button, Group, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBuildingFactory,
  IconCheck,
  IconHome,
  IconSettings,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { Link, Outlet, createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import React, { useState } from 'react';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isUserLoading) {
      if (!context.auth.isAuthenticated) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        });
      }
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const router = useRouter();
  const navigate = Route.useNavigate();

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { logout, user } = useAuth();

  const [isPending, setIsPending] = useState(false);

  async function handleLogout(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    setIsPending(true);

    try {
      await logout();

      await router.invalidate();

      await navigate({ to: '/login' });

      notifications.show({
        title: 'Успех',
        message: 'Вы вышли из системы!',
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
  }

  return (
    <AppShell
      padding='md'
      header={{
        height: 60,
      }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      <AppShell.Header>
        <Group h='100%' justify='space-between' px='md'>
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom='sm' size='sm' />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom='sm' size='sm' />
          <Button onClick={handleLogout} disabled={isPending} loading={isPending}>
            Выйти из системы
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <NavLink
          leftSection={<IconHome size={16} />}
          label='Главная'
          renderRoot={props => <Link to='/' {...props} />}
        />
        <NavLink
          leftSection={<IconBuildingFactory size={16} />}
          label='Установки'
          renderRoot={props => <Link to='/machineries' {...props} />}
        />
        <NavLink
          leftSection={<IconSettings size={16} />}
          label='Параметры установок'
          renderRoot={props => <Link to='/machinery-parameters' {...props} />}
        />
        {user?.data.isAdmin && (
          <NavLink
            leftSection={<IconUsers size={16} />}
            label='Пользователи'
            renderRoot={props => <Link to='/users' {...props} />}
          />
        )}
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
