package org.cooper.simulation;

import java.util.ArrayList;
import java.util.HashMap;

import com.google.gson.annotations.SerializedName;
import org.cooper.simulation.metrics.HostMetric;

public class Host {
    @SerializedName("id")
    private long cloudsimId;
    private ArrayList<Double> startTimes = new ArrayList<>(); // seconds
    private ArrayList<Double> endTimes = new ArrayList<>(); // seconds

    private HashMap<Long, Vm> vms = new HashMap<>();
    private ArrayList<HostMetric> metrics = new ArrayList<>();

    public Host(long cloudsimId) {
        this.cloudsimId = cloudsimId;
    }

    public HashMap<Long, Vm> addVm(long cloudsimId, double time) {
        Vm vm = new Vm(cloudsimId, time);
        vms.put(cloudsimId, vm);

        return this.vms;
    }

    public void recordMetric(org.cloudsimplus.hosts.Host host, Double time) {
        HostMetric metric = new HostMetric(time, host.getCpuPercentUtilization(), host.getRamUtilization());
        metrics.add(metric);
    }

    public void start(double time) {
        this.startTimes.add(time);
    }

    public void finish(double time) {
        this.endTimes.add(time);
    }

    public long getCloudsimId() {
        return cloudsimId;
    }

    public ArrayList<Double> getStartTimes() {
        return startTimes;
    }

    public ArrayList<Double> getEndTimes() {
        return endTimes;
    }

    public ArrayList<HostMetric> getMetrics() {
        return metrics;
    }

    public HashMap<Long, Vm> getVms() {
        return vms;
    }
}
