import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { getMachineriesQueryOptions } from '~/api/machineries/get-machineries';
import { getUsersQueryOptions } from '~/api/users/get-users';
import { getUserFullName } from '~/utils/get-user-full-name';

import PageLoader from '~/components/Loader';

import { useAuth } from '~/hooks/use-auth';
import useResearch from '~/hooks/use-research';

import { ResearchData, researchSchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_auth/research/$researchId/edit')({
  component: EditResearchPage,
  pendingComponent: PageLoader,
});

function EditResearchPage() {
  const { researchId } = Route.useParams();
  const router = useRouter();

  const { user } = useAuth();

  const { research, editResearch, isResearchEditing } = useResearch(researchId);

  const { data: machineries } = useSuspenseQuery(getMachineriesQueryOptions({}));
  const { data: users } = useSuspenseQuery(getUsersQueryOptions({}));

  const prepareUsersForSelect = () =>
    users.data
      .filter(item => item.id !== user?.data.id)
      .map(item => ({
        value: item.id.toString(),
        label: getUserFullName(item),
      }));

  const onSubmit = (data: ResearchData) => {
    editResearch(data);
  };

  const { handleSubmit, register, control, watch, formState, setValue } = useForm<ResearchData>({
    defaultValues: {
      name: research.data.name,
      description: research.data.description,
      isPublic: research.data.isPublic,
      machineryId: research.data.machinery.id,
    },
    resolver: zodResolver(researchSchema),
  });
  const isPublicValue = watch('isPublic');

  useEffect(() => {
    setValue(
      'participants',
      research.data.participants?.map(item => item.id)
    );
  }, [research, setValue]);

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
              disabled={isResearchEditing}
              error={formState.errors.name?.message}
            />

            <Textarea
              {...register('description')}
              label='Описание'
              placeholder='Введите описание исследования'
              autosize
              minRows={4}
              maxRows={6}
              disabled={isResearchEditing}
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
                  disabled={isResearchEditing || !research.data.experimentsCount}
                  value={isNaN(value) ? null : value?.toString()}
                  error={formState.errors.machineryId?.message}
                />
              )}
            />

            <Checkbox
              {...register('isPublic')}
              label='Сделать исследование публичным'
              disabled={isResearchEditing}
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
                  disabled={isResearchEditing || isPublicValue}
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
                disabled={isResearchEditing}
                onClick={() => router.history.back()}
              >
                Отменить
              </Button>
              <Button type='submit' disabled={isResearchEditing} loading={isResearchEditing}>
                Изменить
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
