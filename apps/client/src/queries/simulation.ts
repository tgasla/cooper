import { Host } from "./host";

export interface Simulation {
  id: string;
  name: string;
  startedAt: string;
  duration: number;
  hosts: Record<string, Host>;
}
