import { createLazyFileRoute } from '@tanstack/react-router';

import PageLoader from '~/components/Loader';

export const Route = createLazyFileRoute('/_auth/research/$researchId')({
  pendingComponent: PageLoader,
});
