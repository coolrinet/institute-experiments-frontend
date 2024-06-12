import { createFileRoute } from '@tanstack/react-router';
import { getResearchQueryOptions } from '~/api/research/get-research';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/research/$researchId/experiments/add')({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(getResearchQueryOptions(params.researchId));
  },
  pendingComponent: PageLoader,
});
