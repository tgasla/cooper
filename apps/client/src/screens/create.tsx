import React, { useState, useRef, useCallback } from "react";
import Header from "../components/header";
import { Cloudlet } from "../lib/cloudsimplus/Cloudlet";
import { Datacenter } from "../lib/cloudsimplus/Datacenter";
import { Host } from "../lib/cloudsimplus/Host";
import { San } from "../lib/cloudsimplus/San";
import { Vm } from "../lib/cloudsimplus/Vm";
import ResourceCard from "./create/ResourceCard";
import ResourceSlideover from "./create/ResourceSlideover";
import ControlPanel from "./create/ControlPanel";

// --- Resource Definitions ---
const resources = {
  datacenter: Datacenter,
  host: Host,
  vm: Vm,
  cloudlet: Cloudlet,
  san: San,
} as const;

export const resourceVisuals: Record<
  keyof typeof resources,
  { icon: string; label: string; color: string }
> = {
  datacenter: { icon: "☁️", label: "Datacenter", color: "#60a5fa" }, // blue-400
  host: { icon: "🖥️", label: "Host", color: "#fbbf24" }, // amber-400
  vm: { icon: "🧮", label: "VM", color: "#818cf8" }, // indigo-400
  cloudlet: { icon: "📦", label: "Cloudlet", color: "#34d399" }, // emerald-400
  san: { icon: "💾", label: "SAN", color: "#f472b6" }, // pink-400
};

// --- Utility Functions ---
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// --- Resource Graph Types ---
export type ResourceType = keyof typeof resources;
type ResourceNodeBase<T = any> = {
  id: string;
  type: ResourceType;
  data: T;
  parentId?: string;
  children: string[];
};
export type ResourceNode = ResourceNodeBase<any>;

interface PlacedItem {
  id: string;
  x: number;
  y: number;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// --- Main Create Component ---
function Create() {
  // --- State ---
  const [selectedResource, setSelectedResource] =
    useState<ResourceType>("host");
  // resourceGraph: id -> node
  const [resourceGraph, setResourceGraph] = useState<
    Record<string, ResourceNode>
  >({});
  // placedItems: id, x, y
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [zoom, setZoom] = useState(1.0);
  const [slideover, setSlideover] = useState<{
    id: string;
    type: ResourceType;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Canvas Config ---
  const canvasWidth = 3000;
  const canvasHeight = 2000;
  const minZoom = 0.2;
  const maxZoom = 2.0;

  // --- Handlers ---
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (e.target !== e.currentTarget) return;
      if (selectedResource !== "datacenter" && selectedResource !== "vm")
        return;
      const rect = (e.target as HTMLDivElement).getBoundingClientRect();
      const x = (e.clientX - rect.left + e.currentTarget.scrollLeft) / zoom;
      const y = (e.clientY - rect.top + e.currentTarget.scrollTop) / zoom;
      const id = generateId();
      let node: ResourceNode;
      if (selectedResource === "datacenter") {
        node = {
          id,
          type: "datacenter",
          data: new Datacenter({}),
          children: [],
        };
      } else if (selectedResource === "vm") {
        node = { id, type: "vm", data: new Vm({}), children: [] };
      } else {
        return;
      }
      setResourceGraph((prev) => ({ ...prev, [id]: node }));
      setPlacedItems((prev) => [...prev, { id, x, y }]);
    },
    [selectedResource, zoom],
  );

  const handleAddToDatacenter = (
    datacenterId: string,
    type: "host" | "san",
  ) => {
    const id = generateId();
    let node: ResourceNode;
    if (type === "host") {
      node = {
        id,
        type: "host",
        data: new Host({}),
        parentId: datacenterId,
        children: [],
      };
    } else {
      node = {
        id,
        type: "san",
        data: new San({}),
        parentId: datacenterId,
        children: [],
      };
    }
    setResourceGraph((prev) => {
      const parent = prev[datacenterId];
      return {
        ...prev,
        [id]: node,
        [datacenterId]: {
          ...parent,
          children: [...parent.children, id],
        },
      };
    });
  };

  const handleAddCloudletToVm = (vmId: string) => {
    const id = generateId();
    const node: ResourceNode = {
      id,
      type: "cloudlet",
      data: new Cloudlet({}),
      parentId: vmId,
      children: [],
    };
    setResourceGraph((prev) => {
      const parent = prev[vmId];
      return {
        ...prev,
        [id]: node,
        [vmId]: {
          ...parent,
          children: [...parent.children, id],
        },
      };
    });
  };

  const handleOpenSlideover = (id: string, type: ResourceType) => {
    setSlideover({ id, type });
  };

  const handleUpdateResource = (id: string, updates: any) => {
    setResourceGraph((prev) => {
      const node = prev[id];
      if (!node) return prev;
      const ResourceClass = resources[node.type];
      return {
        ...prev,
        [id]: {
          ...node,
          data: new ResourceClass({ ...node.data, ...updates }),
        },
      };
    });
  };

  const recenter = useCallback(() => {
    if (!scrollRef.current || placedItems.length === 0) return;
    const avgX =
      placedItems.reduce((sum, i) => sum + i.x, 0) / placedItems.length;
    const avgY =
      placedItems.reduce((sum, i) => sum + i.y, 0) / placedItems.length;
    const container = scrollRef.current;
    const viewW = container.clientWidth;
    const viewH = container.clientHeight;
    container.scrollTo({
      left: clamp(avgX * zoom - viewW / 2, 0, canvasWidth * zoom - viewW),
      top: clamp(avgY * zoom - viewH / 2, 0, canvasHeight * zoom - viewH),
      behavior: "smooth",
    });
  }, [placedItems, zoom]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + container.scrollLeft;
        const mouseY = e.clientY - rect.top + container.scrollTop;
        const logicalX = mouseX / zoom;
        const logicalY = mouseY / zoom;
        let nextZoom = clamp(
          zoom * (e.deltaY > 0 ? 0.9 : 1.1),
          minZoom,
          maxZoom,
        );
        if (Math.abs(nextZoom - zoom) < 0.001) return;
        setZoom(nextZoom);
        requestAnimationFrame(() => {
          if (!scrollRef.current) return;
          const newScrollLeft = logicalX * nextZoom - (e.clientX - rect.left);
          const newScrollTop = logicalY * nextZoom - (e.clientY - rect.top);
          container.scrollTo({
            left: clamp(
              newScrollLeft,
              0,
              canvasWidth * nextZoom - container.clientWidth,
            ),
            top: clamp(
              newScrollTop,
              0,
              canvasHeight * nextZoom - container.clientHeight,
            ),
          });
        });
      }
    },
    [zoom],
  );

  const handleZoom = useCallback(
    (delta: number) => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const viewW = container.clientWidth;
      const viewH = container.clientHeight;
      const centerX = container.scrollLeft + viewW / 2;
      const centerY = container.scrollTop + viewH / 2;
      const logicalX = centerX / zoom;
      const logicalY = centerY / zoom;
      let nextZoom = clamp(zoom + delta, minZoom, maxZoom);
      setZoom(nextZoom);
      requestAnimationFrame(() => {
        if (!scrollRef.current) return;
        const newScrollLeft = logicalX * nextZoom - viewW / 2;
        const newScrollTop = logicalY * nextZoom - viewH / 2;
        container.scrollTo({
          left: clamp(newScrollLeft, 0, canvasWidth * nextZoom - viewW),
          top: clamp(newScrollTop, 0, canvasHeight * nextZoom - viewH),
        });
      });
    },
    [zoom],
  );

  // Render all resource cards
  const resourceCards = placedItems.map((item) => {
    const node = resourceGraph[item.id];
    if (!node) return null;
    return (
      <ResourceCard
        key={item.id}
        node={node}
        resourceGraph={resourceGraph}
        zoom={zoom}
        onOpenSlideover={handleOpenSlideover}
        onAddToDatacenter={handleAddToDatacenter}
        onAddCloudletToVm={handleAddCloudletToVm}
        x={item.x}
        y={item.y}
      />
    );
  });

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 w-screen relative">
        <ControlPanel
          selectedResource={selectedResource}
          setSelectedResource={setSelectedResource}
        />
        <div className="absolute left-48 top-4 z-20 flex gap-2">
          <button
            className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-sm shadow"
            onClick={recenter}
            style={{ minWidth: 120 }}
          >
            Recenter
          </button>
          <button
            className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-sm shadow"
            onClick={() => handleZoom(-0.1)}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="px-2 py-1 text-white text-sm select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white text-sm shadow"
            onClick={() => handleZoom(0.1)}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        <div
          ref={scrollRef}
          className="absolute inset-0 h-full w-full overflow-auto"
          style={{
            zIndex: 1,
            scrollbarWidth: "thin",
            scrollbarColor: "#444 #222",
          }}
          onWheel={handleWheel}
        >
          <div
            className="relative"
            style={{
              width: canvasWidth * zoom,
              height: canvasHeight * zoom,
              background:
                "radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)",
              backgroundSize: `${16 * zoom}px ${16 * zoom}px`,
              cursor: "crosshair",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
            onClick={handleCanvasClick}
          >
            {resourceCards}
          </div>
        </div>
        {slideover && resourceGraph[slideover.id] && (
          <ResourceSlideover
            node={resourceGraph[slideover.id]}
            onClose={() => setSlideover(null)}
            onUpdate={handleUpdateResource}
          />
        )}
        <style>{`
          /* Custom scrollbar for webkit browsers */
          .overflow-auto::-webkit-scrollbar {
            width: 8px;
            height: 8px;
            background: #222;
          }
          .overflow-auto::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 4px;
          }
          .overflow-auto::-webkit-scrollbar-corner {
            background: #222;
          }
        `}</style>
      </div>
    </div>
  );
}

export default Create;
