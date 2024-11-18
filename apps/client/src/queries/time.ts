import { useQuery } from "@tanstack/react-query";

export interface Time {
  id: string;
  simulation_id: string;
  simulation_time_seconds: number;
}

export function useTimeQuery(simulationId: string | undefined) {
  return useQuery({
    enabled: !!simulationId,
    queryKey: ["time"],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8080/time?simulation_id=eq.${simulationId}`,
      );

      const seen = new Set();

      const times = (await response.json()) as Array<Time>;

      return times.filter((time) => {
        if (seen.has(time.simulation_time_seconds)) {
          return false;
        }

        seen.add(time.simulation_time_seconds);
        return true;
      });
    },
  });
}
