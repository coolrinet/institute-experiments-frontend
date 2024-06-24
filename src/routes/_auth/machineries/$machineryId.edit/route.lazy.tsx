import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Group, Stack, TextInput, Textarea, Title } from '@mantine/core';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

import PageLoader from '~/components/Loader';

import useMachinery from '~/hooks/use-machinery';

import { MachineryData, machinerySchema } from '~/types/schema';

export const Route = createLazyFileRoute('/_auth/machineries/$machineryId/edit')({
  component: EditMachineryPage,
  pendingComponent: PageLoader,
});

function EditMachineryPage() {
  const { machineryId } = Route.useParams();
  const router = useRouter();

  const { editMachinery, isMachineryEditing, machinery } = useMachinery(machineryId);

  const { handleSubmit, register, formState } = useForm<MachineryData>({
    defaultValues: {
      name: machinery.data.name,
      description: machinery.data.description,
    },
    resolver: zodResolver(machinerySchema),
  });

  const onSubmit = (data: MachineryData) => {
    editMachinery(data);
  };

  return (
    <Stack align='center'>
      <Title ta='center'>Изменить данные установки</Title>

      <Card withBorder w='100%' maw={550} mx='auto' padding='xl' radius='md' shadow='xl'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={20}>
            <TextInput
              {...register('name')}
              withAsterisk
              label='Название установки'
              placeholder='Введите название установки'
              type='text'
              description='Название установки должно быть уникальным'
              disabled={isMachineryEditing}
              error={formState.errors.name?.message}
            />

            <Textarea
              {...register('description')}
              label='Описание'
              placeholder='Введите описание установки'
              autosize
              minRows={4}
              maxRows={6}
              disabled={isMachineryEditing}
              error={formState.errors.description?.message}
            />

            <Group justify='flex-end'>
              <Button
                variant='outline'
                color='red'
                disabled={isMachineryEditing}
                onClick={() => router.history.back()}
              >
                Отменить
              </Button>
              <Button type='submit' disabled={isMachineryEditing} loading={isMachineryEditing}>
                Изменить
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
