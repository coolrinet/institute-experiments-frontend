import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getExperimentsQueryOptions } from '~/api/experiments/get-experiments';
import { getResearchQueryOptions } from '~/api/research/get-research';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/research/$researchId/')({
  validateSearch: z.object({
    experimentsPage: z.number().optional().default(1),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, params, deps }) => {
    context.queryClient.ensureQueryData(getResearchQueryOptions(params.researchId));
    context.queryClient.ensureQueryData(
      getExperimentsQueryOptions(params.researchId, { page: deps.experimentsPage })
    );
  },
  pendingComponent: PageLoader,
});
