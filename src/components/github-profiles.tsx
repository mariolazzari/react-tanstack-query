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
