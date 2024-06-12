import { createFileRoute } from '@tanstack/react-router';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/machinery-parameters/add')({
  loader: ({ context }) => context.queryClient.ensureQueryData(getMachineriesQueryOptions({})),
  pendingComponent: PageLoader,
});
