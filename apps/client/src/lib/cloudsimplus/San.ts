export class San {
  capacity: number;
  bandwidth: number;
  networkLatency: number;
  amount: number;

  constructor({
    capacity = 10000,
    bandwidth = 10000,
    networkLatency = 5,
    amount = 1,
  }: Partial<San> = {}) {
    this.capacity = capacity;
    this.bandwidth = bandwidth;
    this.networkLatency = networkLatency;
    this.amount = amount;
  }
} 