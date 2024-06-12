import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/research/$researchId')({
  parseParams: ({ researchId }) => ({ researchId: Number(researchId) }),
});
