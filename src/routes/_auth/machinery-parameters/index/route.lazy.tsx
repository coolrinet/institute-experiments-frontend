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
import { IconEdit, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { Link, createLazyFileRoute } from '@tanstack/react-router';
import { PARAMETER_TYPE_ITEMS, VALUE_TYPE_ITEMS } from '~/utils/consts';
import { getUserFullName } from '~/utils/get-user-full-name';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';
import useMachineryParameters from '~/hooks/use-machinery-parameters';

export const Route = createLazyFileRoute('/_auth/machinery-parameters/')({
  component: MachineryParametersPage,
  pendingComponent: PageLoader,
});

function MachineryParametersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const {
    machineryParameters,
    deleteMachineryParameter,
    isMachineryParameterDeleting,
    isMachineryParametersFetching,
  } = useMachineryParameters(search);

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

  const handleDelete = (machineryParameterId: number) => {
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

    deleteMachineryParameter(machineryParameterId);
  };

  const tableRows = machineryParameters.data.map(machineryParameter => {
    return (
      <Table.Tr key={machineryParameter.id}>
        <Table.Td>{machineryParameter.name}</Table.Td>
        <Table.Td>{machineryParameter.parameterType === 'input' ? 'входной' : 'выходной'}</Table.Td>
        <Table.Td>
          {machineryParameter.valueType === 'quantitative' ? 'количественный' : 'качественный'}
        </Table.Td>
        <Table.Td>{machineryParameter.machinery?.name || '-'}</Table.Td>
        <Table.Td>{getUserFullName(machineryParameter.user)}</Table.Td>
        <Table.Td>
          <ActionIcon.Group>
            {machineryParameter.user.id === user?.data.id && (
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
            )}
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
        <LoadingOverlay visible={isMachineryParametersFetching || isMachineryParameterDeleting} />
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
