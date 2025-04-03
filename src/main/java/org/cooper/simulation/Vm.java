package org.cooper.simulation;

import java.util.ArrayList;
import java.util.HashMap;

import com.google.gson.annotations.SerializedName;

import org.cloudsimplus.listeners.EventListener;
import org.cloudsimplus.listeners.VmHostEventInfo;
import org.cooper.simulation.metrics.VmMetric;
import com.google.common.collect.Iterables;

public class Vm {
    @SerializedName("id")
    private long cloudsimId;
    private ArrayList<Double> startTimesSeconds = new ArrayList<>();
    private ArrayList<Double> endTimesSeconds = new ArrayList<>();
    private String hostId;
    private ArrayList<VmMetric> metrics = new ArrayList<>();
    private HashMap<Long, Cloudlet> cloudlets = new HashMap<>();

    public Vm(org.cloudsimplus.vms.Vm vm) {
        vm.addOnHostDeallocationListener(this::onVmFinishListener);
        this.cloudsimId = vm.getId();
    }

    public void record(org.cloudsimplus.vms.Vm vm, double time, Boolean recordMetrics) {
        if (vm.getStartTime() >= 0) {
            Double lastStartUpTime = Iterables.getLast(startTimesSeconds, null);
            if (lastStartUpTime == null || lastStartUpTime != vm.getStartTime()) {
                startTimesSeconds.add(vm.getStartTime());
            }
        }

        if (recordMetrics) {
            var ram = vm.getRam();
            VmMetric metric = new VmMetric(time, vm.getCpuPercentUtilization(), ram.getPercentUtilization());
            metrics.add(metric);
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

    public String getHostId() {
        return hostId;
    }
}
