import React from "react";
import type { ResourceType } from "../create";

interface ControlPanelProps {
  selectedResource: ResourceType;
  setSelectedResource: (r: ResourceType) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ selectedResource, setSelectedResource }) => {
  const allowed = ["datacenter", "vm"] as const;
  return (
    <div className="absolute flex flex-col z-10 top-0 left-0 p-2 gap-2">
      {allowed.map((key) => (
        <button
          onClick={() => setSelectedResource(key as ResourceType)}
          key={key}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-zinc-300 transition-colors ${selectedResource === key ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
        >
          <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
        </button>
      ))}
    </div>
  );
};

export default ControlPanel; 