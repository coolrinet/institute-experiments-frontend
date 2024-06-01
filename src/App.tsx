import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>Hello, World!</h1>
      <div>
        <p>Counter: {count}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setCount(prev => ++prev)}>Click me</button>
          <button onClick={() => setCount(0)}>Clear</button>
        </div>
      </div>
    </main>
  );
}

export default App;
