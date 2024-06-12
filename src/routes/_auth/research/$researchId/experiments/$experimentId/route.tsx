import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/research/$researchId/experiments/$experimentId')({
  parseParams: ({ experimentId }) => ({ experimentId: Number(experimentId) }),
});
