import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_auth/users/add-new')({
  component: AddNewUserPage,
});

function AddNewUserPage() {
  return <div>Hello /_auth/users/create!</div>;
}
