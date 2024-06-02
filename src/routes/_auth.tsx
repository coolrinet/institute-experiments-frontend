import { AppShell, NavLink } from '@mantine/core';
import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router';

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
  return (
    <AppShell
      padding='md'
      navbar={{
        width: 200,
        breakpoint: 'sm',
      }}
    >
      <AppShell.Navbar>
        <NavLink label='Home' renderRoot={props => <Link to='/' {...props} />} />
        <NavLink label='About' renderRoot={props => <Link to='/about' {...props} />} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
