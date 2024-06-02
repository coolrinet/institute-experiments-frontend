import { AppShell, NavLink } from '@mantine/core';
import { QueryClient } from '@tanstack/react-query';
import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router';

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
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
