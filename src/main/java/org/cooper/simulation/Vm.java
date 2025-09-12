package org.cooper.simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Getter;

import org.cloudsimplus.listeners.VmHostEventInfo;
import com.google.common.collect.Iterables;
import com.google.gson.annotations.SerializedName;

@Getter
public class Vm {

    @SerializedName("id")
    private final long cloudsimId;
    private final List<Double> startTimesSeconds = new ArrayList<>();
    private final List<Double> endTimesSeconds = new ArrayList<>();
    private final Map<Long, Cloudlet> cloudlets = new HashMap<>();
    private final long numCpuCores;

    public Vm(final org.cloudsimplus.vms.Vm vm) {
        vm.addOnHostDeallocationListener(this::onHostDeallocationListener);
        this.cloudsimId = vm.getId();
        this.numCpuCores = vm.getPesNumber();
    }

    public Cloudlet addCloudlet(final org.cloudsimplus.cloudlets.Cloudlet csCloudlet) {
        Cloudlet cloudlet = new Cloudlet(csCloudlet);
        cloudlets.put(csCloudlet.getId(), cloudlet);
        return cloudlet;
    }

    public void addStartTime(final double startTime) {
        startTimesSeconds.add(startTime);
    }

    // public void record(final org.cloudsimplus.vms.Vm vm) {
    //     double startTime = vm.getStartTime();
    //     if (startTime >= 0) {
    //         Double lastStartUpTime = Iterables.getLast(startTimesSeconds, null);
    //         if (lastStartUpTime == null || !lastStartUpTime.equals(startTime)) {
    //             startTimesSeconds.add(startTime);
    //         }
    //     }

    //     var scheduler = vm.getCloudletScheduler();
    //     if (scheduler == null) {
    //         return;
    //     }
    //     for (var cloudlet : scheduler.getCloudletSubmittedList()) {
    //         cloudlets.computeIfAbsent(cloudlet.getId(), id -> new Cloudlet(cloudlet))
    //                     .record(cloudlet);
    //     }
    // }

    private void onHostDeallocationListener(final VmHostEventInfo event) {
        var csVm = event.getVm();
        if (!csVm.isFinished() || 
            ( !endTimesSeconds.isEmpty() &&
                endTimesSeconds.get(endTimesSeconds.size() - 1) == csVm.getFinishTime() )) {
            return;
        }
        endTimesSeconds.add(csVm.getFinishTime());
    }
}
