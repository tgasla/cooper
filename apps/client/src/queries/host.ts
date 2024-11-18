import { useQuery } from "@tanstack/react-query";

export interface Host {
  id: string;
  simulation_id: string;
  cloudsim_id: string;
  start_time_seconds: string;
  finish_time_seconds: string | null;
  vms: Vm[];
}

export interface Vm {
  id: string;
  host_id: string;
  cloudsim_id: number;
  simulation_id: string;
  start_time_seconds: number;
  finish_time_seconds: number | null;
  cloudlets: Cloudlet[];
}

export interface Cloudlet {
  id: string;
  vm_id: string;
  length: number;
  cloudsim_id: number;
  simulation_id: string;
  start_time_seconds: number;
  finish_time_seconds: number | null;
}

export function useHostQuery(simulationId: string | undefined) {
  return useQuery({
    enabled: !!simulationId,
    queryKey: ["hosts"],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8080/host?select=*,vms:vm(*,cloudlets:cloudlet(*))&simulation_id=eq.${simulationId}`,
      );
      return (await response.json()) as Array<Host>;
    },
  });
}
