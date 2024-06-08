import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
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
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { deleteResearch } from '~/api/research/delete-research';
import { getAllResearchQueryOptions } from '~/api/research/get-all-research';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';

export const Route = createFileRoute('/_auth/research/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
    name: z.string().optional().catch(''),
    machineryId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(getMachineriesQueryOptions({}));
    context.queryClient.ensureQueryData(getAllResearchQueryOptions(deps));
  },
  component: ResearchPage,
  pendingComponent: PageLoader,
});

function ResearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: machineries, isFetching: isMachineriesFetching } = useSuspenseQuery(
    getMachineriesQueryOptions({})
  );

  const { data: research, isFetching: isResearchFetching } = useSuspenseQuery(
    getAllResearchQueryOptions(search)
  );

  const { user } = useAuth();

  const totalPages = research.meta!.last_page;

  const onPageChange = async (page: number) => {
    await navigate({ search: { ...search, page } });
  };

  const onParamChange = async (
    paramName: Exclude<keyof typeof search, 'page'>,
    value: string | null
  ) => {
    if (value) {
      await navigate({ search: { ...search, page: 1, [paramName]: value } });
    } else {
      await navigate({ search: { ...search, page: 1, [paramName]: undefined } });
    }
  };

  const handleSearchByName = useDebouncedCallback(async (name: string) => {
    await onParamChange('name', name);
  }, 200);

  const handleDelete = async (researchId: number) => {
    const researchItem = research.data.find(item => item.id === researchId);

    if (researchItem?.author?.id !== user?.data.id) {
      notifications.show({
        title: 'Неудача',
        message: 'Нельзя удалить исследование, созданное другим пользователем',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    const dialogResult = confirm('Вы действительно хотите удалить исследование?');

    if (!dialogResult) {
      return;
    }

    try {
      await deleteResearch(researchId);

      await queryClient.invalidateQueries({ queryKey: ['research'] });

      await router.invalidate();

      notifications.show({
        title: 'Успех',
        message: 'Исследование успешно удалено',
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

  const handleEdit = (researchId: number) => {
    const researchItem = research.data.find(item => item.id === researchId);

    if (user?.data.id !== researchItem!.author.id) {
      notifications.show({
        title: 'Неудача',
        message: 'Нельзя редактировать исследование, созданное другим пользователем',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    navigate({ to: '/research/$researchId/edit', params: { researchId: researchItem!.id } });
  };

  const tableRows = research.data.map(item => {
    let userFullName = `${item.author.lastName} ${item.author.firstName[0]}.`;

    if (item.author.middleName) {
      userFullName += ` ${item.author.middleName[0]}.`;
    }

    return (
      <Table.Tr key={item.id}>
        <Table.Td>{item.name}</Table.Td>
        <Table.Td>{item.description || '-'}</Table.Td>
        <Table.Td>{item.lastExperimentDate || '-'}</Table.Td>
        <Table.Td>{item.machinery.name}</Table.Td>
        <Table.Td>{userFullName}</Table.Td>
        <Table.Td>
          <ActionIcon.Group>
            <ActionIcon onClick={() => handleEdit(item.id)}>
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon color='red' onClick={() => handleDelete(item.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </ActionIcon.Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack>
      <Title>Список исследований</Title>
      <Box pos='relative'>
        <LoadingOverlay visible={isResearchFetching || isMachineriesFetching} />
        <Card withBorder shadow='xl' padding='lg' radius='md'>
          <Card.Section inheritPadding withBorder py='md'>
            <Stack>
              <TextInput
                placeholder='Поиск по названию...'
                leftSection={<IconSearch size={16} />}
                leftSectionPointerEvents='none'
                defaultValue={search.name}
                onChange={event => handleSearchByName(event.currentTarget.value)}
              />
              <Select
                label='Фильтр по установке'
                placeholder='Установка'
                clearable
                data={machineries.data.map(machinery => ({
                  value: machinery.id.toString(),
                  label: machinery.name,
                }))}
                value={search.machineryId?.toString()}
                onChange={value => onParamChange('machineryId', value)}
              />
            </Stack>
          </Card.Section>
          {research.data.length ? (
            <Table.ScrollContainer minWidth={500} mt='sm'>
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название</Table.Th>
                    <Table.Th>Описание</Table.Th>
                    <Table.Th>Дата последнего эксперимента</Table.Th>
                    <Table.Th>Используемая установка</Table.Th>
                    <Table.Th>Автор</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{tableRows}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <Text mt='sm'>Исследования отсутствуют</Text>
          )}
        </Card>
      </Box>
      <Group justify='space-between'>
        {totalPages && totalPages > 1 && (
          <Pagination value={search.page} total={totalPages} onChange={onPageChange} />
        )}
        <Button renderRoot={props => <Link to='/research/add' {...props} />}>
          Добавить новое исследование
        </Button>
      </Group>
    </Stack>
  );
}
