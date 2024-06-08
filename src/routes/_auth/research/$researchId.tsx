import { createFileRoute } from '@tanstack/react-router';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/research/$researchId')({
  parseParams: ({ researchId }) => ({ researchId: Number(researchId) }),
  pendingComponent: PageLoader,
});
