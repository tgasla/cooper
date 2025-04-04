import { useState } from "react";
import Header from "../components/header";
import Scrubber from "../components/scrubber";
import InfoPanel from "../components/scrubber/info-panel";
import useLocalStorage from "../hooks/use-local-storage";
import { Simulation } from "../queries/simulation";
import { Host, Vm, Cloudlet } from "../queries/host";

type TimelineItem =
  | (Host & { type: "host" })
  | (Vm & { type: "vm" })
  | (Cloudlet & { type: "cloudlet" });

function Index() {
  const [simulations, setSimulations] = useLocalStorage<Simulation[]>(
    "simulations",
    [],
  );
  const [prevSimulationId, setPrevSimulationId] = useLocalStorage<
    string | null
  >("prevSimulationId", null);
  const [selectedSimulation, setSelectedSimulation] = useState<
    Simulation | undefined
  >(simulations.find((sim) => sim.id === prevSimulationId));
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);

  const handleSetSelectedSimulation = (simulation: Simulation | undefined) => {
    setSelectedSimulation(simulation);
    setPrevSimulationId(simulation?.id ?? null);
    setSelectedItem(null);
  };

  const handleItemSelect = (
    item: { type: "host" | "vm" | "cloudlet"; id: string } | null,
  ) => {
    if (!selectedSimulation || !item) return;

    if (item.type === "host") {
      const host = selectedSimulation.hosts[item.id];
      setSelectedItem({ ...host, type: "host" as const });
    } else if (item.type === "vm") {
      for (const host of Object.values(selectedSimulation.hosts)) {
        const vm = host.vms[item.id];
        if (vm) {
          setSelectedItem({ ...vm, type: "vm" as const });
          break;
        }
      }
    } else if (item.type === "cloudlet") {
      for (const host of Object.values(selectedSimulation.hosts)) {
        for (const vm of Object.values(host.vms)) {
          const cloudlet = vm.cloudlets[item.id];
          if (cloudlet) {
            setSelectedItem({ ...cloudlet, type: "cloudlet" as const });
            break;
          }
        }
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 w-screen">
        <Sidebar
          simulations={simulations}
          setSimulations={setSimulations}
          selectedSimulation={selectedSimulation}
          setSelectedSimulation={handleSetSelectedSimulation}
        />

        {selectedSimulation && (
          <div
            className="flex flex-col h-full"
            style={{ width: "calc(100vw - 280px)" }}
          >
            <div className="h-full border-b border-zinc-700/50">
              <InfoPanel item={selectedItem} onItemSelect={handleItemSelect} />
            </div>
            <div className="flex-1">
              <Scrubber
                simulation={selectedSimulation}
                onItemSelect={handleItemSelect}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;

interface SidebarProps {
  simulations: Simulation[];
  setSimulations: (simulations: Simulation[]) => void;
  selectedSimulation: Simulation | undefined;
  setSelectedSimulation: (simulation: Simulation | undefined) => void;
}

function Sidebar({
  simulations,
  setSimulations,
  selectedSimulation,
  setSelectedSimulation,
}: SidebarProps) {
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const simulation = JSON.parse(content) as Simulation;
      setSimulations([...simulations, simulation]);
    } catch (error) {
      console.error("Failed to parse JSON file:", error);
    }
  };

  return (
    <div className="w-[280px] bg-zinc-900/50 h-full border-r border-zinc-800/60 flex flex-col overflow-y-auto">
      <div className="flex flex-col p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-zinc-300">Simulations</h2>
          <label className="inline-flex items-center justify-center h-7 px-3 text-xs font-medium bg-zinc-800/40 text-zinc-300 rounded-md cursor-pointer hover:bg-zinc-800/80 hover:text-zinc-100 transition-all border border-zinc-700/50 hover:border-zinc-700">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span>Upload</span>
          </label>
        </div>
      </div>

      <div className="flex-1 px-2">
        {simulations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-xs text-zinc-500">No simulations yet</p>
            <p className="text-xs text-zinc-600">
              Upload a JSON file to get started
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 py-1">
            {simulations.map((sim, index) => (
              <div
                key={sim.id || index}
                className="group px-3 py-2 rounded-md hover:bg-zinc-800/40 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedSimulation(sim);
                }}
              >
                <h3 className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">
                  {sim.name || `Simulation ${index + 1}`}
                </h3>
                <p className="text-xs text-zinc-500 group-hover:text-zinc-400">
                  {new Date(sim.startedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
