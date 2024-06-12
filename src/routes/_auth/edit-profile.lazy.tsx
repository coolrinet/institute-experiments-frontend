import { createLazyFileRoute } from '@tanstack/react-router';

import PageLoader from '~/components/Loader';

export const Route = createLazyFileRoute('/_auth/edit-profile')({
  component: () => <div>Hello /_auth/edit-profile!</div>,
  pendingComponent: PageLoader,
});
