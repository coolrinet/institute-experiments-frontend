import {
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
import { IconSearch } from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getMachineryParametersQueryOptions } from '~/api/machinery-parameters/get-machinery-parameters';

import PageLoader from '~/components/Loader';

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

const parameterTypeItems = [
  { value: 'input', label: 'входной' },
  { value: 'output', label: 'выходной' },
];

const valueTypeItems = [
  { value: 'quantitative', label: 'количественный' },
  { value: 'quality', label: 'качественный' },
];

function MachineryParametersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: machineryParameters, isFetching } = useSuspenseQuery(
    getMachineryParametersQueryOptions(search)
  );

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
                  data={parameterTypeItems}
                  value={search.parameterType || null}
                  onChange={value => onParamChange('parameterType', value)}
                />
                <Select
                  label='Фильтр по типу значения'
                  placeholder='Тип значения'
                  clearable
                  data={valueTypeItems}
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
            <Table mt='sm'>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Название</Table.Th>
                  <Table.Th>Тип параметра</Table.Th>
                  <Table.Th>Тип значения</Table.Th>
                  <Table.Th>Принадлежит к установке (прочерк = параметр общий)</Table.Th>
                  <Table.Th>Кем добавлен</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{tableRows}</Table.Tbody>
            </Table>
          ) : (
            <Text mt='sm'>Параметры установок отсутствуют</Text>
          )}
        </Card>
      </Box>
      <Group justify='space-between'>
        {totalPages && totalPages > 1 && (
          <Pagination value={search.page} total={totalPages} onChange={onPageChange} />
        )}
        <Button>Добавить параметр</Button>
      </Group>
    </Stack>
  );
}
