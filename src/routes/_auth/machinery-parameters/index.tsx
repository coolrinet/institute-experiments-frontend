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
import { deleteMachineryParameter } from '~/api/machinery-parameters/delete-machinery-parameter';
import { getMachineryParametersQueryOptions } from '~/api/machinery-parameters/get-machinery-parameters';
import { PARAMETER_TYPE_ITEMS, VALUE_TYPE_ITEMS } from '~/utils/consts';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';

export const Route = createFileRoute('/_auth/machinery-parameters/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
    name: z.string().optional().catch(''),
    parameterType: z.enum(['input', 'output']).optional(),
    valueType: z.enum(['quantitative', 'quality']).optional(),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(getMachineryParametersQueryOptions(deps)),
  component: MachineryParametersPage,
  pendingComponent: PageLoader,
});

function MachineryParametersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: machineryParameters, isFetching } = useSuspenseQuery(
    getMachineryParametersQueryOptions(search)
  );

  const { user } = useAuth();

  const totalPages = machineryParameters.meta!.last_page;

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

  const handleDelete = async (machineryParameterId: number) => {
    const machineryParameter = machineryParameters.data.find(
      machineryParameter => machineryParameter.id === machineryParameterId
    );

    if (machineryParameter?.user?.id !== user?.data.id) {
      notifications.show({
        title: 'Неудача',
        message: 'Нельзя удалить параметр, добавленный другим пользователем',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    const dialogResult = confirm('Вы действительно хотите удалить параметр?');

    if (!dialogResult) {
      return;
    }

    try {
      await deleteMachineryParameter(machineryParameterId);

      await queryClient.invalidateQueries({ queryKey: ['machinery-parameters'] });

      await router.invalidate();

      notifications.show({
        title: 'Успех',
        message: 'Параметр успешно удалён',
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

  const tableRows = machineryParameters.data.map(machineryParameter => {
    let userFullName = `${machineryParameter.user.lastName} ${machineryParameter.user.firstName[0]}.`;

    if (machineryParameter.user.middleName) {
      userFullName += ` ${machineryParameter.user.middleName[0]}.`;
    }

    return (
      <Table.Tr key={machineryParameter.id}>
        <Table.Td>{machineryParameter.name}</Table.Td>
        <Table.Td>{machineryParameter.parameterType === 'input' ? 'входной' : 'выходной'}</Table.Td>
        <Table.Td>
          {machineryParameter.valueType === 'quantitative' ? 'количественный' : 'качественный'}
        </Table.Td>
        <Table.Td>{machineryParameter.machinery?.name || '-'}</Table.Td>
        <Table.Td>{userFullName}</Table.Td>
        <Table.Td>
          <ActionIcon.Group>
            <ActionIcon
              renderRoot={props => (
                <Link
                  to='/machinery-parameters/$machineryParameterId/edit'
                  params={{ machineryParameterId: machineryParameter.id }}
                  {...props}
                />
              )}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon color='red' onClick={() => handleDelete(machineryParameter.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </ActionIcon.Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Stack>
      <Title>Список параметров установок</Title>
      <Box pos='relative'>
        <LoadingOverlay visible={isFetching} />
        <Card withBorder shadow='xl' padding='lg' radius='md'>
          <Card.Section inheritPadding withBorder py='md'>
            <Stack>
              <Group grow>
                <Select
                  label='Фильтр по типу параметра'
                  placeholder='Тип параметра'
                  clearable
                  data={PARAMETER_TYPE_ITEMS}
                  value={search.parameterType || null}
                  onChange={value => onParamChange('parameterType', value)}
                />
                <Select
                  label='Фильтр по типу значения'
                  placeholder='Тип значения'
                  clearable
                  data={VALUE_TYPE_ITEMS}
                  value={search.valueType || null}
                  onChange={value => onParamChange('valueType', value)}
                />
              </Group>
              <TextInput
                placeholder='Поиск по названию...'
                leftSection={<IconSearch size={16} />}
                leftSectionPointerEvents='none'
                defaultValue={search.name}
                onChange={event => handleSearchByName(event.currentTarget.value)}
              />
            </Stack>
          </Card.Section>
          {machineryParameters.data.length ? (
            <Table.ScrollContainer minWidth={500} mt='sm'>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Название</Table.Th>
                    <Table.Th>Тип параметра</Table.Th>
                    <Table.Th>Тип значения</Table.Th>
                    <Table.Th>Принадлежит к установке (прочерк = параметр общий)</Table.Th>
                    <Table.Th>Кем добавлен</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{tableRows}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <Text mt='sm'>Параметры установок отсутствуют</Text>
          )}
        </Card>
      </Box>
      <Group justify='space-between'>
        {totalPages && totalPages > 1 && (
          <Pagination value={search.page} total={totalPages} onChange={onPageChange} />
        )}
        <Button renderRoot={props => <Link to='/machinery-parameters/add' {...props} />}>
          Добавить параметр
        </Button>
      </Group>
    </Stack>
  );
}
