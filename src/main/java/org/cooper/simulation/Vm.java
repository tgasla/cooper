package org.cooper.simulation;

import java.util.ArrayList;

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

    public Vm(org.cloudsimplus.vms.Vm vm) {
        vm.addOnHostDeallocationListener(this::onVmFinishListener);
        this.cloudsimId = vm.getId();
        System.out.println("Creating VM with id: " + cloudsimId);
    }

    public void record(org.cloudsimplus.vms.Vm vm, double time, Boolean recordMetrics) {
        System.out.println("Vm: " + vm.getId() + " start time: " + vm.getStartTime() + "Previous start time: "
                + Iterables.getLast(startTimesSeconds, null));

        if (vm.getStartTime() >= 0) {
            Double lastStartUpTime = Iterables.getLast(startTimesSeconds, null);
            if (lastStartUpTime == null || lastStartUpTime != vm.getStartTime()) {
                startTimesSeconds.add(vm.getStartTime());
            }
        }

        System.out.println("Vm: " + vm.getId() + " finish time: " + vm.getFinishTime());

        if (vm.getFinishTime() > 0) {
            Double lastFinishTime = Iterables.getLast(endTimesSeconds, null);
            if (lastFinishTime == null || lastFinishTime != vm.getFinishTime()) {
                endTimesSeconds.add(vm.getFinishTime());
            }
        }

        if (recordMetrics) {
            var ram = vm.getRam();
            VmMetric metric = new VmMetric(time, vm.getCpuPercentUtilization(), ram.getPercentUtilization());
            metrics.add(metric);
        }
    }

    public void onVmFinishListener(VmHostEventInfo event) {
        System.out.println("Vm: " + event.getVm().getId() + " finished at: " + event.getVm().getFinishTime());
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
