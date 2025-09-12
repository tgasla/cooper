package org.cooper.simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Getter;

import org.cloudsimplus.listeners.HostEventInfo;

import com.google.common.collect.Iterables;
import com.google.gson.annotations.SerializedName;

@Getter
public class Host {

    @SerializedName("id")
    private final long cloudsimId;
    private final List<Double> startTimesSeconds = new ArrayList<>();
    private final List<Double> endTimesSeconds = new ArrayList<>();
    private final long numCpuCores;
    private final Map<Long, Vm> vms = new HashMap<>();

    public Host(final org.cloudsimplus.hosts.Host host) {
        // host.enableUtilizationStats(); // maybe activate this later
        this.cloudsimId = host.getId();
        this.numCpuCores = host.getPesNumber();
        host.addOnShutdownListener(this::onHostShutdownListener);
    }

    public void onHostShutdownListener(final HostEventInfo event) {
        var host = event.getHost();

        if (!host.isFinished() || 
            ( !endTimesSeconds.isEmpty() &&
                endTimesSeconds.get(endTimesSeconds.size() - 1) == host.getFinishTime()) ) {
            return;
        }
        endTimesSeconds.add(host.getFinishTime());
    }

    public Vm addVm(final org.cloudsimplus.vms.Vm csVm) {
        Vm vm = new Vm(csVm);
        vms.put(csVm.getId(), vm);

        return vm;
    }

    public void addStartTime(final double startTime) {
        startTimesSeconds.add(startTime);
    }

    // public void record(final org.cloudsimplus.hosts.Host host) {
    //     if (host.getStartTime() >= 0) {
    //         Double lastStartUpTime = Iterables.getLast(startTimesSeconds, null);
    //         if (lastStartUpTime == null || lastStartUpTime != host.getStartTime()) {
    //             startTimesSeconds.add(host.getStartTime());
    //         }
    //     }

    //     var vms = host.getVmList();
    //     for (var vm : vms) {
    //         Vm existingVm = this.getVms().get(vm.getId());
    //         if (existingVm == null) {
    //             existingVm = this.addVm(vm);
    //         }

    //         existingVm.record(vm);
    //     }
    // }
}
