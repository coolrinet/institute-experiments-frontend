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
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCheck, IconEdit, IconEye, IconTrash, IconX } from '@tabler/icons-react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { deleteExperiment } from '~/api/experiments/delete-experiment';
import { getExperimentsQueryOptions } from '~/api/experiments/get-experiments';
import { getResearchQueryOptions } from '~/api/research/get-research';
import { getUserFullName } from '~/utils/get-user-full-name';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';

export const Route = createLazyFileRoute('/_auth/research/$researchId/')({
  component: ShowResearchPage,
  pendingComponent: PageLoader,
});

function ShowResearchPage() {
  const { researchId } = Route.useParams();
  const { experimentsPage } = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: research, isFetching } = useSuspenseQuery(getResearchQueryOptions(researchId));

  const { data: experiments, isFetching: isFetchingExperiments } = useSuspenseQuery(
    getExperimentsQueryOptions(researchId, { page: experimentsPage })
  );

  const { user } = useAuth();

  const experimentsTotalPages = experiments.meta!.last_page;

  const handleShow = async (experimentId: number) => {
    await navigate({
      to: '/research/$researchId/experiments/$experimentId',
      params: { experimentId, researchId },
    });
  };

  const handleEdit = async (experimentId: number) => {
    await navigate({
      to: '/research/$researchId/experiments/$experimentId/edit',
      params: { experimentId, researchId },
    });
  };

  const handleDelete = async (experimentId: number) => {
    const experiment = experiments.data.find(item => item.id === experimentId);

    if (experiment?.user.id !== user?.data.id) {
      notifications.show({
        title: 'Неудача',
        message: 'Нельзя удалить эксперимент, созданный другим пользователем',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    const dialogResult = confirm('Вы действительно хотите удалить эксперимент?');

    if (!dialogResult) {
      return;
    }

    try {
      await deleteExperiment(researchId, experimentId);

      await queryClient.invalidateQueries({ queryKey: ['experiments'] });

      await queryClient.invalidateQueries({ queryKey: ['research', researchId] });

      await router.invalidate();

      notifications.show({
        title: 'Успех',
        message: 'Эксперимент успешно удалён',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });

      await navigate({ search: { experimentsPage: 1 } });
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
          {!research.data.isPublic && experiment.user.id === user?.data.id && (
            <>
              <ActionIcon onClick={() => handleEdit(experiment.id)}>
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon color='red' onClick={() => handleDelete(experiment.id)}>
                <IconTrash size={16} />
              </ActionIcon>
            </>
          )}
        </ActionIcon.Group>
      </Table.Td>
    </Table.Tr>
  ));

  const onExperimentsPageChange = async (page: number) => {
    await navigate({ search: { experimentsPage: page } });
  };

  return (
    <Stack>
      <Group align='center'>
        <ActionIcon variant='subtle'>
          <IconArrowLeft
            onClick={() =>
              navigate({
                to: '/research',
                search: { page: 1 },
              })
            }
          />
        </ActionIcon>
        <Title>Исследование №{researchId}</Title>
      </Group>
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
              {!research.data.isPublic && (
                <Button
                  renderRoot={props => (
                    <Link
                      {...props}
                      to='/research/$researchId/experiments/add'
                      params={{ researchId }}
                    />
                  )}
                >
                  Добавить эксперимент
                </Button>
              )}
            </Group>
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
}
