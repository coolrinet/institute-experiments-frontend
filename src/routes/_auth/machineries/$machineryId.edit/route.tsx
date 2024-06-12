import { createFileRoute } from '@tanstack/react-router';
import { getMachineryQueryOptions } from '~/api/machineries/get-machinery';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/machineries/$machineryId/edit')({
  parseParams: ({ machineryId }) => ({ machineryId: Number(machineryId) }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(getMachineryQueryOptions(params.machineryId)),
  pendingComponent: PageLoader,
});
