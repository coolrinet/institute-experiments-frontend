import { AppShell, Box, Burger, Button, Group, LoadingOverlay, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBuildingFactory,
  IconCheck,
  IconReportSearch,
  IconSettings,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Link, Outlet, createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';

export const Route = createLazyFileRoute('/_auth')({
  component: AuthLayout,
  pendingComponent: PageLoader,
});

function AuthLayout() {
  const router = useRouter();
  const navigate = Route.useNavigate();

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { logout, user } = useAuth();

  const { mutateAsync: logoutMutation, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await router.invalidate();

      await navigate({ to: '/login' });

      notifications.show({
        title: 'Успех',
        message: 'Вы вышли из системы!',
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

  async function handleLogout() {
    await logoutMutation();
  }

  return (
    <AppShell
      padding='lg'
      header={{
        height: 60,
      }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      <Box pos='relative'>
        <LoadingOverlay visible={isPending} />
        <AppShell.Header bg='blue'>
          <Group h='100%' justify='space-between' px='md'>
            <Burger
              color='white'
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom='sm'
              size='sm'
            />
            <Burger
              color='white'
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom='sm'
              size='sm'
            />
            <Button variant='white' onClick={handleLogout} disabled={isPending} loading={isPending}>
              Выйти из системы
            </Button>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar>
          <NavLink
            leftSection={<IconUser size={16} />}
            label='Профиль'
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
          <NavLink
            leftSection={<IconReportSearch size={16} />}
            label='Исследования'
            renderRoot={props => <Link to='/research' {...props} />}
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
      </Box>
    </AppShell>
  );
}
