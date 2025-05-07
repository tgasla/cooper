import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./screens/index";

import "@fontsource/inter";
import Create from "./screens/create";

const queryClient = new QueryClient();

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <Providers>
      <div className="min-h-screen h-full min-w-screen bg-zinc-900 text-white">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<Create />} />
        </Routes>
      </div>
    </Providers>
  );
}

export default App;
