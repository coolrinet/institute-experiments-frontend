import { AppShell } from '@mantine/core';
import { Outlet, createLazyFileRoute } from '@tanstack/react-router';

import PageLoader from '~/components/Loader';

export const Route = createLazyFileRoute('/_guest')({
  component: GuestLayout,
  pendingComponent: PageLoader,
});

function GuestLayout() {
  return (
    <AppShell padding='md'>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
