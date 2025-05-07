export class Host {
  amount: number;
  ram: number;
  bw: number;
  storage: number;
  pes: number;
  mips: number;
  vmScheduler: string;
  ramProvisioner: string;
  bwProvisioner: string;
  peProvisioner: string;

  constructor({
    amount = 1,
    ram = 1000000,
    bw = 100000,
    storage = 40000,
    pes = 4,
    mips = 50000,
    vmScheduler = "TimeShared",
    ramProvisioner = "Simple",
    bwProvisioner = "Simple",
    peProvisioner = "Simple",
  }: Partial<Host> = {}) {
    this.amount = amount;
    this.ram = ram;
    this.bw = bw;
    this.storage = storage;
    this.pes = pes;
    this.mips = mips;
    this.vmScheduler = vmScheduler;
    this.ramProvisioner = ramProvisioner;
    this.bwProvisioner = bwProvisioner;
    this.peProvisioner = peProvisioner;
  }
} 