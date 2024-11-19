import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib";

interface TimelineBarProps {
  width: number;
  children?: ReactNode;
  color: "yellow" | "blue" | "green" | "purple";
  startAt: number;
  className?: string;
}

function TimelineBar({
  width,
  children,
  color,
  startAt,
  className,
}: TimelineBarProps) {
  //
  return (
    <motion.div
      className={cn(
        `flex flex-col`,
        `min-h-12 rounded-lg`,
        "flex relative text-white font-mono",
        className,
      )}
      initial={false}
      animate={{
        opacity: 1,
        width,
        marginLeft: startAt,
      }}
    >
      <div>{children}</div>
    </motion.div>
  );
}
export default TimelineBar;
