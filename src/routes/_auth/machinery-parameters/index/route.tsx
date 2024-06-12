import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getMachineryParametersQueryOptions } from '~/api/machinery-parameters/get-machinery-parameters';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/machinery-parameters/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
    name: z.string().optional().catch(''),
    parameterType: z.enum(['input', 'output']).optional(),
    valueType: z.enum(['quantitative', 'quality']).optional(),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(getMachineryParametersQueryOptions(deps)),
  pendingComponent: PageLoader,
});
