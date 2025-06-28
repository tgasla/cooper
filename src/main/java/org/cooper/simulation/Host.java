package org.cooper.simulation;

import java.util.ArrayList;
import java.util.HashMap;

import org.cloudsimplus.listeners.HostEventInfo;

import com.google.common.collect.Iterables;
import com.google.gson.annotations.SerializedName;

public class Host {

    @SerializedName("id")
    private final long cloudsimId;
    private final ArrayList<Double> startTimesSeconds = new ArrayList<>();
    private final ArrayList<Double> endTimesSeconds = new ArrayList<>();
    private final long numCpuCores;
    private final HashMap<Long, Vm> vms = new HashMap<>();

    public Host(org.cloudsimplus.hosts.Host host) {
        host.enableUtilizationStats();
        this.cloudsimId = host.getId();
        this.numCpuCores = host.getPesNumber();
        host.addOnShutdownListener(this::onHostShutdownListener);
        // Assuming a listener for VM creation exists
        host.getVmScheduler().addOnVmCreationListener(this::onVmCreationListener);
    }

    public void onHostShutdownListener(HostEventInfo event) {
        var host = event.getHost();

        if (host.getFinishTime() > 0) {
            Double lastFinishTime = Iterables.getLast(endTimesSeconds, null);
            if (lastFinishTime == null || lastFinishTime != host.getFinishTime()) {
                endTimesSeconds.add(host.getFinishTime());
            }
        }
    }

    // Listener for VM creation events
    public void onVmCreationListener(VmHostEventInfo event) {
        var cloudsimVm = event.getVm();
        if (!vms.containsKey(cloudsimVm.getId())) {
            addVm(cloudsimVm);
        }
    }

    public Vm addVm(org.cloudsimplus.vms.Vm cloudsimVm) {
        Vm vm = new Vm(cloudsimVm);
        vms.put(cloudsimVm.getId(), vm);
        // Record initial state of the VM
        // vm.record(cloudsimVm, cloudsimVm.getSimulation().clock());
        return vm;
    }

    public void record(org.cloudsimplus.hosts.Host host, Double time) {
        if (host.getStartTime() >= 0) {
            Double lastStartUpTime = Iterables.getLast(startTimesSeconds, null);
            if (lastStartUpTime == null || lastStartUpTime != host.getStartTime()) {
                startTimesSeconds.add(host.getStartTime());
            }
        }

        // VM recording is now event-driven, but we might still need to record VM states periodically
        // for VMs that don't generate events frequently.
        // For now, let's assume events cover all necessary updates.
        // If not, we can add back a modified iteration here.

        // Ensure all current VMs on the host are known and record them
        for (var cloudsimVmInstance : host.getVmList()) {
            // Note: cloudsimVmInstance.getId() is long, vms map expects Long as key if generic.
            // Assuming getCloudsimId() on our Vm returns long.
            Vm existingVm = this.vms.get(cloudsimVmInstance.getId());
            if (existingVm == null) {
                // This VM wasn't added by an event listener (or this is the first time), add it now.
                // The addVm method creates the Vm object, which attaches its own listeners.
                existingVm = this.addVm(cloudsimVmInstance);
            }
            // Now call record on our Vm object, passing the CloudSim Vm object.
            existingVm.record(cloudsimVmInstance, time);
        }
    }

    public long getCloudsimId() {
        return cloudsimId;
    }

    public ArrayList<Double> getStartTimes() {
        return startTimesSeconds;
    }

    public ArrayList<Double> getEndTimes() {
        return endTimesSeconds;
    }

    public HashMap<Long, Vm> getVms() {
        return vms;
    }

    public long getNumCpuCores() {
        return numCpuCores;
    }
}
