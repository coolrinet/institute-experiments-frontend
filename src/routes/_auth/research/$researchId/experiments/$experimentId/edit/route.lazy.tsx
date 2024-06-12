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
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { editExperiment } from '~/api/experiments/edit-experiment';
import { getExperimentQueryOptions } from '~/api/experiments/get-experiment';

import PageLoader from '~/components/Loader';

import { ApiErrorResponse } from '~/types/api';
import { ExperimentData, experimentSchema } from '~/types/schema';

export const Route = createLazyFileRoute(
  '/_auth/research/$researchId/experiments/$experimentId/edit'
)({
  component: EditExperimentPage,
  pendingComponent: PageLoader,
});

function EditExperimentPage() {
  const { researchId, experimentId } = Route.useParams();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: experiment, isFetching: isExperimentFetching } = useSuspenseQuery(
    getExperimentQueryOptions(researchId, experimentId)
  );

  const { mutateAsync: editExperimentMutation, isPending } = useMutation({
    mutationFn: (data: ExperimentData) => editExperiment(researchId, experimentId, data),
    onSuccess: async () => {
      await router.invalidate();

      await queryClient.invalidateQueries({ queryKey: ['experiments', researchId] });

      await queryClient.invalidateQueries({ queryKey: ['experiment', experimentId, researchId] });

      await queryClient.invalidateQueries({ queryKey: ['research', researchId] });

      await navigate({
        to: '/research/$researchId',
        params: { researchId },
        search: { experimentsPage: 1 },
      });

      notifications.show({
        title: 'Успех',
        message: 'Эксперимент успешно изменён',
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
    await editExperimentMutation(data);
  };

  console.log(experiment);

  const { handleSubmit, register, control, formState, trigger } = useForm<ExperimentData>({
    defaultValues: {
      name: experiment.data.name,
      date: dayjs(experiment.data.date, 'D MMMM YYYY', 'ru').toDate(),
      quantitativeInputs: experiment.data.quantitativeInputs.map(param => ({
        parameterId: param.parameterId,
        value: param.value,
      })),
      qualityInputs: experiment.data.qualityInputs.map(param => ({
        parameterId: param.parameterId,
        value: param.value,
      })),
      quantitativeOutputs: experiment.data.quantitativeOutputs.map(param => ({
        parameterId: param.parameterId,
        value: param.value,
      })),
      qualityOutputs: experiment.data.qualityOutputs.map(param => ({
        parameterId: param.parameterId,
        value: param.value,
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

  const [active, setActive] = useState(0);

  const handleStepChange = async (nextStep: number) => {
    const isFieldsValid = await trigger(formFields[active]);
    setActive(current => {
      if (!isFieldsValid) return current;
      return nextStep;
    });
  };

  const shouldAllowSelectStep = (step: number) => {
    return step >= 0 && step <= 2 && active !== step;
  };

  return (
    <Stack align='center'>
      <Title ta='center'>Изменить эксперимент</Title>
      <Box pos='relative' w='100%'>
        <LoadingOverlay visible={isExperimentFetching} />
        <Stack>
          <Card withBorder w='100%' mx='auto' padding='xl' radius='md' shadow='xl'>
            <Stepper active={active} onStepClick={handleStepChange}>
              <Stepper.Step
                lang='ru'
                label='Основные данные'
                allowStepSelect={shouldAllowSelectStep(0)}
              >
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

              <Stepper.Step
                lang='ru'
                label='Входные данные'
                allowStepSelect={shouldAllowSelectStep(1)}
              >
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
                          label={experiment.data.quantitativeInputs[index].name}
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
                          label={experiment.data.qualityInputs[index].name}
                          description='Качественный параметр'
                          placeholder='Введите значение параметра'
                          error={formState.errors.qualityInputs?.[index]?.value?.message}
                        />
                      )}
                    />
                  ))}
                </Stack>
              </Stepper.Step>

              <Stepper.Step
                lang='ru'
                label='Выходные данные'
                allowStepSelect={shouldAllowSelectStep(2)}
              >
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
                          label={experiment.data.quantitativeOutputs[index].name}
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
                          label={experiment.data.qualityOutputs[index].name}
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
              <Button variant='outline' color='red' onClick={() => router.history.back()}>
                Отменить создание
              </Button>
              <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
                Добавить эксперимент
              </Button>
            </Group>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
