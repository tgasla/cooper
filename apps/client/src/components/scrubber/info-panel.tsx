import { Host, Vm, Cloudlet } from "../../queries/host";
// import { cn } from "../../lib";

type TimelineItem =
  | (Host & { type: "host" })
  | (Vm & { type: "vm" })
  | (Cloudlet & { type: "cloudlet" });

interface InfoPanelProps {
  item: TimelineItem | null;
  onItemSelect: (item: { type: "host" | "vm" | "cloudlet"; id: string } | null) => void;
}

interface Metric {
  simulationTime: number;
  cpuUtilization: number;
  ramUsage: number;
}

function formatTime(seconds: number) {
  if (seconds < 0) return "-1.0";
  return seconds.toFixed(1);
}

function MetricCard({ title, value, unit }: { title: string; value: number; unit: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-700/50">
      <span className="text-sm text-zinc-400">{title}</span>
      <span className="text-sm font-medium">{value.toFixed(1)} {unit}</span>
    </div>
  );
}

function TimeRangeCard({ start, end, execTime }: { start: number; end: number; execTime: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-2 border-b border-zinc-700/50">
        <span className="text-sm text-zinc-400">Start Time</span>
        <span className="text-sm font-medium">{formatTime(start)} seconds</span>
      </div>
      <div className="flex items-center justify-between py-2 border-b border-zinc-700/50">
        <span className="text-sm text-zinc-400">Finish Time</span>
        <span className="text-sm font-medium">{formatTime(end)} seconds</span>
      </div>
      <div className="flex items-center justify-between py-2 border-b border-zinc-700/50">
        <span className="text-sm text-zinc-400">Execution Time</span>
        <span className="text-sm font-medium">{formatTime(execTime)} seconds</span>
      </div>
    </div>
  );
}

function ResourceCard({ title, value, unit }: { title: string; value: number; unit: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-700/50">
      <span className="text-sm text-zinc-400">{title}</span>
      <span className="text-sm font-medium">
        {Number.isInteger(value) ? value : value.toFixed(1)} {unit}
      </span>
    </div>
  );
}

function InfoPanel({ item, onItemSelect }: InfoPanelProps) {
  if (!item) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        Select a resource to view details
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-1">
            {item.type === "host" && `Host ${item.id}`}
            {item.type === "vm" && `VM ${item.id}`}
            {item.type === "cloudlet" && `Cloudlet ${item.id}`}
          </h2>
          <div className="text-sm text-zinc-400">
            {item.type === "host" && "Physical machine hosting VMs"}
            {item.type === "vm" && "Virtual machine running cloudlets"}
            {item.type === "cloudlet" && "Computational task running on a VM"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {item.type === "host" && (
            <>
              <ResourceCard title="CPU Cores" value={item.numCpuCores} unit="cores" />
              <ResourceCard title="VMs" value={Object.keys(item.vms).length} unit="VMs" />
            </>
          )}
          {item.type === "vm" && (
            <>
              <ResourceCard title="CPU Cores" value={item.numCpuCores} unit="cores" />
              <ResourceCard title="Cloudlets" value={Object.keys(item.cloudlets).length} unit="cloudlets" />
            </>
          )}
          {item.type === "cloudlet" && (
            <>
              <ResourceCard title="CPU Cores" value={item.numCpuCores} unit="cores" />
              <ResourceCard title="Length" value={item.length} unit="MI" />
              <ResourceCard title="Finished Length" value={item.finishedLength} unit="MI" />
            </>
          )}
        </div>

        {item.type === "cloudlet" && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Time Information</h3>
            <TimeRangeCard
              start={item.startTime}
              end={item.finishTime}
              execTime={item.executionTime}
            />
          </div>
        )}

        {item.type !== "cloudlet" && item.metrics && item.metrics.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              {(item.metrics as Metric[]).map((metric, index) => (
                <div key={index} className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-2">Time: {formatTime(metric.simulationTime)}</div>
                  <div className="space-y-2">
                    <MetricCard
                      title="CPU Utilization"
                      value={metric.cpuUtilization}
                      unit="%"
                    />
                    <MetricCard
                      title="RAM Usage"
                      value={metric.ramUsage}
                      unit="MB"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.type === "host" && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Virtual Machines</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(item.vms).map(([id, vm]) => (
                <div
                  key={id}
                  className="bg-zinc-800/50 rounded-lg p-3 cursor-pointer hover:bg-zinc-800/80 transition-colors"
                  onClick={() => onItemSelect({ type: "vm", id })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">VM {vm.id}</div>
                      <div className="text-xs text-zinc-400">
                        {Object.keys(vm.cloudlets).length} cloudlets
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {formatTime(vm.startTimesSeconds[0])} - {formatTime(vm.endTimesSeconds[0] ?? 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.type === "vm" && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Cloudlets</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(item.cloudlets).map(([id, cloudlet]) => (
                <div
                  key={id}
                  className="bg-zinc-800/50 rounded-lg p-3 cursor-pointer hover:bg-zinc-800/80 transition-colors"
                  onClick={() => onItemSelect({ type: "cloudlet", id })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Cloudlet {cloudlet.id}</div>
                      <div className="text-xs text-zinc-400">
                        Length: {cloudlet.length} MI
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {formatTime(cloudlet.startTime)} - {formatTime(cloudlet.finishTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InfoPanel; 