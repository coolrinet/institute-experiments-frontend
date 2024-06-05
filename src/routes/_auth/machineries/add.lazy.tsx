import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_auth/machineries/add')({
  component: AddMachineryPage,
});

function AddMachineryPage() {
  return <div>Hello /_auth/machineries/add!</div>;
}
