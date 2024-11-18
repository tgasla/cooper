import { Fragment, useEffect, useRef, useState } from "react";
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

  useDrag(
    (state) => {
      console.log(state);
    },
    { target: container },
  );

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
      className="border flex flex-col overflow-x-scroll max-w-screen relative"
      ref={container}
    >
      <div>{startTime.simulation_time_seconds}</div>
      <div>{endTime.simulation_time_seconds}</div>
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

      <div className="flex flex-col gap-3">
        {hosts.map((host) => (
          <motion.div
            key={host.id}
            className={cn(
              "flex flex-col bg-gradient-to-t from-yellow-400 to-yellow-500",
              "h-12 rounded-lg border-yellow-600 border-1",
            )}
            initial={false}
            animate={{
              opacity: 1,
              width: width(15, secondSize),
            }}
          >
            {host.id}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Index;
