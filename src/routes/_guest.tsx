import { AppShell } from '@mantine/core';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

const fallbackRedirect = '/' as const;

export const Route = createFileRoute('/_guest')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (!context.auth.isUserLoading) {
      if (context.auth.isAuthenticated) {
        throw redirect({ to: search.redirect || fallbackRedirect });
      }
    }
  },
  component: GuestLayout,
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
