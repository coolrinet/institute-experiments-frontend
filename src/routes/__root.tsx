import { AppShell, NavLink } from '@mantine/core';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
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
