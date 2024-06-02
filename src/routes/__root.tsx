import { Link, Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <header>
        <nav style={{ display: 'flex', gap: 10 }}>
          <Link to='/'>Home</Link>
          <Link to='/about'>About</Link>
        </nav>
      </header>
      <hr />
      <main>
        <Outlet />
      </main>
    </>
  );
}
