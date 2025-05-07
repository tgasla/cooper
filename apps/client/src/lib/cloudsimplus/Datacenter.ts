import { San } from "./San.ts";
import { Host } from "./Host.ts";

export class Datacenter {
  amount: number;
  vmAllocationPolicy: string;
  vmMigration: string;
  costPerSec: number;
  costPerMem: number;
  costPerStorage: number;
  costPerBw: number;
  sans: San[];
  hosts: Host[];

  constructor({
    amount = 1,
    vmAllocationPolicy = "Simple",
    vmMigration = "enabled",
    costPerSec = 0.1,
    costPerMem = 0.05,
    costPerStorage = 0.001,
    costPerBw = 0.1,
    sans = [new San({ capacity: 10000, bandwidth: 10000, networkLatency: 5 })],
    hosts = [new Host({})],
  }: Partial<Datacenter> = {}) {
    this.amount = amount;
    this.vmAllocationPolicy = vmAllocationPolicy;
    this.vmMigration = vmMigration;
    this.costPerSec = costPerSec;
    this.costPerMem = costPerMem;
    this.costPerStorage = costPerStorage;
    this.costPerBw = costPerBw;
    this.sans = sans;
    this.hosts = hosts;
  }
} 