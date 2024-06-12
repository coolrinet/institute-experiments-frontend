import { createFileRoute } from '@tanstack/react-router';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { getResearchQueryOptions } from '~/api/research/get-research';
import { getUsersQueryOptions } from '~/api/users/get-users';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/research/$researchId/edit')({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(getResearchQueryOptions(params.researchId));
    context.queryClient.ensureQueryData(getMachineriesQueryOptions({}));
    context.queryClient.ensureQueryData(getUsersQueryOptions({}));
  },
  pendingComponent: PageLoader,
});
