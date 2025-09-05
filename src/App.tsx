import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { GithubProfiles } from "./components/github-profiles";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GithubProfiles usernames={["mariolazzari", "tanstack"]} />
    </QueryClientProvider>
  );
}

export default App;
