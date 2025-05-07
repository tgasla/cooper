import React from "react";
import { resourceVisuals } from "../create";
import type { ResourceNode, ResourceType } from "../create";

interface ResourceCardProps {
  node: ResourceNode;
  resourceGraph: Record<string, ResourceNode>;
  zoom: number;
  onOpenSlideover: (id: string, type: ResourceType) => void;
  onAddToDatacenter: (datacenterId: string, type: "host" | "san") => void;
  onAddCloudletToVm: (vmId: string) => void;
  x: number;
  y: number;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  node,
  resourceGraph,
  zoom,
  onOpenSlideover,
  onAddToDatacenter,
  onAddCloudletToVm,
  x,
  y,
}) => {
  const { icon, label, color } = resourceVisuals[node.type];
  const isDatacenter = node.type === "datacenter";
  const isVm = node.type === "vm";
  let children: JSX.Element[] = [];
  let hostCount = 0;
  let sanCount = 0;
  if (isDatacenter) {
    hostCount = node.children.filter(cid => resourceGraph[cid]?.type === "host").length;
    sanCount = node.children.filter(cid => resourceGraph[cid]?.type === "san").length;
    children = node.children
      .map((childId: string) => {
        const child = resourceGraph[childId];
        if (!child) return null;
        if (child.type === "host" || child.type === "san") {
          return (
            <div
              key={child.id}
              className={`m-2 bg-zinc-800 rounded-lg border-2 px-3 py-2 min-w-[100px] inline-block cursor-pointer`}
              style={{ borderColor: resourceVisuals[child.type].color }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSlideover(child.id, child.type);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{resourceVisuals[child.type].icon}</span>
              </div>
              <div className="font-semibold" style={{ color: resourceVisuals[child.type].color }}>
                {resourceVisuals[child.type].label}
              </div>
            </div>
          );
        }
        return null;
      })
      .filter(Boolean) as JSX.Element[];
  } else if (isVm) {
    children = [
      <div
        key="cloudlets"
        className="flex flex-wrap mt-1"
      >
        {node.children.map((cid: string) => {
          const c = resourceGraph[cid];
          if (!c || c.type !== "cloudlet") return null;
          return (
            <div
              key={c.id}
              className="bg-zinc-800 rounded-md border px-2 py-1 m-1 text-xs cursor-pointer inline-block"
              style={{ borderColor: resourceVisuals.cloudlet.color, color: resourceVisuals.cloudlet.color }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSlideover(c.id, c.type);
              }}
            >
              {resourceVisuals.cloudlet.icon} {resourceVisuals.cloudlet.label}
            </div>
          );
        })}
        <button
          className="ml-2 rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center"
          style={{ background: resourceVisuals.cloudlet.color, color: "#18181b" }}
          onClick={(e) => {
            e.stopPropagation();
            onAddCloudletToVm(node.id);
          }}
          title="Add Cloudlet"
        >
          +
        </button>
      </div>,
    ];
  }
  return (
    <div
      style={{
        position: "absolute",
        left: x * zoom,
        top: y * zoom,
        transform: "translate(-50%, -50%)",
        width: (isDatacenter ? 260 : 140) * zoom,
        minHeight: (isDatacenter ? 120 : 60) * zoom,
        borderColor: color,
        zIndex: 2,
      }}
      className={`bg-zinc-900 rounded-xl shadow-lg border-4 flex flex-col items-center justify-center select-none cursor-pointer p-4`}
      onClick={(e) => {
        e.stopPropagation();
        onOpenSlideover(node.id, node.type);
      }}
    >
      <div className="flex items-center w-full justify-between">
        <span
          className={isDatacenter ? "text-5xl mb-2 drop-shadow" : "text-2xl mb-1 drop-shadow"}
        >
          {icon}
        </span>
        {isDatacenter && (
          <>
            <button
              className="rounded-full w-8 h-8 text-lg font-bold flex items-center justify-center mr-1 shadow"
              style={{ background: resourceVisuals.host.color, color: "#18181b" }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToDatacenter(node.id, "host");
              }}
              title="Add Host"
            >
              {resourceVisuals.host.icon}
            </button>
            <button
              className="rounded-full w-8 h-8 text-lg font-bold flex items-center justify-center shadow"
              style={{ background: resourceVisuals.san.color, color: "#18181b" }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToDatacenter(node.id, "san");
              }}
              title="Add SAN"
            >
              {resourceVisuals.san.icon}
            </button>
          </>
        )}
      </div>
      <span
        className={isDatacenter ? "text-xl font-bold" : "text-sm font-bold"}
        style={{ color }}
      >
        {label}
      </span>
      {isDatacenter && (
        <>
          <span className="text-xs mb-1" style={{ color: "#fff9" }}>
            {node.data.vmAllocationPolicy} Policy
          </span>
          <span className="text-xs" style={{ color: "#fff7" }}>
            {hostCount} Hosts, {sanCount} SANs
          </span>
          <div className="w-full mt-2 flex flex-wrap">{children}</div>
        </>
      )}
      {isVm && children}
    </div>
  );
};

export default ResourceCard; 