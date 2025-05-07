import React, { useState } from "react";
import { resourceVisuals } from "../create";
import type { ResourceNode } from "../create";

interface ResourceSlideoverProps {
  node: ResourceNode;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => void;
}

const ResourceSlideover: React.FC<ResourceSlideoverProps> = ({ node, onClose, onUpdate }) => {
  const [form, setForm] = useState(() => ({ ...node.data }));
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f: typeof form) => ({ ...f, [name]: value }));
  }
  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f: typeof form) => ({ ...f, [name]: Number(value) }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onUpdate(node.id, form);
    onClose();
  }
  type FieldDef = { name: string; label: string; type: string };
  let fields: FieldDef[] = [];
  if (node.type === "datacenter") {
    fields = [
      { name: "vmAllocationPolicy", label: "VM Allocation Policy", type: "text" },
      { name: "vmMigration", label: "VM Migration", type: "text" },
      { name: "costPerSec", label: "Cost Per Sec", type: "number" },
      { name: "costPerMem", label: "Cost Per Mem", type: "number" },
      { name: "costPerStorage", label: "Cost Per Storage", type: "number" },
      { name: "costPerBw", label: "Cost Per Bw", type: "number" },
    ];
  } else if (node.type === "host") {
    fields = [
      { name: "ram", label: "RAM", type: "number" },
      { name: "bw", label: "Bandwidth", type: "number" },
      { name: "storage", label: "Storage", type: "number" },
      { name: "pes", label: "PEs", type: "number" },
      { name: "mips", label: "MIPS", type: "number" },
      { name: "vmScheduler", label: "VM Scheduler", type: "text" },
      { name: "ramProvisioner", label: "RAM Provisioner", type: "text" },
      { name: "bwProvisioner", label: "BW Provisioner", type: "text" },
      { name: "peProvisioner", label: "PE Provisioner", type: "text" },
    ];
  } else if (node.type === "vm") {
    fields = [
      { name: "size", label: "Size", type: "number" },
      { name: "pes", label: "PEs", type: "number" },
      { name: "mips", label: "MIPS", type: "number" },
      { name: "ram", label: "RAM", type: "number" },
      { name: "bw", label: "Bandwidth", type: "number" },
      { name: "cloudletScheduler", label: "Cloudlet Scheduler", type: "text" },
      { name: "vmm", label: "VMM", type: "text" },
    ];
  } else if (node.type === "cloudlet") {
    fields = [
      { name: "pes", label: "PEs", type: "number" },
      { name: "length", label: "Length", type: "number" },
      { name: "fileSize", label: "File Size", type: "number" },
      { name: "outputSize", label: "Output Size", type: "number" },
      { name: "utilizationModelCpu", label: "Utilization Model CPU", type: "text" },
      { name: "utilizationModelRam", label: "Utilization Model RAM", type: "text" },
      { name: "utilizationModelBw", label: "Utilization Model BW", type: "text" },
    ];
  } else if (node.type === "san") {
    fields = [
      { name: "capacity", label: "Capacity", type: "number" },
      { name: "bandwidth", label: "Bandwidth", type: "number" },
      { name: "networkLatency", label: "Network Latency", type: "number" },
    ];
  }
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto h-full w-[400px] bg-zinc-900 shadow-xl p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-blue-300 flex items-center gap-2">
          <span className="text-2xl">{resourceVisuals[node.type].icon}</span>
          <span>Edit {resourceVisuals[node.type].label}</span>
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
          {fields.map((f, _i) => (
            <label key={f.name} className="flex flex-col gap-1 text-sm font-medium text-zinc-200">
              {f.label}
              <input
                name={f.name}
                type={f.type}
                value={(form as any)[f.name] ?? ""}
                onChange={f.type === "number" ? handleNumberChange : handleChange}
                className="bg-zinc-800 rounded px-2 py-1 text-zinc-100 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
          ))}
          <div className="flex-1" />
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-zinc-700 text-white hover:bg-zinc-600">Cancel</button>
            <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceSlideover; 