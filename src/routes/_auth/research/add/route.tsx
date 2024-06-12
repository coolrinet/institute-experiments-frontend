import { createFileRoute } from '@tanstack/react-router';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { getUsersQueryOptions } from '~/api/users/get-users';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/research/add')({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getMachineriesQueryOptions({}));
    context.queryClient.ensureQueryData(getUsersQueryOptions({}));
  },
  pendingComponent: PageLoader,
});
