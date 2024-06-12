import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Suspense } from 'react';

import { queryClient } from '~/lib/react-query';
import { router } from '~/lib/router';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

dayjs.extend(customParseFormat);

function AppRouter() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
}

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Suspense fallback={<PageLoader />}>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
        </QueryClientProvider>
      </Suspense>
    </MantineProvider>
  );
}

export default App;
