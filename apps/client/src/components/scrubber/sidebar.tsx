import { motion, AnimatePresence } from "motion/react";
import { Host, Vm, Cloudlet } from "../../queries/host";

type TimelineItem = 
  | (Host & { type: "host" })
  | (Vm & { type: "vm" })
  | (Cloudlet & { type: "cloudlet" });

interface SidebarProps {
  isOpen: boolean;
  selectedItem: TimelineItem | null;
  onClose: () => void;
}

function Sidebar({ isOpen, selectedItem, onClose }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed right-0 top-0 h-full w-96 bg-zinc-800 shadow-lg z-50 overflow-y-auto"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-700 rounded"
              >
                ✕
              </button>
            </div>
            
            {selectedItem && (
              <div className="space-y-4">
                {selectedItem.type === "host" && (
                  <>
                    <div>
                      <h3 className="font-semibold">Host Information</h3>
                      <p>ID: {selectedItem.id}</p>
                      <p>Start Times: {selectedItem.startTimesSeconds.join(", ")}s</p>
                      <p>End Times: {selectedItem.endTimesSeconds.join(", ")}s</p>
                      <p>CPU Cores: {selectedItem.numCpuCores}</p>
                      <p>Number of VMs: {Object.keys(selectedItem.vms).length}</p>
                    </div>
                  </>
                )}
                
                {selectedItem.type === "vm" && (
                  <>
                    <div>
                      <h3 className="font-semibold">VM Information</h3>
                      <p>ID: {selectedItem.id}</p>
                      <p>Start Times: {selectedItem.startTimesSeconds.join(", ")}s</p>
                      <p>End Times: {selectedItem.endTimesSeconds.join(", ")}s</p>
                      <p>Number of Cloudlets: {Object.keys(selectedItem.cloudlets).length}</p>
                    </div>
                  </>
                )}
                
                {selectedItem.type === "cloudlet" && (
                  <>
                    <div>
                      <h3 className="font-semibold">Cloudlet Information</h3>
                      <p>ID: {selectedItem.id}</p>
                      <p>Start Time: {selectedItem.startTime}s</p>
                      <p>Finish Time: {selectedItem.finishTime}s</p>
                      <p>Length: {selectedItem.length}</p>
                      <p>Finished Length: {selectedItem.finishedLength}</p>
                      <p>Execution Time: {selectedItem.executionTime}s</p>
                      <p>VM ID: {selectedItem.vmId}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Sidebar; 