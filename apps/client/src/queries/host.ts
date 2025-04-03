import { useQuery } from "@tanstack/react-query";

export interface Host {
  id: number;
  startTimesSeconds: number[];
  endTimesSeconds: number[];
  numCpuCores: number;
  vms: Record<string, Vm>;
  metrics: Metric[];
}

export interface Vm {
  id: number;
  startTimesSeconds: number[];
  endTimesSeconds: number[];
  metrics: Metric[];
  cloudlets: Record<string, Cloudlet>;
}

export interface Cloudlet {
  id: number;
  startTime: number;
  finishTime: number;
  length: number;
  finishedLength: number;
  executionTime: number;
  vmId: number;
}

export interface Metric {
  // Add metric properties when they are defined in the JSON
  [key: string]: any;
}

export function useHostQuery(simulationId: string | undefined) {
  return useQuery({
    enabled: !!simulationId,
    queryKey: ["hosts"],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8080/host?order=id.desc&select=*,vms:vm(*,cloudlets:cloudlet(*))&simulation_id=eq.${simulationId}`,
      );
      return (await response.json()) as Array<Host>;
    },
  });
}
