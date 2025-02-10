package org.cooper.simulation;

import java.util.ArrayList;

public class Host {
    private double cloudsimId;
    private double startTime; // seconds
    private ArrayList<Vm> vms = new ArrayList<>();

    public Host(double cloudsimId, Double startTime) {
        this.cloudsimId = cloudsimId;
        this.startTime = startTime;
    }

    public ArrayList<Vm> addVm(String cloudsimId, double time) {
        Vm vm = new Vm(cloudsimId, time);
        vms.add(vm);

        return this.vms;
    }

    public double getCloudsimId() {
        return cloudsimId;
    }

    public double getStartTime() {
        return startTime;
    }

    public ArrayList<Vm> getVms() {
        return vms;
    }
}
