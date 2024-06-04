import { Button, Group, Pagination, Stack, Table, Title } from '@mantine/core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getUsersQueryOptions } from '~/api/users/get-users';

export const Route = createFileRoute('/_auth/users/')({
  validateSearch: z.object({
    page: z.number().optional().catch(1),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(getUsersQueryOptions(deps)),
  component: UsersPage,
});

function UsersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: users } = useSuspenseQuery(getUsersQueryOptions(search));

  const totalPages = users?.meta?.last_page;

  const tableRows = users.data.map(user => (
    <Table.Tr key={user.id}>
      <Table.Td>{user.lastName}</Table.Td>
      <Table.Td>{user.firstName}</Table.Td>
      <Table.Td>{user.middleName || '-'}</Table.Td>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>{user.isAdmin ? 'да' : 'нет'}</Table.Td>
    </Table.Tr>
  ));

  const onPageChange = async (page: number) => {
    await navigate({ search: { ...search, page } });
  };

  return (
    <Stack>
      <Title>Список пользователей</Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Фамилия</Table.Th>
            <Table.Th>Имя</Table.Th>
            <Table.Th>Отчество</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Администратор?</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{tableRows}</Table.Tbody>
      </Table>
      <Group justify='space-between'>
        {totalPages && (
          <Pagination value={search.page} total={totalPages} onChange={onPageChange} />
        )}
        <Button renderRoot={props => <Link to='/users/add-new' {...props} />}>
          Добавить пользователя
        </Button>
      </Group>
    </Stack>
  );
}
