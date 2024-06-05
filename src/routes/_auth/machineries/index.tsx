import {
  Box,
  Button,
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
import { IconSearch } from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/machineries/')({
  validateSearch: z.object({
    page: z.number().optional().catch(1),
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
  // const router = useRouter();

  const {
    data: machineries,
    isFetching,
    isPending,
  } = useSuspenseQuery(getMachineriesQueryOptions(search));

  const totalPages = machineries.meta?.last_page;

  const onPageChange = async (page: number) => {
    await navigate({ search: { ...search, page } });
  };

  const onMachineryNameChange = async (name: string) => {
    await navigate({ search: { ...search, name } });
  };

  const handleMachinerySearch = useDebouncedCallback(async (name: string) => {
    await onMachineryNameChange(name);
  }, 200);

  const tableRows = machineries.data.map(machinery => {
    let userFullName = `${machinery.user.lastName} ${machinery.user.firstName[0]}.`;

    if (machinery.user.middleName) {
      userFullName = `${userFullName} ${machinery.user.middleName[0]}.`;
    }

    return (
      <Table.Tr key={machinery.id}>
        <Table.Td>{machinery.name}</Table.Td>
        <Table.Td>{machinery.description}</Table.Td>
        <Table.Td>{userFullName}</Table.Td>
        {/* <Table.Td>
        <ActionIcon color='red' onClick={() => handleDelete(user.id)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td> */}
      </Table.Tr>
    );
  });

  return (
    <Stack>
      <Title>Список установок</Title>
      <TextInput
        placeholder='Поиск по названию...'
        leftSection={<IconSearch size={16} />}
        leftSectionPointerEvents='none'
        defaultValue={search.name}
        onChange={event => handleMachinerySearch(event.currentTarget.value)}
      />
      <Box pos='relative'>
        <LoadingOverlay visible={isFetching || isPending} />
        {machineries.data.length > 0 ? (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Название установки</Table.Th>
                <Table.Th>Описание</Table.Th>
                <Table.Th>Кем добавлена</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{tableRows}</Table.Tbody>
          </Table>
        ) : (
          <Text>Установки отсутствуют</Text>
        )}
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
