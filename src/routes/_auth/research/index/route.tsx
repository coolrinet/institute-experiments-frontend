import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { getAllResearchQueryOptions } from '~/api/research/get-all-research';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/research/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
    name: z.string().optional().catch(''),
    machineryId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(getMachineriesQueryOptions({}));
    context.queryClient.ensureQueryData(getAllResearchQueryOptions(deps));
  },
  pendingComponent: PageLoader,
});
