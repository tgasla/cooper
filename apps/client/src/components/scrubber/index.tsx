import { useRef, useState } from "react";
import { cn } from "../../lib";
import { motion, AnimatePresence } from "motion/react";
import { useGesture } from "@use-gesture/react";
import ResourceBar from "./resource-bar";
import { Simulation } from "../../queries/simulation";

const nearest10 = (n: number) => Math.ceil(n / 10) * 10;

function existedFor(start: number, finished: number) {
  return finished - start - 1;
}

function secondsToDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${minutes}:${remainingSeconds}`;
  }

  return `${minutes}:${remainingSeconds}`;
}

interface ScrubberHeaderProps {
  secondSize: number;
  setSecondSize: (size: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  toggleCollapseAll: () => void;
  collapsedItems: Set<string>;
}

function ScrubberHeader({
  secondSize,
  setSecondSize,
  setIsDragging,
  toggleCollapseAll,
  collapsedItems,
}: ScrubberHeaderProps) {
  return (
    <div className="h-[60px] flex items-center gap-4 px-4">
      <span className="text-sm text-gray-400">Zoom</span>
      <input
        type="range"
        min="20"
        max="200"
        value={secondSize}
        onChange={(e) => setSecondSize(Number(e.target.value))}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        className="w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-sm text-gray-400">{secondSize}px/s</span>
      <button
        onClick={toggleCollapseAll}
        className="px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors"
      >
        {collapsedItems.size === 0 ? "Collapse All" : "Expand All"}
      </button>
    </div>
  );
}

interface ResourceBarsProps {
  simulation: Simulation;
  handleItemClick: (type: "host" | "vm" | "cloudlet", id: string) => void;
  isDragging: boolean;
  collapsedItems: Set<string>;
  toggleCollapse: (type: "host" | "vm", id: string) => void;
  secondSize: number;
}

function ResourceBars({
  simulation,
  handleItemClick,
  isDragging,
  collapsedItems,
  toggleCollapse,
  secondSize,
}: ResourceBarsProps) {
  return Object.entries(simulation.hosts).map(([id, host]) => (
    <div key={host.id}>
      <ResourceBar
        key={host.id}
        width={
          existedFor(
            host.startTimesSeconds[0],
            host.endTimesSeconds[0] ?? simulation.duration,
          ) * secondSize
        }
        className="bg-gradient-to-t from-amber-400/20 bg-amber-500/40 border-amber-600 border"
        startAt={host.startTimesSeconds[0] * secondSize}
        color="yellow"
        onClick={(e: React.MouseEvent) => handleItemClick("host", id)}
      >
        <div className="flex items-center">
          {Object.keys(host.vms).length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse("host", host.id.toString());
              }}
              className="p-1 hover:bg-zinc-700/50 rounded"
            >
              <span
                className={cn(
                  "inline-block transition-transform duration-200",
                  collapsedItems.has(`host-${host.id}`)
                    ? "rotate-0"
                    : "rotate-90",
                )}
              >
                ▶
              </span>
            </button>
          )}
          <span className="m-2 sticky left-2">Host {host.id}</span>
        </div>
        {!collapsedItems.has(`host-${host.id}`) && (
          <div className="flex flex-col gap-2">
            {Object.entries(host.vms).map(([vmId, vm]) => {
              const vmStartTime = vm.startTimesSeconds[0] * secondSize;
              return (
                <ResourceBar
                  key={vm.id}
                  color="blue"
                  startAt={vmStartTime}
                  className="bg-gradient-to-t from-indigo-400/80 to-indigo-500/100 border-indigo-600 border"
                  width={
                    existedFor(
                      vm.startTimesSeconds[0],
                      vm.endTimesSeconds[0] ?? simulation.duration,
                    ) *
                      secondSize -
                    2
                  }
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleItemClick("vm", vmId);
                  }}
                >
                  <div className="flex items-center">
                    {Object.keys(vm.cloudlets).length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollapse("vm", vm.id.toString());
                        }}
                        className="p-1 hover:bg-zinc-700/50 rounded"
                      >
                        <span
                          className={cn(
                            "inline-block transition-transform duration-200",
                            collapsedItems.has(`vm-${vm.id}`)
                              ? "rotate-0"
                              : "rotate-90",
                          )}
                        >
                          ▶
                        </span>
                      </button>
                    )}
                    <span className="m-2 sticky left-2">VM {vm.id}</span>
                  </div>
                  {!collapsedItems.has(`vm-${vm.id}`) && (
                    <div className="flex flex-col gap-2">
                      {Object.entries(vm.cloudlets).map(
                        ([cloudletId, cloudlet]) => (
                          <motion.div
                            key={cloudlet.id}
                            className="rounded bg-gradient-to-t from-emerald-500 to-emerald-400 flex"
                            initial={false}
                            animate={{
                              marginLeft: cloudlet.startTime * secondSize,
                            }}
                            transition={{
                              duration: isDragging ? 0.1 : 0.3,
                              ease: "easeOut",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick("cloudlet", cloudletId);
                            }}
                          >
                            <span className="text-sm">
                              Cloudlet {cloudlet.id}
                            </span>
                          </motion.div>
                        ),
                      )}
                    </div>
                  )}
                </ResourceBar>
              );
            })}
          </div>
        )}
      </ResourceBar>
    </div>
  ));
}

interface SecondsLinesProps {
  secondSize: number;
  end: number;
  isDragging: boolean;
}

interface TimelineBarProps {
  container: React.RefObject<HTMLDivElement>;
  secondSize: number;
  end: number;
  contentRef: React.RefObject<HTMLDivElement>;
  isDragging: boolean;
  ignorable: number;
}

function TimelineBar({
  container,
  secondSize,
  end,
  contentRef,
  isDragging,
  ignorable,
}: TimelineBarProps) {
  return (
    <div className="relative" ref={contentRef}>
      <div
        style={{
          width: `max(${secondSize * (end + 1) + 100}px, calc(100vw- 16px))`,
        }}
        className="z-50 flex items-center h-8 bg-zinc-700 shadow-lg min-w-screen"
      >
        <div
          className="absolute inset-0 bg-zinc-700"
          style={{
            width: `${secondSize * (end + 1) + 100}px`,
          }}
        />
        {new Array(end + 1).fill(0).map((_, t) => (
          <motion.div
            key={t}
            initial={false}
            animate={{
              left: secondSize * t,
              width: secondSize,
            }}
            transition={{
              duration: isDragging ? 0.1 : 0.3,
              ease: "easeOut",
            }}
            className="z-50 absolute flex justify-start items-center"
          >
            <AnimatePresence>
              {t % ignorable === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: isDragging ? 0.1 : 0.3,
                    ease: "easeOut",
                  }}
                  className="flex items-center justify-start gap-2 h-8"
                >
                  <span className="w-1 h-1 -ml-0.5 rounded-full bg-white/50" />
                  <span className="">{secondsToDuration(t)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface ScrubberProps {
  simulation: Simulation;
  onItemSelect: (
    item: { type: "host" | "vm" | "cloudlet"; id: string } | null,
  ) => void;
}

function Scrubber({ simulation, onItemSelect }: ScrubberProps) {
  const [secondSize, setSecondSize] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const container = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGesture(
    {
      onPinch: ({ canceled, offset: [scaleOffset] }) => {
        if (canceled) return;

        const newScale = 25 * scaleOffset;
        setSecondSize(newScale);
      },
    },
    {
      target: container,
      eventOptions: { passive: false },
      pinch: { threshold: 0.1 },
    },
  );

  const endTime = simulation.duration;
  const end = nearest10(endTime);

  const possibleNumberOfMarkersToRender =
    (container.current?.clientWidth ?? 1024) / secondSize;

  const markersToRender = () => {
    if (possibleNumberOfMarkersToRender < 12) {
      return 1;
    }

    if (possibleNumberOfMarkersToRender < 20) {
      return 2;
    }

    if (possibleNumberOfMarkersToRender < 60) {
      return 5;
    }

    if (possibleNumberOfMarkersToRender < 120) {
      return 10;
    }

    return 20;
  };

  const ignorable = markersToRender();

  const handleItemClick = (type: "host" | "vm" | "cloudlet", id: string) => {
    onItemSelect({ type, id });
  };

  const toggleCollapse = (type: "host" | "vm", id: string) => {
    setCollapsedItems((prev) => {
      const next = new Set(prev);
      const fullId = `${type}-${id}`;
      if (next.has(fullId)) {
        next.delete(fullId);
      } else {
        next.add(fullId);
      }
      return next;
    });
  };

  const toggleCollapseAll = () => {
    setCollapsedItems((prev) => {
      if (prev.size === 0) {
        // Collapse all
        const allIds = new Set<string>();
        Object.keys(simulation.hosts).forEach((hostId) => {
          allIds.add(`host-${hostId}`);
          Object.keys(simulation.hosts[hostId].vms).forEach((vmId) => {
            allIds.add(`vm-${vmId}`);
          });
        });
        return allIds;
      } else {
        // Expand all
        return new Set();
      }
    });
  };

  return (
    <div className="h-full max-h-[50%] w-full flex">
      <div className="flex flex-col gap-4 relative z-20">
        <div className="z-30 bg-zinc-800">
          <ScrubberHeader
            secondSize={secondSize}
            setSecondSize={setSecondSize}
            setIsDragging={setIsDragging}
            toggleCollapseAll={toggleCollapseAll}
            collapsedItems={collapsedItems}
          />
        </div>
        <div
          className="bg-zinc-800 flex flex-col overflow-auto h-full w-full relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ maxWidth: `calc(100vw - 280px)` }}
          ref={container}
        >
          <div className="sticky top-0 z-30 bg-zinc-800">
            <TimelineBar
              container={container}
              secondSize={secondSize}
              end={end}
              contentRef={contentRef}
              isDragging={isDragging}
              ignorable={ignorable}
            />
          </div>
          <div className="pt-4 relative flex flex-col gap-4">
            <div className="absolute inset-0 pointer-events-none h-full">
              {new Array(end + 1).fill(0).map((_, t) => (
                <motion.div
                  key={t}
                  initial={false}
                  animate={{
                    left: secondSize * t,
                  }}
                  transition={{
                    duration: isDragging ? 0.1 : 0.3,
                    ease: "easeOut",
                  }}
                  className="absolute w-[1px] h-full bg-gradient-to-t from-white/5 to-white/10 z-10"
                />
              ))}
            </div>
            <ResourceBars
              simulation={simulation}
              handleItemClick={handleItemClick}
              isDragging={isDragging}
              collapsedItems={collapsedItems}
              toggleCollapse={toggleCollapse}
              secondSize={secondSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scrubber;
