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
