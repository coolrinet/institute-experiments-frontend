import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/_guest/reset-password')({
  validateSearch: z.object({
    token: z.string().catch(''),
    email: z.string().email().catch(''),
  }),
  beforeLoad: ({ search }) => {
    if (!(search.email || search.token)) {
      throw redirect({ to: '/login' });
    }
  },
});
