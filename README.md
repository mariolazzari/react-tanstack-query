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
import { GithubProfile } from "./components/github-profile";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GithubProfile />
    </QueryClientProvider>
  );
}

export default App;
```

### Sending a query

```tsx
import { useQuery } from "@tanstack/react-query";

export function GithubProfile() {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("https://api.github.com/users/mariolazzari");
      if (!res.ok) {
        throw new Error("Error fetchig user profile");
      }
      return res.json();
    },
  });

  console.log("mario:", query.data);

  return <div>GithubProfile</div>;
}
```

### Displaying data

```tsx

```
