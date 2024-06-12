import { createFileRoute } from '@tanstack/react-router';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { getMachineryParameterQueryOptions } from '~/api/machinery-parameters/get-machinery-parameter';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/machinery-parameters/$machineryParameterId/edit')({
  parseParams: ({ machineryParameterId }) => ({
    machineryParameterId: Number(machineryParameterId),
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(
      getMachineryParameterQueryOptions(params.machineryParameterId)
    );

    context.queryClient.ensureQueryData(getMachineriesQueryOptions({}));
  },
  pendingComponent: PageLoader,
});
