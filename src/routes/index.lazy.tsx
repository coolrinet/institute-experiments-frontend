import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createLazyFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Hello, World!</h1>
      <div>
        <p>Counter: {count}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setCount(prev => ++prev)}>Click me</button>
          <button onClick={() => setCount(0)}>Clear</button>
        </div>
      </div>
    </>
  );
}
