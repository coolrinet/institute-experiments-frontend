import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getUsersQueryOptions } from '~/api/users/get-users';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/users/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(getUsersQueryOptions(deps)),
  pendingComponent: PageLoader,
});
