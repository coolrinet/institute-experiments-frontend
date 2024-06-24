import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconX } from '@tabler/icons-react';
import { Link, createLazyFileRoute } from '@tanstack/react-router';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';
import useUsers from '~/hooks/use-users';

export const Route = createLazyFileRoute('/_auth/users/')({
  component: UsersPage,
  pendingComponent: PageLoader,
});

function UsersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { user } = useAuth();
  const { users, isUsersFetching, isUserDeleting, deleteUser } = useUsers(search);

  const totalPages = users.meta!.last_page;

  const handleDelete = (id: number) => {
    if (user?.data.id === id) {
      notifications.show({
        title: 'Произошла ошибка',
        message: 'Нельзя удалить самого себя',
        color: 'red',
        icon: <IconX size={16} />,
      });

      return;
    }

    const dialogResult = confirm('Вы действительно хотите удалить пользователя?');

    if (!dialogResult) {
      return;
    }

    deleteUser(id);
  };

  const tableRows = users.data.map(user => (
    <Table.Tr key={user.id}>
      <Table.Td>{user.lastName}</Table.Td>
      <Table.Td>{user.firstName}</Table.Td>
      <Table.Td>{user.middleName || '-'}</Table.Td>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>{user.isAdmin ? 'да' : 'нет'}</Table.Td>
      <Table.Td>
        <ActionIcon color='red' onClick={() => handleDelete(user.id)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  const onPageChange = async (page: number) => {
    await navigate({ search: { ...search, page } });
  };

  return (
    <Stack>
      <Title>Список пользователей</Title>
      <Box pos='relative'>
        <LoadingOverlay visible={isUsersFetching || isUserDeleting} />
        <Card withBorder shadow='xl' padding='lg' radius='md'>
          {users.data.length ? (
            <Table.ScrollContainer minWidth={500}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Фамилия</Table.Th>
                    <Table.Th>Имя</Table.Th>
                    <Table.Th>Отчество</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Администратор?</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{tableRows}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <Text>Пользователи отсутствуют</Text>
          )}
        </Card>
      </Box>

      <Group justify='space-between'>
        {totalPages && totalPages > 1 && (
          <Pagination value={search.page} total={totalPages} onChange={onPageChange} />
        )}
        <Button renderRoot={props => <Link to='/users/add' {...props} />}>
          Добавить пользователя
        </Button>
      </Group>
    </Stack>
  );
}
