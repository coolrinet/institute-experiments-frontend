import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/machineries/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
    name: z.string().optional().catch(''),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(getMachineriesQueryOptions(deps)),
  pendingComponent: PageLoader,
});
