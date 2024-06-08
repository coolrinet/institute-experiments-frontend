import {
  ActionIcon,
  Box,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getExperimentQueryOptions } from '~/api/experiments/get-experiment';
import { getUserFullName } from '~/utils/get-user-full-name';

import PageLoader from '~/components/Loader';

export const Route = createFileRoute('/_auth/research/$researchId/experiments/$experimentId/')({
  parseParams: ({ experimentId }) => ({ experimentId: Number(experimentId) }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(
      getExperimentQueryOptions(params.researchId, params.experimentId)
    );
  },
  component: ExperimentPage,
  pendingComponent: PageLoader,
});

function ExperimentPage() {
  const { experimentId, researchId } = Route.useParams();
  const navigate = Route.useNavigate();

  const { data: experiment, isFetching } = useSuspenseQuery(
    getExperimentQueryOptions(researchId, experimentId)
  );

  const experimentInputsTableRows = [
    ...experiment.data.qualityInputs,
    ...experiment.data.quantitativeInputs,
  ].map(input => (
    <Table.Tr key={input.parameterId}>
      <Table.Td>{input.name}</Table.Td>
      <Table.Td>{input.value}</Table.Td>
    </Table.Tr>
  ));
  const experimentOutputsTableRows = [
    ...experiment.data.qualityOutputs,
    ...experiment.data.quantitativeOutputs,
  ].map(output => (
    <Table.Tr key={output.parameterId}>
      <Table.Td>{output.name}</Table.Td>
      <Table.Td>{output.value}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Group align='center'>
        <ActionIcon variant='subtle'>
          <IconArrowLeft
            onClick={() =>
              navigate({
                to: '/research/$researchId',
                params: { researchId },
                search: { experimentsPage: 1 },
              })
            }
          />
        </ActionIcon>
        <Title>Эксперимент №{experimentId}</Title>
      </Group>
      <Box pos='relative' w='100%'>
        <LoadingOverlay visible={isFetching} />
        <Card withBorder w='100%' mx='auto' padding='xl' radius='md' shadow='xl'>
          <Card.Section withBorder inheritPadding py='md'>
            <Stack gap='xs'>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Название:
                </Text>{' '}
                {experiment.data.name}
              </Text>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Дата эксперимента:
                </Text>{' '}
                {experiment.data.date}
              </Text>
              <Text>
                <Text span fw='bold' fs='italic'>
                  Автор исследования:
                </Text>{' '}
                {getUserFullName(experiment.data.user)}
              </Text>
            </Stack>
          </Card.Section>
          <Card.Section withBorder inheritPadding py='md'>
            <Stack gap='md'>
              <Text fw='bold' ta='center' fs='italic'>
                Входные параметры:
              </Text>
              <Table.ScrollContainer minWidth={350}>
                <Table withColumnBorders withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Название</Table.Th>
                      <Table.Th>Значение</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{experimentInputsTableRows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Stack>
          </Card.Section>
          <Card.Section withBorder inheritPadding py='md'>
            <Stack gap='md'>
              <Text fw='bold' ta='center' fs='italic'>
                Выходные параметры:
              </Text>
              <Table.ScrollContainer minWidth={350}>
                <Table withColumnBorders withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Название</Table.Th>
                      <Table.Th>Значение</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{experimentOutputsTableRows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Stack>
          </Card.Section>
        </Card>
      </Box>
    </Stack>
  );
}
