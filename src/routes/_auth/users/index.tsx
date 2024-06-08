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
import { IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { z } from 'zod';
import { deleteUser } from '~/api/users/delete-user';
import { getUsersQueryOptions } from '~/api/users/get-users';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';

export const Route = createFileRoute('/_auth/users/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(getUsersQueryOptions(deps)),
  component: UsersPage,
});

function UsersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { user } = useAuth();

  const { data: users, isFetching } = useSuspenseQuery(getUsersQueryOptions(search));

  const totalPages = users.meta!.last_page;

  const handleDelete = async (id: number) => {
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

    try {
      await deleteUser(id);

      await queryClient.invalidateQueries({ queryKey: ['users'] });

      await router.invalidate();

      notifications.show({
        title: 'Успех',
        message: 'Пользователь удален из системы',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });

      await navigate({ search: { ...search, page: 1 } });
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        if (error.response && error.status !== 500) {
          notifications.show({
            title: 'Произошла ошибка',
            message: error.response.data.message,
            color: 'red',
            icon: <IconX size={16} />,
          });
        } else {
          console.error(error);
          notifications.show({
            title: 'Произошла ошибка',
            message: 'Произошла непредвиденная ошибка',
            color: 'red',
            icon: <IconX size={16} />,
          });
        }
      } else {
        console.error(error);
        notifications.show({
          title: 'Произошла ошибка',
          message: 'Произошла непредвиденная ошибка',
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
    }
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
        <LoadingOverlay visible={isFetching} />
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
