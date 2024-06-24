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
import { IconEdit, IconEye, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, createLazyFileRoute } from '@tanstack/react-router';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';
import useResearchList from '~/hooks/use-research-list';

export const Route = createLazyFileRoute('/_auth/research/')({
  component: ResearchPage,
  pendingComponent: PageLoader,
});

function ResearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: machineries, isFetching: isMachineriesFetching } = useSuspenseQuery(
    getMachineriesQueryOptions({})
  );

  const { research, deleteResearch, isResearchDeleting, isResearchFetching } =
    useResearchList(search);

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

  const handleShow = async (researchId: number) => {
    await navigate({
      to: '/research/$researchId',
      params: { researchId },
      search: { experimentsPage: 1 },
    });
  };

  const handleDelete = (researchId: number) => {
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

    deleteResearch(researchId);
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
        <Table.Td>{item.isPublic ? 'Публичный' : 'Частный'}</Table.Td>
        <Table.Td>{item.machinery.name}</Table.Td>
        <Table.Td>{userFullName}</Table.Td>
        <Table.Td>
          <ActionIcon.Group>
            <ActionIcon color='teal' onClick={() => handleShow(item.id)}>
              <IconEye size={16} />
            </ActionIcon>
            {user?.data.id === item.author.id && (
              <>
                <ActionIcon onClick={() => handleEdit(item.id)}>
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon color='red' onClick={() => handleDelete(item.id)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </>
            )}
          </ActionIcon.Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack>
      <Title>Список исследований</Title>
      <Box pos='relative'>
        <LoadingOverlay
          visible={isResearchFetching || isMachineriesFetching || isResearchDeleting}
        />
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
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название</Table.Th>
                    <Table.Th>Описание</Table.Th>
                    <Table.Th>Дата последнего эксперимента</Table.Th>
                    <Table.Th>Тип видимости</Table.Th>
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
