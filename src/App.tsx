import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { RouterProvider } from '@tanstack/react-router';

import { router } from '~/lib/router';

function App() {
  return (
    <MantineProvider>
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

export default App;
