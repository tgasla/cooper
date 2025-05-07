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

    public Vm addVm(org.cloudsimplus.vms.Vm cloudsimVm) {
        Vm vm = new Vm(cloudsimVm);
        vms.put(cloudsimVm.getId(), vm);

        return vm;
    }

    public void record(org.cloudsimplus.hosts.Host host, Double time) {
        if (host.getStartTime() >= 0) {
            Double lastStartUpTime = Iterables.getLast(startTimesSeconds, null);
            if (lastStartUpTime == null || lastStartUpTime != host.getStartTime()) {
                startTimesSeconds.add(host.getStartTime());
            }
        }

        var vms = host.getVmList();
        for (var vm : vms) {
            Vm existingVm = this.getVms().get(vm.getId());
            if (existingVm == null) {
                existingVm = this.addVm(vm);
            }

            existingVm.record(vm, time);
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
