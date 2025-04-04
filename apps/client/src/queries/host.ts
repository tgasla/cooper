export interface Host {
  id: number;
  startTimesSeconds: number[];
  endTimesSeconds: number[];
  numberOfCpuCores: number;
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
