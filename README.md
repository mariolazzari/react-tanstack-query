# TanStack Query: Efficient Data Fetching and State Management

## Working with TanStack

### Create project

```sh
pnpm create vite@latest
pnpm i
pnpm add @tanstack/react-query
```

### Install TanStack Query

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1>Github profile component</h1>
      </div>
    </QueryClientProvider>
  );
}

export default App;
```

### Sending a query

```tsx

```
