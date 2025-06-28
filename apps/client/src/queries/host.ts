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
  numCpuCores: number;
  cloudlets: Record<string, Cloudlet>;
  metrics: Metric[];
}

export interface Cloudlet {
  id: number;
  startTime: number;
  finishTime: number;
  length: number;
  finishedLength: number;
  executionTime: number;
  numCpuCores: number;
  vmId: number;
}

export interface Metric {
  simulationTime: number;
  cpuUtilization: number;
  ramUsage: number;
}
