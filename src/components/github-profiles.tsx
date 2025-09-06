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
