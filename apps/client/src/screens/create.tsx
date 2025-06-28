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
import yaml from "js-yaml";

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

// --- YAML Tag Helpers ---
// No custom types needed for tagWrap approach

function tagWrap(tag: string, obj: any) {
  // js-yaml 4.x does not have a built-in way to wrap with a tag, so we use a custom object
  return Object.assign(Object.create({}), obj, { __yamlTag: tag });
}

function replacer(_key: string, value: any) {
  if (value && value.__yamlTag) {
    // Remove the __yamlTag property for serialization
    const { __yamlTag, ...rest } = value;
    return rest;
  }
  return value;
}

function customYamlDump(obj: any) {
  // Use a custom replacer to remove __yamlTag
  let yamlStr = yaml.dump(obj, { lineWidth: 120, replacer });
  // Replace objects with __yamlTag with the correct tag
  yamlStr = yamlStr.replace(/__yamlTag: (\!\w+)/g, "");
  // Replace keys like '- __yamlTag: !datacenter' with '- !datacenter'
  yamlStr = yamlStr.replace(/- __yamlTag: (\!\w+)/g, "- $1");
  // Replace '- {key: value, ...}' with '- !tag\n  key: value ...' for our wrapped objects
  yamlStr = yamlStr.replace(/- (\!\w+)\n  /g, "- $1\n  ");
  // Replace '- !tag\n  key:' with '- !tag\n  key:' (no change, but ensures tag is on its own line)
  yamlStr = yamlStr.replace(/- (\!\w+)\n/g, "- $1\n");
  // Remove any empty __yamlTag lines
  yamlStr = yamlStr.replace(/^\s*__yamlTag: .*$\n?/gm, "");
  return yamlStr;
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
  const [yamlModal, setYamlModal] = useState(false);
  const [yamlText, setYamlText] = useState("");

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

  // --- YAML Export ---
  function resourceGraphToYamlStructure(resourceGraph: Record<string, ResourceNode>, placedItems: PlacedItem[]) {
    // Collect datacenters (root nodes of type datacenter)
    const datacenters = placedItems
      .map(item => resourceGraph[item.id])
      .filter(node => node && node.type === "datacenter")
      .map(dc => {
        const hosts = dc.children
          .map(cid => resourceGraph[cid])
          .filter(child => child && child.type === "host")
          .map(host => tagWrap("!host", { ...host.data }));
        const sans = dc.children
          .map(cid => resourceGraph[cid])
          .filter(child => child && child.type === "san")
          .map(san => tagWrap("!san", { ...san.data }));
        return tagWrap("!datacenter", {
          ...dc.data,
          hosts,
          sans
        });
      });
    // Collect VMs and Cloudlets for customers (root nodes of type vm, and their cloudlets)
    const vms = placedItems
      .map(item => resourceGraph[item.id])
      .filter(node => node && node.type === "vm")
      .map(vm => tagWrap("!vm", { ...vm.data }));
    const cloudlets = Object.values(resourceGraph)
      .filter(node => node.type === "cloudlet" && node.parentId && resourceGraph[node.parentId]?.type === "vm")
      .map(cloudlet => tagWrap("!cloudlet", { ...cloudlet.data }));
    // Only add a customer if there are vms or cloudlets
    const customers = (vms.length || cloudlets.length)
      ? [tagWrap("!customer", { vms, cloudlets })]
      : [];
    return {
      datacenters,
      customers
    };
  }

  function handleExportYaml() {
    const structure = resourceGraphToYamlStructure(resourceGraph, placedItems);
    const doc = customYamlDump(structure);
    setYamlText(doc);
    setYamlModal(true);
  }

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
            className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-white text-sm shadow"
            onClick={handleExportYaml}
            style={{ minWidth: 120 }}
          >
            Export YAML
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
        {yamlModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-zinc-900 rounded-lg shadow-xl p-6 w-[600px] max-w-full flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-blue-300">YAML Export</h3>
                <button className="text-zinc-400 hover:text-zinc-200" onClick={() => setYamlModal(false)}>✕</button>
              </div>
              <textarea
                className="w-full h-96 bg-zinc-800 text-zinc-100 rounded p-2 font-mono text-xs resize-none mb-4"
                value={yamlText}
                readOnly
              />
              <button
                className="self-end px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                onClick={() => {
                  const blob = new Blob([yamlText], { type: 'text/yaml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'scenario.yaml';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download YAML
              </button>
            </div>
          </div>
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
