import { Notifications } from '@mantine/notifications';
import { QueryClient } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import PageLoader from '~/components/Loader';

import { AuthContext } from '~/hooks/use-auth';

type RouterContext = {
  queryClient: QueryClient;
  auth: AuthContext;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  pendingComponent: PageLoader,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <Notifications />
    </>
  );
}
