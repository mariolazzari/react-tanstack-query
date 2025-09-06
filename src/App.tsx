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
