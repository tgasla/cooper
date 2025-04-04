import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib";
import { motion, MotionValue, AnimatePresence } from "motion/react";
import { useGesture } from "@use-gesture/react";
import TimelineBar from "./timeline-bar";
import { Simulation } from "../../queries/simulation";
import { Host, Vm, Cloudlet } from "../../queries/host";

const nearest10 = (n: number) => Math.ceil(n / 10) * 10;

function every(from: number, to: number, step: number) {
  const result = [];
  for (let i = from; i <= to; i += step) {
    result.push(i);
  }
  return result;
}

function every5(from: number, to: number) {
  const result = [];
  for (let i = from; i <= to; i += 5) {
    result.push(i);
  }
  return result;
}

function width(livedFor: number, secondSize = 50) {
  return `${(livedFor - 1) * secondSize}px`;
}

function shortName(uuid: string) {
  return uuid.slice(0, 7);
}

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

interface CursorProps {
  currentTime: number;
  x: MotionValue<number>;
}

function Cursor({ x, currentTime }: CursorProps) {
  return (
    <motion.div
      className="z-20 top-0 absolute h-full flex flex-col items-center"
      style={{ marginLeft: x }}
    >
      <motion.div className="w-[1px] bg-red-500 h-full"></motion.div>
      <div className="bg-white border flex absolute top-0 text-red-500">
        {currentTime.toFixed(1)}
      </div>
    </motion.div>
  );
}

interface ScrubberProps {
  simulation: Simulation;
  onItemSelect: (
    item: { type: "host" | "vm" | "cloudlet"; id: string } | null,
  ) => void;
}

function Scrubber({ simulation, onItemSelect }: ScrubberProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [secondSize, setSecondSize] = useState(50);
  const container = useRef<HTMLDivElement>(null);

  useGesture(
    {
      onPinch: ({ canceled, offset: [scaleOffset], distance }) => {
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

  return (
    <div className="h-[500px] w-full flex">
      <div className="flex-1 flex flex-col">
        <div className="h-[60px] flex items-center gap-4 px-4">
          <span className="text-sm text-gray-400">Zoom</span>
          <input
            type="range"
            min="20"
            max="200"
            value={secondSize}
            onChange={(e) => setSecondSize(Number(e.target.value))}
            className="w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-400">{secondSize}px/s</span>
        </div>
        <p>Simulation Time (seconds) ({secondSize})</p>
        <div
          className="bg-zinc-800 flex flex-col overflow-auto h-[440px] w-full relative"
          style={{ maxWidth: `calc(100vw - 280px)` }}
          ref={container}
        >
          <div className="ml-4">
            <div
              style={{
                width: `max(${secondSize * (end + 1) + 100}px, calc(100vw- 16px))`,
              }}
              className="z-20 flex items-center h-8 sticky top-0 bg-zinc-700 shadow-lg min-w-screen"
            >
              {new Array(end + 1).fill(0).map((_, t) => (
                <motion.div
                  key={t}
                  initial={false}
                  animate={{
                    left: secondSize * t,
                    width: secondSize,
                  }}
                  className="z-30 absolute flex justify-start items-center"
                >
                  <AnimatePresence>
                    {t % ignorable === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
            {new Array(end + 1).fill(0).map((_, t) => (
              <motion.div
                key={t}
                initial={false}
                animate={{
                  left: secondSize * t,
                }}
                className="ml-4 absolute w-[1px] h-full bg-gradient-to-t from-white/5 to-white/10 z-10"
              />
            ))}
            <div className="flex flex-col gap-4 py-4">
              {Object.entries(simulation.hosts).map(([id, host]) => (
                <div key={host.id}>
                  <TimelineBar
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
                    onClick={(e: React.MouseEvent) =>
                      handleItemClick("host", id)
                    }
                  >
                    <span className="m-2 sticky left-2">Host {host.id}</span>
                    <div className="flex flex-col gap-2">
                      {Object.entries(host.vms).map(([id, vm], idx) => {
                        const vmStartTime =
                          vm.startTimesSeconds[0] * secondSize;
                        return (
                          <TimelineBar
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
                              handleItemClick("vm", id);
                            }}
                          >
                            <span className="m-2 sticky left-2">
                              VM {vm.id}
                            </span>

                            {Object.entries(vm.cloudlets).map(
                              ([id, cloudlet]) => (
                                <motion.div
                                  key={id}
                                  className="rounded bg-gradient-to-t from-emerald-500 to-emerald-400 flex"
                                  initial={false}
                                  animate={{
                                    marginLeft:
                                      vmStartTime +
                                      cloudlet.startTime * secondSize,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemClick("cloudlet", id);
                                  }}
                                >
                                  <span className="text-sm">
                                    Cloudlet {cloudlet.id}
                                  </span>
                                </motion.div>
                              ),
                            )}
                          </TimelineBar>
                        );
                      })}
                    </div>
                  </TimelineBar>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scrubber;
