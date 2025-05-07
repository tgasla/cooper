export class Vm {
  amount: number;
  size: number;
  pes: number;
  mips: number;
  ram: number;
  bw: number;
  cloudletScheduler: string;
  vmm: string;

  constructor({
    amount = 1,
    size = 500,
    pes = 4,
    mips = 1000,
    ram = 2000,
    bw = 1000,
    cloudletScheduler = "SpaceShared",
    vmm = "Xen",
  }: Partial<Vm> = {}) {
    this.amount = amount;
    this.size = size;
    this.pes = pes;
    this.mips = mips;
    this.ram = ram;
    this.bw = bw;
    this.cloudletScheduler = cloudletScheduler;
    this.vmm = vmm;
  }
} 