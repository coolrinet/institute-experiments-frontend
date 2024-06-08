import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  LoadingOverlay,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { editResearch } from '~/api/research/edit-research';
import { getResearchQueryOptions } from '~/api/research/get-research';
import { getUsersQueryOptions } from '~/api/users/get-users';
import { getUserFullName } from '~/utils/get-user-full-name';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse } from '~/types/api';
import { ResearchData, researchSchema } from '~/types/schema';

export const Route = createFileRoute('/_auth/research/$researchId/edit')({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(getResearchQueryOptions(params.researchId));
    context.queryClient.ensureQueryData(getMachineriesQueryOptions({}));
    context.queryClient.ensureQueryData(getUsersQueryOptions({}));
  },
  component: EditResearchPage,
});

function EditResearchPage() {
  const { researchId } = Route.useParams();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { data: research, isFetching: isResearchFetching } = useSuspenseQuery(
    getResearchQueryOptions(researchId)
  );
  const { data: machineries, isFetching: isMachineriesFetching } = useSuspenseQuery(
    getMachineriesQueryOptions({})
  );
  const { data: users, isFetching: isUsersFetching } = useSuspenseQuery(getUsersQueryOptions({}));

  const prepareUsersForSelect = () =>
    users.data
      .filter(item => item.id !== user?.data.id)
      .map(item => ({
        value: item.id.toString(),
        label: getUserFullName(item),
      }));

  const { mutateAsync: editResearchMutation, isPending } = useMutation({
    mutationFn: (data: ResearchData) => editResearch(researchId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['research', researchId],
      });

      await router.invalidate();

      await navigate({ to: '/research', search: { page: 1 } });

      notifications.show({
        title: 'Успех',
        message: 'Исследование успешно изменено',
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

  const onSubmit = async (data: ResearchData) => {
    await editResearchMutation(data);
  };

  const { handleSubmit, register, control, watch, formState } = useForm<ResearchData>({
    defaultValues: {
      name: research.data.name,
      description: research.data.description,
      isPublic: research.data.isPublic,
      machineryId: research.data.machinery.id,
    },
    resolver: zodResolver(researchSchema),
  });
  const isPublicValue = watch('isPublic');

  return (
    <Stack align='center' gap={15}>
      <Title>Изменить данные исследования</Title>

      {!research.data.experimentsCount && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title='Внимание'
          color='orange'
          radius='md'
          maw={550}
        >
          <Text>
            Так как исследование уже содержит эксперименты, вы не можете изменить установку, на
            которой они проводились!
          </Text>
        </Alert>
      )}

      <Box pos='relative' w='100%'>
        <LoadingOverlay visible={isMachineriesFetching || isUsersFetching || isResearchFetching} />
        <Card withBorder w='100%' maw={550} mx='auto' padding='xl' radius='md' shadow='xl'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={20}>
              <TextInput
                {...register('name')}
                label='Название исследования'
                placeholder='Введите название исследования'
                description='Название исследования должно быть уникальным'
                withAsterisk
                type='text'
                disabled={isPending}
                error={formState.errors.name?.message}
              />

              <Textarea
                {...register('description')}
                label='Описание'
                placeholder='Введите описание исследования'
                autosize
                minRows={4}
                maxRows={6}
                disabled={isPending}
                error={formState.errors.description?.message}
              />

              <Controller
                name='machineryId'
                control={control}
                render={({ field: { value, ...field } }) => (
                  <Select
                    {...field}
                    label='Установка'
                    description='Общие параметры и параметры установки для исследования будут установлены автоматически'
                    placeholder='Выберите установку'
                    withAsterisk
                    clearable
                    data={machineries.data.map(machinery => ({
                      value: machinery.id.toString(),
                      label: machinery.name,
                    }))}
                    disabled={isPending || !research.data.experimentsCount}
                    value={isNaN(value) ? null : value?.toString()}
                    error={formState.errors.machineryId?.message}
                  />
                )}
              />

              <Checkbox
                {...register('isPublic')}
                label='Сделать исследование публичным'
                disabled={isPending}
                error={formState.errors.isPublic?.message}
              />

              <Controller
                name='participants'
                control={control}
                render={({ field: { value, ...field } }) => (
                  <MultiSelect
                    {...field}
                    label='Участники'
                    placeholder='Выберите участников'
                    data={prepareUsersForSelect()}
                    disabled={isPending || isPublicValue}
                    clearable
                    defaultValue={research.data.participants!.map(user => user.id.toString())}
                    value={value?.map(id => id.toString())}
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
