import { useQuery } from "@tanstack/react-query";
import { Host } from "./host";

export interface Simulation {
  id: string;
  name: string;
  startedAt: string;
  hosts: Record<string, Host>;
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
