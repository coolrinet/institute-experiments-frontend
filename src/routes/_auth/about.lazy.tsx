import { Text, Title } from '@mantine/core';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_auth/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <Title>Hello from About!</Title>
      <Text>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vel hic, eius praesentium neque,
        dignissimos quia dolores eum deleniti quam molestias id voluptate asperiores ea recusandae
        unde tempora quod qui eveniet.
      </Text>
    </>
  );
}
