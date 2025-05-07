export class San {
  capacity: number;
  bandwidth: number;
  networkLatency: number;

  constructor({
    capacity = 10000,
    bandwidth = 10000,
    networkLatency = 5,
  }: Partial<San> = {}) {
    this.capacity = capacity;
    this.bandwidth = bandwidth;
    this.networkLatency = networkLatency;
  }
} 