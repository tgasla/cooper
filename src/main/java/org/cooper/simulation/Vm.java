package org.cooper.simulation;

import java.util.*;

import org.cloudsimplus.listeners.VmHostEventInfo;
import com.google.common.collect.Iterables;
import com.google.gson.annotations.SerializedName;

public class Vm {

    @SerializedName("id")
    private final long cloudsimId;
    private final List<Double> startTimesSeconds = new ArrayList<>(2);
    private final List<Double> endTimesSeconds = new ArrayList<>(2);
    private final Map<Long, Cloudlet> cloudlets = new HashMap<>();
    private final long numCpuCores;

    public Vm(final org.cloudsimplus.vms.Vm vm) {
        vm.addOnHostDeallocationListener(this::onVmFinishListener);
        this.cloudsimId = vm.getId();
        this.numCpuCores = vm.getPesNumber();
    }

    public void record(final org.cloudsimplus.vms.Vm vm) {
        double startTime = vm.getStartTime();
        if (startTime >= 0) {
            Double lastStartUpTime = Iterables.getLast(startTimesSeconds, null);
            if (lastStartUpTime == null || !lastStartUpTime.equals(startTime)) {
                startTimesSeconds.add(startTime);
            }
        }

        var scheduler = vm.getCloudletScheduler();
        if (scheduler == null) {
            return;
        }
        for (var cloudlet : scheduler.getCloudletSubmittedList()) {
            cloudlets.computeIfAbsent(cloudlet.getId(), id -> new Cloudlet(cloudlet))
                        .record(cloudlet);
        }
    }

    public void onVmFinishListener(final VmHostEventInfo event) {
        var vm = event.getVm();
        double finishTime = vm.getFinishTime();
        if (finishTime > 0) {
            Double lastFinishTime = Iterables.getLast(endTimesSeconds, null);
            if (lastFinishTime == null || !lastFinishTime.equals(finishTime)) {
                endTimesSeconds.add(finishTime);
            }
        }
        vm.removeOnHostDeallocationListener(this::onVmFinishListener);
    }

    public long getCloudsimId() {
        return cloudsimId;
    }

    public long getNumCpuCores() {
        return numCpuCores;
    }

    public List<Double> getStartTimesSeconds() {
        return startTimesSeconds;
    }

    public List<Double> getEndTimesSeconds() {
        return endTimesSeconds;
    }
}
