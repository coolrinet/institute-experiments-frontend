import { Button, Card, Group, Select, Stack, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { addMachineryParameter } from '~/api/machinery-parameters/add-machinery-parameter';
import { PARAMETER_TYPE_ITEMS, VALUE_TYPE_ITEMS } from '~/utils/consts';

import PageLoader from '~/components/Loader';

import { ApiErrorResponse } from '~/types/api';
import { MachineryParameterData, machineryParameterSchema } from '~/types/schema';

export const Route = createFileRoute('/_auth/machinery-parameters/add')({
  component: AddMachineryParameterPage,
  loader: ({ context }) => context.queryClient.ensureQueryData(getMachineriesQueryOptions({})),
  pendingComponent: PageLoader,
});

function AddMachineryParameterPage() {
  const router = useRouter();
  const navigate = Route.useNavigate();

  const { data: machineries } = useSuspenseQuery(getMachineriesQueryOptions({}));

  const { isPending, mutateAsync: addMachineryParameterMutation } = useMutation({
    mutationFn: addMachineryParameter,
    onSuccess: async () => {
      await router.invalidate();

      await navigate({ to: '/machinery-parameters' });

      notifications.show({
        title: 'Успех',
        message: 'Установка успешно добавлена в систему',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    },
    onError: error => {
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
    },
  });

  const handleSubmit = async (data: MachineryParameterData) => {
    await addMachineryParameterMutation(data);
  };

  const form = useForm<MachineryParameterData>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      parameterType: 'input',
      valueType: 'quantitative',
      machineryId: null,
    },
    validate: zodResolver(machineryParameterSchema),
  });

  return (
    <Stack align='center'>
      <Title ta='center'>Добавить новый параметр</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Card withBorder maw={550} padding='xl' radius='md' shadow='xl'>
          <Stack gap={20}>
            <TextInput
              withAsterisk
              label='Название параметра'
              placeholder='Введите название параметра'
              type='text'
              description='Название параметра должно быть уникальным'
              disabled={isPending}
              key={form.key('name')}
              {...form.getInputProps('name')}
            />

            <Select
              withAsterisk
              label='Тип параметра'
              placeholder='Выберите тип параметра'
              data={PARAMETER_TYPE_ITEMS}
              key={form.key('parameterType')}
              {...form.getInputProps('parameterType')}
            />

            <Select
              withAsterisk
              label='Тип значения'
              placeholder='Выберите тип значения параметра'
              data={VALUE_TYPE_ITEMS}
              key={form.key('valueType')}
              {...form.getInputProps('valueType')}
            />

            <Select
              label='Установка'
              description='Если не выбрана установка, параметр будет общим для всех установок'
              placeholder='Выберите установку'
              clearable
              data={machineries.data.map(machinery => ({
                value: machinery.id.toString(),
                label: machinery.name,
              }))}
              key={form.key('machineryId')}
              {...form.getInputProps('machineryId')}
            />

            <Group justify='flex-end'>
              <Button
                variant='outline'
                color='red'
                disabled={isPending}
                onClick={() => router.history.back()}
              >
                Отменить
              </Button>
              <Button type='submit' disabled={isPending} loading={isPending}>
                Добавить
              </Button>
            </Group>
          </Stack>
        </Card>
      </form>
    </Stack>
  );
}
