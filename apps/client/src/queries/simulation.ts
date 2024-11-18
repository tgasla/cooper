import { useQuery } from "@tanstack/react-query";

export interface Simulation {
  id: string;
  name: string;
  started_at: string;
  ended_at: string | null;
}

export function useSimulationQuery() {
  return useQuery({
    queryKey: ["simulations"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8080/simulation");
      return (await response.json()) as Array<Simulation>;
    },
  });
}
