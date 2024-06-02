import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <h1>Hello from About!</h1>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vel hic, eius praesentium neque,
        dignissimos quia dolores eum deleniti quam molestias id voluptate asperiores ea recusandae
        unde tempora quod qui eveniet.
      </p>
    </>
  );
}
