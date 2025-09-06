# TanStack Query: Efficient Data Fetching and State Management

## Working with TanStack

[Documentation](https://tanstack.com/query/latest)

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

```css
.profiles-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.profile-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
```

### Query keys

```ts
const logCacheData = () => {
  const cacheData = queryClient.getQueriesData({
    queryKey: ["user"],
  });
  console.log(cacheData);
};
```

### Developer tools

```sh
pnpm add @tanstack/react-query-devtools
```

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { GithubProfiles } from "./components/github-profiles";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GithubProfiles
        usernames={["mariolazzari", "tanstack"]}
        queryClient={queryClient}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

### Nesting query keys

```tsx
import { useQueries, useQueryClient } from "@tanstack/react-query";
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

  const queryClient = useQueryClient();

  const toggleFav = (username: string): void => {
    setFavs(prev => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  const users = useQueries({
    queries: usernames.map(user => ({
      queryKey: ["github", "user", user],
      queryFn: () => fetchUser(user),
    })),
  });

  const refreshUsers = () => {
    queryClient.invalidateQueries({
      queryKey: ["github", "user"],
    });
  };

  const refreshUser = (user: string) => {
    queryClient.invalidateQueries({
      queryKey: ["github", user],
    });
  };

  const isLoading = users.some(query => query.isLoading);
  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <div className="profiles-container">
      <button onClick={refreshUsers}>Refresh users</button>
   
      {users.map(user => {
        if (!user.data) {
          return <p>No data...</p>;
        }

        return (
          <div key={user.data.login} className="profile-card">
            <img
              className="profile-avatar"
              src={user.data.avatar_url}
              alt={user.data.login}
            />
            <h2>{user.data.login}</h2>
            <p>{user.data?.name}</p>

            <div>
              <button onClick={() => toggleFav(user.data.login)}>
                {favs[user.data.login] ? "Fav" : "Add to Favs"}
              </button>
              <button onClick={() => refreshUser(user.data.login)}>
                Refresh
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Refetching data

[Defaults](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults)

## Mutations

### Working with mutations

[Documentation](https://tanstack.com/query/latest/docs/framework/react/guides/**mutations**)

```tsx
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "../types/Profile";
import { useState } from "react";
import type { Favorite, FavoriteData } from "../types/Favorite";

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

const saveFavorite = async (data: FavoriteData) => {
  await new Promise(resolve => {
    setTimeout(resolve, 500);
  });
  return data;
};

export function GithubProfiles({ usernames }: GithubProfilesProps) {
  const [favs, setFavs] = useState<Favorite>({});

  const queryClient = useQueryClient();

  const users = useQueries({
    queries: usernames.map(user => ({
      queryKey: ["github", "user", user],
      queryFn: () => fetchUser(user),
    })),
  });

  const refreshUsers = () => {
    queryClient.invalidateQueries({
      queryKey: ["github", "user"],
    });
  };

  const refreshUser = (user: string) => {
    queryClient.invalidateQueries({
      queryKey: ["github", user],
    });
  };

  const favMutation = useMutation({
    mutationFn: saveFavorite,
    onSuccess: data =>
      setFavs(prev => ({
        ...prev,
        [data.username]: data.isFavorite,
      })),
  });

  const toggleFav = (username: string): void => {
    favMutation.mutate({
      username,
      isFavorite: !favs[username],
    });
  };

  const isLoading = users.some(query => query.isLoading);
  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <div className="profiles-container">
      <button onClick={refreshUsers}>Refresh users</button>

      {users.map(user => {
        if (!user.data) {
          return <p>No data...</p>;
        }

        const username = user.data.login;
        const isFavorite = favs[username];
        const isPending =
          favMutation.isPending && favMutation.variables?.username === username;

        return (
          <div key={user.data.login} className="profile-card">
            <img
              className="profile-avatar"
              src={user.data.avatar_url}
              alt={user.data.login}
            />
            <h2>{user.data.login}</h2>
            <p>{user.data?.name}</p>

            <div>
              <button onClick={() => toggleFav(user.data.login)}>
                {isPending
                  ? "Saving..."
                  : isFavorite
                  ? "* Favorited"
                  : "* Add to Favorites"}
              </button>
              <button onClick={() => refreshUser(user.data.login)}>
                Refresh
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Errors handling

```tsx
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "../types/Profile";
import { useState } from "react";
import type { Favorite, FavoriteData } from "../types/Favorite";

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

const saveFavorite = async (data: FavoriteData) => {
  await new Promise(resolve => {
    setTimeout(resolve, 500);
  });

  if (Math.random() < 0.3) {
    throw new Error("Error saving status...");
  }

  return data;
};

export function GithubProfiles({ usernames }: GithubProfilesProps) {
  const [favs, setFavs] = useState<Favorite>({});
  const [error, setError] = useState("");

  const queryClient = useQueryClient();

  const users = useQueries({
    queries: usernames.map(user => ({
      queryKey: ["github", "user", user],
      queryFn: () => fetchUser(user),
    })),
  });

  const refreshUsers = () => {
    queryClient.invalidateQueries({
      queryKey: ["github", "user"],
    });
  };

  const refreshUser = (user: string) => {
    queryClient.invalidateQueries({
      queryKey: ["github", user],
    });
  };

  const favMutation = useMutation({
    mutationFn: saveFavorite,
    onSuccess: data => {
      setError("");
      setFavs(prev => ({
        ...prev,
        [data.username]: data.isFavorite,
      }));
    },
    onError: (err: Error) => {
      setError(err.message);
      console.error("Mutation failed:", err);
    },
  });

  const toggleFav = (username: string): void => {
    favMutation.mutate({
      username,
      isFavorite: !favs[username],
    });
  };

  const isLoading = users.some(query => query.isLoading);
  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <div className="profiles-container">
      <button onClick={refreshUsers}>Refresh users</button>

      {error && <h3>{error}</h3>}

      {users.map(user => {
        if (!user.data) {
          return <p>No data...</p>;
        }

        const username = user.data.login;
        const isFavorite = favs[username];
        const isPending =
          favMutation.isPending && favMutation.variables?.username === username;

        return (
          <div key={user.data.login} className="profile-card">
            <img
              className="profile-avatar"
              src={user.data.avatar_url}
              alt={user.data.login}
            />
            <h2>{user.data.login}</h2>
            <p>{user.data?.name}</p>

            <div>
              <button onClick={() => toggleFav(user.data.login)}>
                {isPending
                  ? "Saving..."
                  : isFavorite
                  ? "* Favorited"
                  : "* Add to Favorites"}
              </button>
              <button onClick={() => refreshUser(user.data.login)}>
                Refresh
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Optimistic UI

[Documentation](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

```tsx
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "../types/Profile";
import { useState } from "react";
import type { Favorite, FavoriteData } from "../types/Favorite";

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

const saveFavorite = async (data: FavoriteData) => {
  await new Promise(resolve => {
    setTimeout(resolve, 500);
  });

  if (Math.random() < 0.3) {
    throw new Error("Error saving status...");
  }

  return data;
};

export function GithubProfiles({ usernames }: GithubProfilesProps) {
  const [favs, setFavs] = useState<Favorite>({});

  const queryClient = useQueryClient();

  const users = useQueries({
    queries: usernames.map(user => ({
      queryKey: ["github", "user", user],
      queryFn: () => fetchUser(user),
    })),
  });

  const refreshUsers = () => {
    queryClient.invalidateQueries({
      queryKey: ["github", "user"],
    });
  };

  const refreshUser = (user: string) => {
    queryClient.invalidateQueries({
      queryKey: ["github", user],
    });
  };

  const favMutation = useMutation({
    mutationFn: saveFavorite,
    onMutate: async newFav => {
      const prevFavs = { ...favs };
      setFavs(prev => ({
        ...prev,
        [newFav.username]: newFav.isFavorite,
      }));
      return { prevFavs };
    },
    onError: (_err: Error, _newFav, ctx) => {
      if (ctx) {
        setFavs(ctx.prevFavs);
      }
    },
  });

  const toggleFav = (username: string): void => {
    favMutation.mutate({
      username,
      isFavorite: !favs[username],
    });
  };

  const isLoading = users.some(query => query.isLoading);
  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <div className="profiles-container">
      <button onClick={refreshUsers}>Refresh users</button>

      {users.map(user => {
        if (!user.data) {
          return <p>No data...</p>;
        }

        const username = user.data.login;
        const isFavorite = favs[username];

        return (
          <div key={user.data.login} className="profile-card">
            <img
              className="profile-avatar"
              src={user.data.avatar_url}
              alt={user.data.login}
            />
            <h2>{user.data.login}</h2>
            <p>{user.data?.name}</p>

            <div>
              <button onClick={() => toggleFav(user.data.login)}>
                {isFavorite ? "* Favorited" : "* Add to Favorites"}
              </button>
              <button onClick={() => refreshUser(user.data.login)}>
                Refresh
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Cache control

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { GithubProfiles } from "./components/github-profiles";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GithubProfiles usernames={["mariolazzari", "tanstack"]} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

### Fetching repo data

```tsx
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "../types/Profile";
import { useState } from "react";
import type { Favorite, FavoriteData } from "../types/Favorite";
import GithubRepos from "./github-repos";

const fetchUser = async (user: string): Promise<Profile> => {
  console.log("Users refreshed:", new Date().toLocaleTimeString());

  const res = await fetch(`https://api.github.com/users/${user}`);
  if (!res.ok) {
    throw new Error("Error fetchig user profile");
  }
  return res.json();
};

const fetchUserRepos = async (user: string) => {
  const res = await fetch(
    `https://api.github.com/users/${user}/repos?pre_page=3`
  );
  if (!res.ok) {
    throw new Error("Error fetchig user repos");
  }
  return res.json();
};

type GithubProfilesProps = {
  usernames: string[];
};

const saveFavorite = async (data: FavoriteData) => {
  await new Promise(resolve => {
    setTimeout(resolve, 500);
  });

  if (Math.random() < 0.3) {
    throw new Error("Error saving status...");
  }

  return data;
};

export function GithubProfiles({ usernames }: GithubProfilesProps) {
  const [favs, setFavs] = useState<Favorite>({});

  const queryClient = useQueryClient();

  const users = useQueries({
    queries: usernames.map(user => ({
      queryKey: ["github", "user", user],
      queryFn: () => fetchUser(user),
      staleTime: 30000,
    })),
  });

  const refreshUsers = () => {
    queryClient.invalidateQueries({
      queryKey: ["github", "user"],
    });
  };

  const refreshUser = (user: string) => {
    queryClient.invalidateQueries({
      queryKey: ["github", user],
    });
  };

  const favMutation = useMutation({
    mutationFn: saveFavorite,
    onMutate: async newFav => {
      const prevFavs = { ...favs };
      setFavs(prev => ({
        ...prev,
        [newFav.username]: newFav.isFavorite,
      }));
      return { prevFavs };
    },
    onError: (_err: Error, _newFav, ctx) => {
      if (ctx) {
        setFavs(ctx.prevFavs);
      }
    },
  });

  const toggleFav = (username: string): void => {
    favMutation.mutate({
      username,
      isFavorite: !favs[username],
    });
  };

  const isLoading = users.some(query => query.isLoading);
  if (isLoading) {
    return <p>loading...</p>;
  }

  return (
    <div className="profiles-container">
      <button onClick={refreshUsers}>Refresh users</button>

      {users.map(user => {
        if (!user.data) {
          return <p>No data...</p>;
        }

        const username = user.data.login;
        const isFavorite = favs[username];

        return (
          <div key={user.data.login} className="profile-card">
            <img
              className="profile-avatar"
              src={user.data.avatar_url}
              alt={user.data.login}
            />
            <h2>{user.data.login}</h2>
            <p>{user.data?.name}</p>

            <div>
              <button onClick={() => toggleFav(user.data.login)}>
                {isFavorite ? "* Favorited" : "* Add to Favorites"}
              </button>
              <button onClick={() => refreshUser(user.data.login)}>
                Refresh
              </button>

              <GithubRepos />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Render repositories data

```tsx
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Repository } from "../types/Repository";

type GithubReposProps = {
  username: string;
};

const fetchUserRepos = async (user: string): Promise<Repository[]> => {
  const res = await fetch(
    `https://api.github.com/users/${user}/repos?per_page=3`
  );
  if (!res.ok) {
    throw new Error("Error fetchig user repos");
  }
  return res.json();
};

export function GithubRepos({ username }: GithubReposProps) {
  const { data: repos = [], isLoading } = useQuery({
    queryKey: ["github", "repos", username],
    queryFn: () => fetchUserRepos(username),
  });

  if (isLoading) {
    return <p>Loading repos...</p>;
  }

  return (
    <ul>
      {repos.map(({ id, html_url, name }) => (
        <li key={id}>
          <a href={html_url}>{name}</a>
        </li>
      ))}
    </ul>
  );
}
```

### Pagination

```tsx
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Repository } from "../types/Repository";
import { useState } from "react";

type GithubReposProps = {
  username: string;
};

const fetchUserRepos = async (
  user: string,
  page = 1
): Promise<Repository[]> => {
  const res = await fetch(
    `https://api.github.com/users/${user}/repos?per_page=${3}&page=${page}`
  );
  if (!res.ok) {
    throw new Error("Error fetching user repos");
  }
  return res.json();
};

export function GithubRepos({ username }: GithubReposProps) {
  const [page, setPage] = useState(1);

  const { data: repos = [], isLoading } = useQuery({
    queryKey: ["github", "repos", username, page],
    queryFn: () => fetchUserRepos(username, page),
    placeholderData: keepPreviousData,
  });

  if (repos.length === 0) {
    return <p>No repository</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <ul>
        {repos.map(({ id, html_url, name }) => (
          <li key={id}>
            <a href={html_url} target="_blank" rel="noreferrer">
              {name}
            </a>
          </li>
        ))}
      </ul>
      <div>
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1 || isLoading}
        >
          Prev
        </button>
        <span>{page}</span>
        <button
          onClick={() => setPage(prev => prev + 1)}
          disabled={repos.length < 3 || isLoading}
        >
          Next
        </button>
      </div>
    </>
  );
}
```
