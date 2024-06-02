import { createRouter } from '@tanstack/react-router';
import { routeTree } from '~/routeTree.gen';

import { queryClient } from '~/lib/react-query';

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
