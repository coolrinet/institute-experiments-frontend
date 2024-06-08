import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import 'dayjs/locale/ru';
import { Suspense } from 'react';

import { queryClient } from '~/lib/react-query';
import { router } from '~/lib/router';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

function AppRouter() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
  return (
    <MantineProvider>
      <Suspense fallback={<PageLoader />}>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
        </QueryClientProvider>
      </Suspense>
    </MantineProvider>
  );
}

export default App;
