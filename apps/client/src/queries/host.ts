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
  simulationTime: number;
  cpuUtilization: number;
  ramUsage: number;
}
