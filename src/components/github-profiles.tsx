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
