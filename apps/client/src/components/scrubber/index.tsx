import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { useHostQuery, Vm } from "../../queries/host";
import { useSimulationQuery } from "../../queries/simulation";
import { useTimeQuery } from "../../queries/time";
import { cn } from "../../lib";
import {
  motion,
  useMotionValue,
  MotionValue,
  AnimatePresence,
} from "motion/react";
import { useDrag, useGesture, usePinch } from "@use-gesture/react";
import TimelineBar from "./timeline-bar";

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

function Scrubber() {
  const [simulationId, setSimulationId] = useState<string>();
  const { data: times } = useTimeQuery(simulationId);
  const { data: simulations } = useSimulationQuery();
  const { data: hosts } = useHostQuery(simulationId);

  const [currentTime, setCurrentTime] = useState(0);
  const [secondSize, setSecondSize] = useState(50);
  const container = useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue<number>(0);

  usePinch(
    (e) => {
      console.log(e);
    },
    {
      target: container,
    },
  );

  useGesture(
    {
      onMove: ({ xy: [x] }) => {
        cursorX.set(x);
        setCurrentTime(x / secondSize);
      },
    },
    { target: container, eventOptions: {} },
  );

  useEffect(() => {
    setCurrentTime(cursorX.get() / secondSize);
  }, [cursorX, secondSize]);

  useEffect(() => {
    if (!simulationId && simulations && simulations.length > 0) {
      setSimulationId(simulations[0].id);
    }
  }, [simulations, simulationId]);

  if (!times || times.length === 0 || !hosts || hosts.length === 0) {
    return null;
  }

  const startTime = times[0];
  const endTime = times[times.length - 1];
  const end = nearest10(endTime.simulation_time_seconds);
  const delta =
    endTime.simulation_time_seconds - startTime.simulation_time_seconds;

  const possibleNumberOfMarkersToRender =
    (container.current?.clientWidth ?? 1024) / secondSize;

  const markersToRender = () => {
    console.log(possibleNumberOfMarkersToRender);
    if (possibleNumberOfMarkersToRender < 12) {
      return 1;
    }

    if (possibleNumberOfMarkersToRender < 20) {
      return 2;
    }

    return 5;
  };

  const ignorable = markersToRender();

  return (
    <div className="overflow-visible">
      <div className="h-full w-6" />
      <div>
        <button
          className="border p-2"
          onClick={() => setSecondSize(secondSize + 10)}
        >
          Zoom in
        </button>
        <button
          className="border p-2"
          onClick={() => setSecondSize(secondSize - 10)}
        >
          Zoom out
        </button>
      </div>
      <p>Simulation Time (seconds)</p>
      <div
        className="bg-zinc-800 flex flex-col overflow-scroll max-h-[500px] max-w-screen relative"
        ref={container}
      >
        {/*<Cursor x={cursorX} currentTime={currentTime} />*/}
        <div className="ml-4 w-full">
          <div
            style={{ width: secondSize * (end + 1) * 2 }}
            className="z-20 flex items-center h-8 sticky top-0 bg-zinc-800 shadow-xl"
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
                      <span className="w-[1px] h-full bg-blue-400/50" />
                      <span className="">{secondsToDuration(t)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          {new Array((end + 1) * 2).fill(0).map((_, t) => (
            <motion.div
              key={t}
              initial={false}
              animate={{
                left: secondSize * t,
              }}
              className="ml-4 absolute w-[1px] h-full bg-white/10 z-10"
            />
          ))}
          <div className="flex flex-col gap-4 py-4">
            {hosts.map((host) => (
              <>
                <TimelineBar
                  key={host.id}
                  width={
                    existedFor(
                      host.start_time_seconds,
                      host.finish_time_seconds ??
                        endTime.simulation_time_seconds,
                    ) * secondSize
                  }
                  className="bg-gradient-to-t from-amber-400/20 bg-amber-500/40 border-amber-600 border"
                  startAt={host.start_time_seconds * secondSize}
                >
                  <span className="m-2">Host {host.cloudsim_id}</span>
                  <div className="flex flex-col gap-2">
                    {host.vms.map((vm, idx) => {
                      const vmStartTime = vm.start_time_seconds * secondSize;
                      return (
                        <TimelineBar
                          key={vm.id}
                          color="blue"
                          startAt={vmStartTime}
                          className="bg-gradient-to-t from-indigo-400/80 to-indigo-500/100 border-indigo-600 border"
                          width={
                            existedFor(
                              vm.start_time_seconds,
                              vm.finish_time_seconds ??
                                endTime.simulation_time_seconds,
                            ) *
                              secondSize -
                            2
                          }
                        >
                          <span className="m-2">VM {vm.cloudsim_id}</span>

                          {vm.cloudlets.map((cloudlet) => (
                            <motion.div
                              className="rounded bg-gradient-to-t from-cyan-500 to-cyan-400 flex"
                              initial={false}
                              animate={{
                                marginLeft:
                                  vmStartTime +
                                  cloudlet.start_time_seconds * secondSize,
                              }}
                            >
                              <span className="text-sm">
                                Cloudlet {cloudlet.cloudsim_id}
                              </span>
                            </motion.div>
                          ))}
                        </TimelineBar>
                      );
                    })}
                  </div>
                </TimelineBar>
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scrubber;
