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
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconEdit, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { z } from 'zod';
import { deleteMachinery } from '~/api/machineries/delete-machinery';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { getUserFullName } from '~/utils/get-user-full-name';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';

export const Route = createFileRoute('/_auth/machineries/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
    name: z.string().optional().catch(''),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(getMachineriesQueryOptions(deps)),
  component: MachineriesPage,
  pendingComponent: PageLoader,
});

function MachineriesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const { user } = useAuth();

  const queryClient = useQueryClient();
  const { data: machineries, isFetching } = useSuspenseQuery(getMachineriesQueryOptions(search));

  const totalPages = machineries.meta!.last_page;

  const onPageChange = async (page: number) => {
    await navigate({ search: { ...search, page } });
  };

  const onMachineryNameChange = async (name: string) => {
    if (name) {
      await navigate({ search: { page: 1, name } });
    } else {
      await navigate({ search: { page: 1 } });
    }
  };

  const handleMachinerySearch = useDebouncedCallback(async (name: string) => {
    await onMachineryNameChange(name);
  }, 200);

  const handleDelete = async (machineryId: number) => {
    const machinery = machineries.data.find(machinery => machinery.id === machineryId);

    if (machinery?.user.id !== user?.data.id) {
      notifications.show({
        title: 'Неудача',
        message: 'Нельзя удалить установку, добавленную другим пользователем',
        color: 'red',
        icon: <IconX size={16} />,
      });

      return;
    }

    const dialogResult = confirm('Вы действительно хотите удалить установку?');

    if (!dialogResult) {
      return;
    }

    try {
      await deleteMachinery(machineryId);

      await queryClient.invalidateQueries({ queryKey: ['machineries'] });

      await router.invalidate();

      notifications.show({
        title: 'Успех',
        message: 'Установка успешно удалена',
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

  const tableRows = machineries.data.map(machinery => {
    return (
      <Table.Tr key={machinery.id}>
        <Table.Td>{machinery.name}</Table.Td>
        <Table.Td>{machinery.description}</Table.Td>
        <Table.Td>{getUserFullName(machinery.user)}</Table.Td>
        <Table.Td>
          <ActionIcon.Group>
            <ActionIcon
              renderRoot={props => (
                <Link
                  to='/machineries/$machineryId/edit'
                  params={{ machineryId: machinery.id }}
                  {...props}
                />
              )}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon color='red' onClick={() => handleDelete(machinery.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </ActionIcon.Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack>
      <Title>Список установок</Title>

      <Box pos='relative'>
        <LoadingOverlay visible={isFetching} />
        <Card withBorder shadow='xl' padding='lg' radius='md'>
          <Card.Section inheritPadding withBorder py='md'>
            <TextInput
              placeholder='Поиск по названию...'
              leftSection={<IconSearch size={16} />}
              leftSectionPointerEvents='none'
              defaultValue={search.name}
              onChange={event => handleMachinerySearch(event.currentTarget.value)}
            />
          </Card.Section>
          {machineries.data.length > 0 ? (
            <Table.ScrollContainer minWidth={500} mt='sm'>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название установки</Table.Th>
                    <Table.Th>Описание</Table.Th>
                    <Table.Th>Кем добавлена</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{tableRows}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <Text mt='sm'>Установки отсутствуют</Text>
          )}
        </Card>
      </Box>
      <Group justify='space-between'>
        {totalPages && totalPages > 1 && (
          <Pagination value={search.page} total={totalPages} onChange={onPageChange} />
        )}
        <Button renderRoot={props => <Link to='/machineries/add' {...props} />}>
          Добавить установку
        </Button>
      </Group>
    </Stack>
  );
}
