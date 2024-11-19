import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { useHostQuery, Vm } from "../queries/host";
import { useSimulationQuery } from "../queries/simulation";
import { useTimeQuery } from "../queries/time";
import { cn } from "../lib";
import { motion } from "motion/react";
import { useDrag, usePinch } from "@use-gesture/react";

function Hosts({ simulationId }: { simulationId: string }) {
  const { data: hosts } = useHostQuery(simulationId);

  return (
    <ol className="flex gap-4">
      {hosts?.map((host, i) => (
        <li key={host.id} className="flex flex-col items-start">
          <span className="p-2 py-0 rounded-t-lg bg-zinc-400 text-white">
            Host {i + 1}
          </span>
          <div className="relative p-5 flex justify-start items-start border border-zinc-400">
            <Vms vms={host.vms} />
          </div>
        </li>
      ))}
    </ol>
  );
}

interface VmsProps {
  vms: Array<Vm>;
}

function Vms({ vms }: VmsProps) {
  return (
    <ol className="flex gap-4">
      {vms?.map((vm, i) => (
        <li key={vm.id} className="p-12 flex border border-black">
          VM {i}
        </li>
      ))}
    </ol>
  );
}

const nearest10 = (n: number) => Math.ceil(n / 10) * 10;

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

function Index() {
  const [secondSize, setSecondSize] = useState(50);
  const container = useRef<HTMLDivElement>(null);
  const { data: simulations } = useSimulationQuery();
  const [simulationId, setSimulationId] = useState<string>();
  const { data: times } = useTimeQuery(simulationId);
  const [currentTime, setCurrentTime] = useState<number>();
  const { data: hosts } = useHostQuery(simulationId);
  usePinch(
    (e) => {
      console.log(e);
    },
    {
      target: container,
    },
  );

  // useDrag(
  //   (state) => {
  //     console.log(state);
  //   },
  //   { target: container },
  // );

  useEffect(() => {
    if (!simulationId && simulations && simulations.length > 0) {
      setSimulationId(simulations[0].id);
    }
  }, [simulations, simulationId]);

  useEffect(() => {
    if (times && times.length > 0) {
      setCurrentTime(times[0].simulation_time_seconds);
    }
  }, [times, setCurrentTime]);

  if (
    !times ||
    times.length === 0 ||
    currentTime === undefined ||
    !hosts ||
    hosts.length === 0
  ) {
    return null;
  }

  const startTime = times[0];
  const endTime = times[times.length - 1];
  const end = nearest10(endTime.simulation_time_seconds);
  const delta =
    endTime.simulation_time_seconds - startTime.simulation_time_seconds;

  return (
    <div
      className="flex flex-col overflow-x-scroll max-w-screen relative"
      ref={container}
    >
      <div cn="flex gap-4">
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
      <div className="flex" style={{ width: secondSize * end }}>
        {new Array(end).fill(0).map((_, t) => (
          <Fragment key={t}>
            <motion.div
              key={t}
              initial={false}
              animate={{
                width: secondSize,
              }}
            >
              <span>{t + 1}</span>
            </motion.div>
            <div
              className="absolute w-[1px] h-full bg-black/10"
              style={{ left: secondSize * t }}
            ></div>
          </Fragment>
        ))}
      </div>
      <div className="from-yellow-400 to-yellow-500 from-red-400 to-red-500 from-blue-400 to-blue-500 from-green-500 to-green-500 from-purple-500 to-purple-500 border-red-600 border-yellow-600 border-blue-600 border-purple-600" />

      <div className="flex flex-col gap-3">
        {hosts.map((host) => (
          <>
            <TimelineBar
              key={host.id}
              width={
                existedFor(
                  host.start_time_seconds,
                  host.finish_time_seconds ?? end,
                ) * secondSize
              }
              label={host.cloudsim_id}
              color="yellow"
              startAt={host.start_time_seconds * secondSize}
            >
              <div className="flex flex-col gap-2"></div>
            </TimelineBar>
            {host.vms.map((vm) => {
              return (
                <TimelineBar
                  key={vm.id}
                  color="blue"
                  startAt={vm.start_time_seconds * secondSize}
                  width={
                    existedFor(
                      vm.start_time_seconds,
                      vm.finish_time_seconds ?? end,
                    ) * secondSize
                  }
                >
                  {vm.cloudsim_id}
                </TimelineBar>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

interface TimelineBarProps {
  width: number;
  label: string;
  children?: ReactNode;
  color: "yellow" | "blue" | "green" | "purple";
  startAt: number;
}

function TimelineBar({
  width,
  label,
  children,
  color,
  startAt,
}: TimelineBarProps) {
  //
  return (
    <motion.div
      className={cn(
        `flex flex-col bg-gradient-to-t from-${color}-400 to-${color}-500`,
        `min-h-12 rounded-lg border-${color}-600 border`,
        "flex relative text-white font-mono",
      )}
      initial={false}
      animate={{
        opacity: 1,
        width,
        marginLeft: startAt,
      }}
    >
      <span className="mx-2">{label}</span>
      <div>{children}</div>
    </motion.div>
  );
}

export default Index;
