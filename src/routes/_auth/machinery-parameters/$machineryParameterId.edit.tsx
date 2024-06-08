import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { editMachineryParameter } from '~/api/machinery-parameters/edit-machinery-parameter';
import { getMachineryParameterQueryOptions } from '~/api/machinery-parameters/get-machinery-parameter';
import { PARAMETER_TYPE_ITEMS, VALUE_TYPE_ITEMS } from '~/utils/consts';

import PageLoader from '~/components/Loader';

import { ApiErrorResponse } from '~/types/api';
import { MachineryParameterData, machineryParameterSchema } from '~/types/schema';

export const Route = createFileRoute('/_auth/machinery-parameters/$machineryParameterId/edit')({
  parseParams: ({ machineryParameterId }) => ({
    machineryParameterId: Number(machineryParameterId),
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(
      getMachineryParameterQueryOptions(params.machineryParameterId)
    );

    context.queryClient.ensureQueryData(getMachineriesQueryOptions({}));
  },
  component: EditMachineryParameterPage,
  pendingComponent: PageLoader,
});

function EditMachineryParameterPage() {
  const { machineryParameterId } = Route.useParams();
  const router = useRouter();
  const navigate = Route.useNavigate();

  const queryClient = useQueryClient();

  const { data: machineryParameter, isFetching: isMachineryParameterFetching } = useSuspenseQuery(
    getMachineryParameterQueryOptions(machineryParameterId)
  );

  const { data: machineries, isFetching: isMachineriesFetching } = useSuspenseQuery(
    getMachineriesQueryOptions({})
  );

  const { mutateAsync: editMachineryParameterMutation, isPending } = useMutation({
    mutationFn: (data: MachineryParameterData) =>
      editMachineryParameter(machineryParameterId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['machinery-parameter', machineryParameterId],
      });

      await router.invalidate();

      await navigate({ to: '/machinery-parameters', search: { page: 1 } });

      notifications.show({
        title: 'Успех',
        message: 'Параметр успешно изменен',
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

  const onSubmit = async (data: MachineryParameterData) => {
    await editMachineryParameterMutation(data);
  };

  const { handleSubmit, register, control, formState } = useForm<MachineryParameterData>({
    defaultValues: {
      name: machineryParameter.data.name,
      parameterType: machineryParameter.data.parameterType,
      valueType: machineryParameter.data.valueType,
      machineryId: machineryParameter.data.machinery?.id || null,
    },
    resolver: zodResolver(machineryParameterSchema),
  });

  return (
    <Stack align='center'>
      <Title ta='center'>Изменить параметр</Title>

      <Box pos='relative'>
        <LoadingOverlay visible={isMachineriesFetching || isMachineryParameterFetching} />

        <Card withBorder maw={550} padding='xl' radius='md' shadow='xl'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={20}>
              <TextInput
                {...register('name')}
                withAsterisk
                label='Название параметра'
                placeholder='Введите название параметра'
                type='text'
                description='Название параметра должно быть уникальным'
                disabled={isPending}
                error={formState.errors.name?.message}
              />

              <Controller
                name='parameterType'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    withAsterisk
                    label='Тип параметра'
                    placeholder='Выберите тип параметра'
                    data={PARAMETER_TYPE_ITEMS}
                    disabled={isPending}
                    error={formState.errors.parameterType?.message}
                  />
                )}
              />

              <Controller
                name='valueType'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    withAsterisk
                    label='Тип значения'
                    placeholder='Выберите тип значения параметра'
                    data={VALUE_TYPE_ITEMS}
                    disabled={isPending}
                    error={formState.errors.valueType?.message}
                  />
                )}
              />

              <Controller
                name='machineryId'
                control={control}
                render={({ field: { value, ...field } }) => (
                  <Select
                    {...field}
                    label='Установка'
                    description='Если не выбрана установка, параметр будет общим для всех установок'
                    placeholder='Выберите установку'
                    clearable
                    data={machineries.data.map(machinery => ({
                      value: machinery.id.toString(),
                      label: machinery.name,
                    }))}
                    disabled={isPending}
                    value={value?.toString()}
                    error={formState.errors.machineryId?.message}
                  />
                )}
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
                  Изменить
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Box>
    </Stack>
  );
}
