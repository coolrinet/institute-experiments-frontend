import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createLazyFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Title>Hello, World!</Title>
      <Stack>
        <Text>Counter: {count}</Text>
        <Group>
          <Button onClick={() => setCount(prev => ++prev)}>Click me</Button>
          <Button onClick={() => setCount(0)}>Clear</Button>
        </Group>
      </Stack>
    </>
  );
}
