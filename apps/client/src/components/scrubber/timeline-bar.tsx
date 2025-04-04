import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib";

interface TimelineBarProps {
  width: number;
  children?: ReactNode;
  color: "yellow" | "blue" | "green" | "purple";
  startAt: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function TimelineBar({
  width,
  startAt,
  color,
  className,
  onClick,
  children,
}: TimelineBarProps & { children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{
        marginLeft: startAt,
        width,
      }}
      className={cn(
        "relative rounded-md cursor-pointer",
        color === "yellow" && "bg-amber-500/40",
        color === "blue" && "bg-indigo-500/40",
        color === "green" && "bg-emerald-500/40",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

export default TimelineBar;
