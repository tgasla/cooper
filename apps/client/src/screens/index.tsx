import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [simulations, setSimulations] = useLocalStorage<Simulation[]>(
    "simulations",
    [],
  );
  const [prevSimulationId, setPrevSimulationId] = useLocalStorage<
    string | null
  >("prevSimulationId", null);

  // Initialize selected simulation from URL or localStorage
  const [selectedSimulation, setSelectedSimulation] = useState<
    Simulation | undefined
  >(() => {
    const simulationId = searchParams.get("simulationId") || prevSimulationId;
    return simulations.find((sim) => sim.id === simulationId);
  });

  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);

  // Effect to handle URL parameters for both simulation and resource selection
  useEffect(() => {
    const simulationId = searchParams.get("simulationId");
    const type = searchParams.get("type") as "host" | "vm" | "cloudlet" | null;
    const id = searchParams.get("id");

    // Handle simulation selection from URL
    if (simulationId) {
      const sim = simulations.find((s) => s.id === simulationId);

      if (sim && sim !== selectedSimulation) {
        setSelectedSimulation(sim);
        setPrevSimulationId(sim.id);
      }
    } else {
      setSelectedSimulation(undefined);
      setPrevSimulationId(null);
    }

    // Handle resource selection from URL
    if (selectedSimulation && type && id) {
      handleItemSelect({ type, id });
    } else {
      setSelectedItem(null);
    }
  }, [searchParams, simulations]);

  const handleSetSelectedSimulation = (simulation: Simulation | undefined) => {
    setSelectedSimulation(simulation);
    setPrevSimulationId(simulation?.id ?? null);
    setSelectedItem(null);

    // Update URL parameters for simulation change
    if (simulation) {
      setSearchParams({ simulationId: simulation.id });
    } else {
      setSearchParams({});
    }
  };

  const handleItemSelect = (
    item: { type: "host" | "vm" | "cloudlet"; id: string } | null,
  ) => {
    if (!selectedSimulation || !item) {
      setSelectedItem(null);
      // Keep simulation ID in URL but remove resource params
      setSearchParams(
        selectedSimulation ? { simulationId: selectedSimulation.id } : {},
      );
      return;
    }

    // Update URL parameters preserving simulation ID
    setSearchParams({
      simulationId: selectedSimulation.id,
      type: item.type,
      id: item.id,
    });

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
      <div
        className="flex flex-1 w-screen"
        style={{ maxHeight: "calc(100vh - 3rem)" }}
      >
        <Sidebar
          simulations={simulations}
          setSimulations={setSimulations}
          selectedSimulation={selectedSimulation}
          setSelectedSimulation={handleSetSelectedSimulation}
        />
        {selectedSimulation && (
          <div
            className="flex flex-col max-h-full h-full overflow-y-auto"
            style={{ width: "calc(100vw - 280px)" }}
          >
            <div className="h-full border-b border-zinc-700/50">
              <InfoPanel item={selectedItem} onItemSelect={handleItemSelect} />
            </div>
            <Scrubber
              simulation={selectedSimulation}
              onItemSelect={handleItemSelect}
            />
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

interface UploadButtonProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

function UploadButton({ onFileUpload }: UploadButtonProps) {
  return (
    <label className="inline-flex items-center justify-center h-7 px-3 text-xs font-medium bg-zinc-800/40 text-zinc-300 rounded-md cursor-pointer hover:bg-zinc-800/80 hover:text-zinc-100 transition-all border border-zinc-700/50 hover:border-zinc-700">
      <input
        type="file"
        accept=".json"
        onChange={onFileUpload}
        className="hidden"
      />
      <span>Upload</span>
    </label>
  );
}

function NoSimulationsMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-32 text-center">
      <p className="text-xs text-zinc-500">No simulations yet</p>
      <p className="text-xs text-zinc-600">
        Upload a JSON file to get started.
      </p>
    </div>
  );
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
          <UploadButton onFileUpload={handleFileUpload} />
        </div>
      </div>

      <div className="flex-1 px-2">
        {simulations.length === 0 ? (
          <NoSimulationsMessage />
        ) : (
          <ul className="space-y-1">
            {simulations.map((simulation) => (
              <li key={simulation.id}>
                <button
                  onClick={() => setSelectedSimulation(simulation)}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded-md font-medium transition-all flex items-center justify-between 
                    ${selectedSimulation?.id === simulation.id ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200"}`}
                >
                  <span>{simulation.name}</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(simulation.startedAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
