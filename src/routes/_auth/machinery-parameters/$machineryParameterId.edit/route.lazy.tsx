import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Group, Select, Stack, TextInput, Title } from '@mantine/core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { PARAMETER_TYPE_ITEMS, VALUE_TYPE_ITEMS } from '~/utils/consts';

import PageLoader from '~/components/Loader';

import useMachineryParameter from '~/hooks/use-machinery-parameter';

import { MachineryParameterData, machineryParameterSchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_auth/machinery-parameters/$machineryParameterId/edit')({
  component: EditMachineryParameterPage,
  pendingComponent: PageLoader,
});

function EditMachineryParameterPage() {
  const { machineryParameterId } = Route.useParams();
  const router = useRouter();

  const { editMachineryParameter, machineryParameter, isMachineryParameterEditing } =
    useMachineryParameter(machineryParameterId);

  const { data: machineries } = useSuspenseQuery(getMachineriesQueryOptions({}));

  const onSubmit = (data: MachineryParameterData) => {
    editMachineryParameter(data);
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

      <Card withBorder w='100%' maw={550} mx='auto' padding='xl' radius='md' shadow='xl'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={20}>
            <TextInput
              {...register('name')}
              withAsterisk
              label='Название параметра'
              placeholder='Введите название параметра'
              type='text'
              description='Название параметра должно быть уникальным'
              disabled={isMachineryParameterEditing}
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
                  disabled={isMachineryParameterEditing}
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
                  disabled={isMachineryParameterEditing}
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
                  disabled={isMachineryParameterEditing}
                  value={value?.toString()}
                  error={formState.errors.machineryId?.message}
                />
              )}
            />

            <Group justify='flex-end'>
              <Button
                variant='outline'
                color='red'
                disabled={isMachineryParameterEditing}
                onClick={() => router.history.back()}
              >
                Отменить
              </Button>
              <Button
                type='submit'
                disabled={isMachineryParameterEditing}
                loading={isMachineryParameterEditing}
              >
                Изменить
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
