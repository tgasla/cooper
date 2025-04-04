import { Host } from "./host";

export interface Simulation {
  id: string;
  name: string;
  startedAt: string;
  simulationDuration: number;
  hosts: Record<string, Host>;
}
