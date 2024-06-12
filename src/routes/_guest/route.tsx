import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

const fallbackRedirect = '/' as const;

export const Route = createFileRoute('/_guest')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (!context.auth.isUserLoading) {
      if (context.auth.isAuthenticated) {
        throw redirect({ to: search.redirect || fallbackRedirect });
      }
    }
  },
});
