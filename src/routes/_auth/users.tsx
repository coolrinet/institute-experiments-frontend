import { notifications } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';
import { createFileRoute, redirect } from '@tanstack/react-router';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/users')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isUserLoading) {
      if (!context.auth.user?.data.isAdmin) {
        notifications.show({
          title: 'Доступ запрещен',
          message: 'У вас нет прав для просмотра этой страницы',
          color: 'red',
          icon: <IconX size={16} />,
        });
        throw redirect({ to: '/' });
      }
    }
  },
  pendingComponent: PageLoader,
});
