import {
  ActionIcon,
  Badge,
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
import { IconEye } from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getExperimentsQueryOptions } from '~/api/experiments/get-experiments';
import { getResearchQueryOptions } from '~/api/research/get-research';
import { getUserFullName } from '~/utils/get-user-full-name';

export const Route = createFileRoute('/_auth/research/$researchId/')({
  validateSearch: z.object({
    experimentsPage: z.number().optional().default(1),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, params, deps }) => {
    context.queryClient.ensureQueryData(getResearchQueryOptions(params.researchId));
    context.queryClient.ensureQueryData(
      getExperimentsQueryOptions(params.researchId, { page: deps.experimentsPage })
    );
  },
  component: ShowResearchPage,
});

function ShowResearchPage() {
  const { researchId } = Route.useParams();
  const { experimentsPage } = Route.useSearch();

  const navigate = Route.useNavigate();

  const { data: research, isFetching } = useSuspenseQuery(getResearchQueryOptions(researchId));

  const { data: experiments, isFetching: isFetchingExperiments } = useSuspenseQuery(
    getExperimentsQueryOptions(researchId, { page: experimentsPage })
  );

  const experimentsTotalPages = experiments.meta!.last_page;

  const handleShow = async (experimentId: number) => {
    await navigate({
      to: '/research/$researchId/experiments/$experimentId',
      params: { experimentId, researchId },
    });
  };

  const experimentTableRows = experiments.data.map(experiment => (
    <Table.Tr key={experiment.id}>
      <Table.Td>{experiment.name}</Table.Td>
      <Table.Td>{experiment.date}</Table.Td>
      <Table.Td>{getUserFullName(experiment.user)}</Table.Td>
      <Table.Td>
        <ActionIcon.Group>
          <ActionIcon color='teal' onClick={() => handleShow(experiment.id)}>
            <IconEye size={16} />
          </ActionIcon>
          {/* <ActionIcon onClick={() => handleEdit(item.id)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon color='red' onClick={() => handleDelete(item.id)}>
            <IconTrash size={16} />
          </ActionIcon> */}
        </ActionIcon.Group>
      </Table.Td>
    </Table.Tr>
  ));

  const onExperimentsPageChange = async (page: number) => {
    await navigate({ search: { experimentsPage: page } });
  };

  return (
    <Stack>
      <Title>Исследование №{researchId}</Title>
      <Box pos='relative' w='100%'>
        <LoadingOverlay visible={isFetching || isFetchingExperiments} />
        <Card withBorder w='100%' mx='auto' padding='xl' radius='md' shadow='xl'>
          <Card.Section withBorder inheritPadding py='md'>
            <Stack gap='xs'>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Название:
                </Text>{' '}
                {research.data.name}
              </Text>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Описание:
                </Text>{' '}
                {research.data.description}
              </Text>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Дата последнего эксперимента:
                </Text>{' '}
                {research.data.lastExperimentDate}
              </Text>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Установка:
                </Text>{' '}
                {research.data.machinery.name}
              </Text>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Автор исследования:
                </Text>{' '}
                {getUserFullName(research.data.author)}
              </Text>
              {!research.data.isPublic && (
                <Group>
                  <Text fw='bold' fs='italic'>
                    Участники:{' '}
                  </Text>
                  <Group gap='xs'>
                    {research.data.participants?.map(participant => (
                      <Badge key={participant.id}>{getUserFullName(participant)}</Badge>
                    ))}
                  </Group>
                </Group>
              )}
            </Stack>
          </Card.Section>
          <Stack mt='sm'>
            <Title order={2}>Эксперименты исследования</Title>
            {experiments.data.length > 0 ? (
              <Table.ScrollContainer minWidth={500}>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Название</Table.Th>
                      <Table.Th>Дата проведения</Table.Th>
                      <Table.Th>Кем добавлен</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{experimentTableRows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            ) : (
              <Text>Эксперименты отсутствуют</Text>
            )}
            <Group justify='space-between'>
              {experimentsTotalPages && experimentsTotalPages > 1 && (
                <Pagination
                  value={experimentsPage}
                  total={experimentsTotalPages}
                  onChange={onExperimentsPageChange}
                />
              )}
              <Button renderRoot={props => <Link to='/machinery-parameters/add' {...props} />}>
                Добавить эксперимент
              </Button>
            </Group>
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
}
