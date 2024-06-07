import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  LoadingOverlay,
  MultiSelect,
  Select,
  Stack,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { addResearch } from '~/api/research/add-research';
import { getUsersQueryOptions } from '~/api/users/get-users';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';

import { ApiErrorResponse, User } from '~/types/api';
import { ResearchData, researchSchema } from '~/types/schema';

export const Route = createFileRoute('/_auth/research/add')({
  component: AddResearchPage,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getMachineriesQueryOptions({}));
    context.queryClient.ensureQueryData(getUsersQueryOptions({}));
  },
  pendingComponent: PageLoader,
});

function AddResearchPage() {
  const router = useRouter();
  const navigate = Route.useNavigate();

  const { user } = useAuth();

  const { data: machineries, isFetching: isMachineriesFetching } = useSuspenseQuery(
    getMachineriesQueryOptions({})
  );
  const { data: users, isFetching: isUsersFetching } = useSuspenseQuery(getUsersQueryOptions({}));

  const prepareUsersForSelect = () =>
    users.data
      .filter(item => item.id !== user?.data.id)
      .map(item => ({
        value: item.id.toString(),
        label: getFullName(item),
      }));

  const { mutateAsync: addResearchMutation, isPending } = useMutation({
    mutationFn: addResearch,
    onSuccess: async () => {
      await router.invalidate();

      await navigate({ to: '/research' });

      notifications.show({
        title: 'Успех',
        message: 'Исследование успешно добавлено в систему',
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
    await addResearchMutation(data);
  };

  const getFullName = (user: User['data']) => {
    let result = `${user.lastName} ${user.firstName[0]}.`;

    if (user.middleName) {
      result += ` ${user.middleName[0]}.`;
    }

    return result;
  };

  const { handleSubmit, register, control, watch, formState } = useForm<ResearchData>({
    defaultValues: {
      name: '',
      description: '',
      isPublic: true,
      machineryId: NaN,
    },
    resolver: zodResolver(researchSchema),
  });
  const isPublicValue = watch('isPublic');

  return (
    <Stack align='center'>
      <Title>Добавить исследование</Title>

      <Box pos='relative'>
        <LoadingOverlay visible={isMachineriesFetching || isUsersFetching} />
        <Card withBorder maw={550} padding='xl' radius='md' shadow='xl'>
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
                    disabled={isPending}
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
                  Добавить
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Box>
    </Stack>
  );
}
