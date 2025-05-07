export class Cloudlet {
  amount: number;
  pes: number;
  length: number;
  fileSize: number;
  outputSize: number;
  utilizationModelCpu: string;
  utilizationModelRam: string;
  utilizationModelBw: string;

  constructor({
    amount = 1,
    pes = 2,
    length = 100,
    fileSize = 50,
    outputSize = 70,
    utilizationModelCpu = "Full",
    utilizationModelRam = "Full",
    utilizationModelBw = "Full",
  }: Partial<Cloudlet> = {}) {
    this.amount = amount;
    this.pes = pes;
    this.length = length;
    this.fileSize = fileSize;
    this.outputSize = outputSize;
    this.utilizationModelCpu = utilizationModelCpu;
    this.utilizationModelRam = utilizationModelRam;
    this.utilizationModelBw = utilizationModelBw;
  }
} 