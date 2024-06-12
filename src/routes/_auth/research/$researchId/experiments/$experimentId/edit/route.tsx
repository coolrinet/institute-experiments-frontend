import { createFileRoute } from '@tanstack/react-router';
import { getExperimentQueryOptions } from '~/api/experiments/get-experiment';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/research/$researchId/experiments/$experimentId/edit')({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(
      getExperimentQueryOptions(params.researchId, params.experimentId)
    );
  },
  pendingComponent: PageLoader,
});
