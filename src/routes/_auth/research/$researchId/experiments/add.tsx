import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  NumberInput,
  Stack,
  Stepper,
  TextInput,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { addExperiment } from '~/api/experiments/add-experiment';
import { getResearchQueryOptions } from '~/api/research/get-research';

import PageLoader from '~/components/Loader';

import { ApiErrorResponse, MachineryParameter } from '~/types/api';
import { ExperimentData, experimentSchema } from '~/types/schema';

export const Route = createFileRoute('/_auth/research/$researchId/experiments/add')({
  component: AddExperimentPage,
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(getResearchQueryOptions(params.researchId));
  },
  pendingComponent: PageLoader,
});

function AddExperimentPage() {
  const { researchId } = Route.useParams();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: research, isFetching: isResearchFetching } = useSuspenseQuery(
    getResearchQueryOptions(researchId)
  );

  const { mutateAsync: addExperimentMutation, isPending } = useMutation({
    mutationFn: (data: ExperimentData) => addExperiment(researchId, data),
    onSuccess: async () => {
      await router.invalidate();

      await queryClient.invalidateQueries({ queryKey: ['experiments', researchId] });

      await queryClient.invalidateQueries({ queryKey: ['research', researchId] });

      await navigate({
        to: '/research/$researchId',
        params: { researchId },
        search: { experimentsPage: 1 },
      });

      notifications.show({
        title: 'Успех',
        message: 'Эксперимент успешно добавлен в систему',
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

  const onSubmit = async (data: ExperimentData) => {
    await addExperimentMutation(data);
  };

  const filterByParameterType = (
    param: MachineryParameter['data'],
    parameterType: MachineryParameter['data']['parameterType']
  ) => param.parameterType === parameterType;

  const filterByValueType = (
    param: MachineryParameter['data'],
    valueType: MachineryParameter['data']['valueType']
  ) => param.valueType === valueType;

  const quantitativeInputs = research.data.parameters.filter(
    param => filterByParameterType(param, 'input') && filterByValueType(param, 'quantitative')
  );
  const qualityInputs = research.data.parameters.filter(
    param => filterByParameterType(param, 'input') && filterByValueType(param, 'quality')
  );
  const quantitativeOutputs = research.data.parameters.filter(
    param => filterByParameterType(param, 'output') && filterByValueType(param, 'quantitative')
  );
  const qualityOutputs = research.data.parameters.filter(
    param => filterByParameterType(param, 'output') && filterByValueType(param, 'quality')
  );

  const [active, setActive] = useState(0);

  const { handleSubmit, register, control, formState, trigger } = useForm<ExperimentData>({
    defaultValues: {
      name: '',
      date: new Date(),
      quantitativeInputs: quantitativeInputs.map(param => ({
        parameterId: param.id,
        value: NaN,
      })),
      qualityInputs: qualityInputs.map(param => ({
        parameterId: param.id,
        value: '',
      })),
      quantitativeOutputs: quantitativeOutputs.map(param => ({
        parameterId: param.id,
        value: NaN,
      })),
      qualityOutputs: qualityOutputs.map(param => ({
        parameterId: param.id,
        value: '',
      })),
    },
    mode: 'onChange',
    resolver: zodResolver(experimentSchema),
  });

  const { fields: quantitativeInputsFields } = useFieldArray({
    name: 'quantitativeInputs',
    control,
  });

  const { fields: qualityInputsFields } = useFieldArray({
    name: 'qualityInputs',
    control,
  });

  const { fields: quantitativeOutputsFields } = useFieldArray({
    name: 'quantitativeOutputs',
    control,
  });

  const { fields: qualityOutputsFields } = useFieldArray({
    name: 'qualityOutputs',
    control,
  });

  const formFields = [
    ['name', 'date'],
    ['quantitativeInputs', 'qualityInputs'],
    ['quantitativeOutputs', 'qualityOutputs'],
  ] as const;

  const nextStep = async () => {
    const isValid = await trigger(formFields[active]);

    setActive(current => {
      if (!isValid) return current;
      return current < 2 ? current + 1 : current;
    });
  };

  const prevStep = () => setActive(current => (current > 0 ? current - 1 : current));

  return (
    <Stack align='center'>
      <Title ta='center'>Добавить эксперимент</Title>
      <Box pos='relative' w='100%'>
        <LoadingOverlay visible={isResearchFetching} />
        <Stack>
          <Card withBorder w='100%' mx='auto' padding='xl' radius='md' shadow='xl'>
            <Stepper active={active}>
              <Stepper.Step lang='ru' label='Основные данные'>
                <Stack>
                  <TextInput
                    {...register('name')}
                    withAsterisk
                    label='Название эксперимента'
                    description='Название эксперимента должно быть уникальным'
                    placeholder='Введите название эксперимента'
                    error={formState.errors.name?.message}
                  />
                  <Controller
                    control={control}
                    name='date'
                    render={({ field }) => (
                      <DatePickerInput
                        {...field}
                        withAsterisk
                        label='Дата проведения эксперимента'
                        placeholder='Выберите дату проведения эксперимента'
                        valueFormat='D MMMM YYYY'
                        locale='ru'
                        clearable
                        error={formState.errors.date?.message}
                      />
                    )}
                  />
                </Stack>
              </Stepper.Step>

              <Stepper.Step lang='ru' label='Входные данные'>
                <Stack>
                  {quantitativeInputsFields.map((item, index) => (
                    <Controller
                      key={item.id}
                      control={control}
                      name={`quantitativeInputs.${index}.value`}
                      render={({ field }) => (
                        <NumberInput
                          {...field}
                          withAsterisk
                          label={quantitativeInputs[index].name}
                          description='Количественный параметр'
                          placeholder='Введите значение параметра'
                          hideControls
                          error={formState.errors.quantitativeInputs?.[index]?.value?.message}
                        />
                      )}
                    />
                  ))}

                  {qualityInputsFields.map((item, index) => (
                    <Controller
                      key={item.id}
                      control={control}
                      name={`qualityInputs.${index}.value`}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          withAsterisk
                          label={qualityInputs[index].name}
                          description='Качественный параметр'
                          placeholder='Введите значение параметра'
                          error={formState.errors.qualityInputs?.[index]?.value?.message}
                        />
                      )}
                    />
                  ))}
                </Stack>
              </Stepper.Step>

              <Stepper.Step lang='ru' label='Выходные данные'>
                <Stack>
                  {quantitativeOutputsFields.map((item, index) => (
                    <Controller
                      key={item.id}
                      control={control}
                      name={`quantitativeOutputs.${index}.value`}
                      render={({ field }) => (
                        <NumberInput
                          {...field}
                          withAsterisk
                          label={quantitativeOutputs[index].name}
                          description='Количественный параметр'
                          placeholder='Введите значение параметра'
                          hideControls
                          error={formState.errors.quantitativeOutputs?.[index]?.value?.message}
                        />
                      )}
                    />
                  ))}

                  {qualityOutputsFields.map((item, index) => (
                    <Controller
                      key={item.id}
                      control={control}
                      name={`qualityOutputs.${index}.value`}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          withAsterisk
                          label={qualityOutputs[index].name}
                          description='Качественный параметр'
                          placeholder='Введите значение параметра'
                          error={formState.errors.qualityOutputs?.[index]?.value?.message}
                        />
                      )}
                    />
                  ))}
                </Stack>
              </Stepper.Step>
            </Stepper>
            <Group justify='flex-end' mt='xl'>
              {active !== 0 ? (
                <Button variant='default' onClick={prevStep}>
                  Назад
                </Button>
              ) : (
                <Button variant='outline' color='red' onClick={() => router.history.back()}>
                  Отменить создание
                </Button>
              )}
              {active !== 2 ? (
                <Button onClick={nextStep}>След. шаг</Button>
              ) : (
                <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
                  Добавить эксперимент
                </Button>
              )}
            </Group>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
