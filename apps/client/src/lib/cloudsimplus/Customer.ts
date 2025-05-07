import { Vm } from "./Vm.ts";
import { Cloudlet } from "./Cloudlet.ts";

export class Customer {
  amount: number;
  vms: Vm[];
  cloudlets: Cloudlet[];

  constructor({
    amount = 2,
    vms = [new Vm({})],
    cloudlets = [new Cloudlet({})],
  }: Partial<Customer> = {}) {
    this.amount = amount;
    this.vms = vms;
    this.cloudlets = cloudlets;
  }
} 