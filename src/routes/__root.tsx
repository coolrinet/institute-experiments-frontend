import { Notifications } from '@mantine/notifications';
import { QueryClient } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import { AuthContext } from '~/hooks/use-auth';

type RouterContext = {
  queryClient: QueryClient;
  auth: AuthContext;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <Notifications />
    </>
  );
}
