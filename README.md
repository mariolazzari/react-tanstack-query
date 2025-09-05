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
import { useQuery } from "@tanstack/react-query";
import type { Profile } from "../types/Profile";

export function GithubProfile() {
  const query = useQuery<Profile>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("https://api.github.com/users/mariolazzari");
      if (!res.ok) {
        throw new Error("Error fetchig user profile");
      }
      return res.json();
    },
  });

  if (isPending) {
    return <p>loading...</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  return (
    <div>
      <div>
        <img src={data.avatar_url} alt={data.login ?? ""} />
      </div>
      <div>
        <h2>{data.name}</h2>
        <p>{data.login}</p>
      </div>
    </div>
  );
}
```

### Parallel queries

```tsx
import { useQuery } from "@tanstack/react-query";
import type { Profile } from "../types/Profile";

export function GithubProfile() {
  const query1 = useQuery<Profile>({
    queryKey: ["user", "mariolazzari"],
    queryFn: async () => {
      const res = await fetch("https://api.github.com/users/mariolazzari");
      if (!res.ok) {
        throw new Error("Error fetchig user profile");
      }
      return res.json();
    },
  });

  const query2 = useQuery<Profile>({
    queryKey: ["user", "tanstack"],
    queryFn: async () => {
      const res = await fetch("https://api.github.com/users/tanstack");
      if (!res.ok) {
        throw new Error("Error fetchig user profile");
      }
      return res.json();
    },
  });

  if (query1.isPending || query2.isPending) {
    return <p>loading...</p>;
  }

  if (query1.isError || query2.isError) {
    return <p>{query1.error?.message || query2.error?.message}</p>;
  }

  return (
    <div>
      <div>
        <div>
          <img src={query1.data.avatar_url} alt={query1.data.login ?? ""} />
        </div>
        <div>
          <h2>{query1.data.name}</h2>
          <p>{query1.data.login}</p>
        </div>
      </div>

      <div>
        <div>
          <img src={query2.data.avatar_url} alt={query2.data.login ?? ""} />
        </div>
        <div>
          <h2>{query2.data.name}</h2>
          <p>{query2.data.login}</p>
        </div>
      </div>
    </div>
  );
}
```

### useQueries

```tsx
import { useQueries } from "@tanstack/react-query";
import type { Profile } from "../types/Profile";

const fetchUser = async (user: string): Promise<Profile> => {
  const res = await fetch(`https://api.github.com/users/${user}`);
  if (!res.ok) {
    throw new Error("Error fetchig user profile");
  }
  return res.json();
};

export function GithubProfiles() {
  const users = useQueries({
    queries: ["mariolazzari", "tanstack"].map(user => ({
      queryKey: ["user", user],
      queryFn: () => fetchUser(user),
    })),
  });

  return <div>{JSON.stringify(users)}</div>;
}
```

### Query results

```tsx
import { useQueries } from "@tanstack/react-query";
import type { Profile } from "../types/Profile";

const fetchUser = async (user: string): Promise<Profile> => {
  const res = await fetch(`https://api.github.com/users/${user}`);
  if (!res.ok) {
    throw new Error("Error fetchig user profile");
  }
  return res.json();
};

type GithubProfilesProps = {
  usernames: string[];
};

export function GithubProfiles({ usernames }: GithubProfilesProps) {
  const users = useQueries({
    queries: usernames.map(user => ({
      queryKey: ["user", user],
      queryFn: () => fetchUser(user),
    })),
  });

  const isLoading = users.some(query => query.isLoading);
  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <div>
      {users.map(user => (
        <div key={user.data?.login}>
          <img src={user.data?.avatar_url} alt={user.data?.login} />
          <h2>{user.data?.login}</h2>
          <p>{user.data?.name}</p>
        </div>
      ))}
    </div>
  );
}
```

## Customizing queries

### Server and client state

```tsx
import { useQueries } from "@tanstack/react-query";
import type { Profile } from "../types/Profile";
import { useState } from "react";
import type { Favorite } from "../types/Favorite";

const fetchUser = async (user: string): Promise<Profile> => {
  const res = await fetch(`https://api.github.com/users/${user}`);
  if (!res.ok) {
    throw new Error("Error fetchig user profile");
  }
  return res.json();
};

type GithubProfilesProps = {
  usernames: string[];
};

export function GithubProfiles({ usernames }: GithubProfilesProps) {
  const [favs, setFavs] = useState<Favorite>({});

  const toggleFav = (username: string): void => {
    setFavs(prev => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  const users = useQueries({
    queries: usernames.map(user => ({
      queryKey: ["user", user],
      queryFn: () => fetchUser(user),
    })),
  });

  const isLoading = users.some(query => query.isLoading);
  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <div>
      {users.map(user => {
        if (!user.data) {
          return <p>No data...</p>;
        }

        return (
          <div key={user.data.login}>
            <img src={user.data.avatar_url} alt={user.data.login} />
            <h2>{user.data.login}</h2>
            <p>{user.data?.name}</p>
            <button onClick={() => toggleFav(user.data.login)}>
              {favs[user.data.login] ? "Fav" : "Add to Favs"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

### Updating client state

```ts
export type Favorite = Record<string, boolean>;
```

### CSS styling

```tsx

```
