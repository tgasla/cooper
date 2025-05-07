package org.cooper.simulation;

import java.util.ArrayList;
import java.util.HashMap;

import org.cloudsimplus.listeners.VmHostEventInfo;

import com.google.common.collect.Iterables;
import com.google.gson.annotations.SerializedName;

public class Vm {

    @SerializedName("id")
    private final long cloudsimId;
    private final ArrayList<Double> startTimesSeconds = new ArrayList<>();
    private final ArrayList<Double> endTimesSeconds = new ArrayList<>();
    private final HashMap<Long, Cloudlet> cloudlets = new HashMap<>();

    public Vm(org.cloudsimplus.vms.Vm vm) {
        vm.addOnHostDeallocationListener(this::onVmFinishListener);
        this.cloudsimId = vm.getId();
    }

    public void record(org.cloudsimplus.vms.Vm vm, double time) {
        if (vm.getStartTime() >= 0) {
            Double lastStartUpTime = Iterables.getLast(startTimesSeconds, null);
            if (lastStartUpTime == null || lastStartUpTime != vm.getStartTime()) {
                startTimesSeconds.add(vm.getStartTime());
            }
        }

        var scheduler = vm.getCloudletScheduler();

        if (scheduler != null) {
            for (var cloudlet : scheduler.getCloudletSubmittedList()) {
                var existingCloudlet = cloudlets.get(cloudlet.getId());
                if (existingCloudlet == null) {
                    existingCloudlet = new Cloudlet(cloudlet);
                    cloudlets.put(cloudlet.getId(), existingCloudlet);
                }

                existingCloudlet.record(cloudlet, time);
            }
        }

    }

    public void onVmFinishListener(VmHostEventInfo event) {
        var vm = event.getVm();
        if (vm.getFinishTime() > 0) {
            Double lastFinishTime = Iterables.getLast(endTimesSeconds, null);
            if (lastFinishTime == null || lastFinishTime != vm.getFinishTime()) {
                endTimesSeconds.add(vm.getFinishTime());
            }
        }

        vm.removeOnHostDeallocationListener(this::onVmFinishListener);
    }

    public long getCloudsimId() {
        return cloudsimId;
    }

    public ArrayList<Double> getStartTimesSeconds() {
        return this.startTimesSeconds;
    }

    public ArrayList<Double> getEndTimesSeconds() {
        return this.endTimesSeconds;
    }

}
