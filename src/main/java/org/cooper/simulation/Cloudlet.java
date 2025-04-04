package org.cooper.simulation;

import com.google.gson.annotations.SerializedName;

public class Cloudlet {

    @SerializedName("id")
    private final long cloudsimId;
    private double startTime;
    private double finishTime;
    private final long length;
    private long finishedLength;
    private double executionTime;
    private final long vmId;

    public Cloudlet(org.cloudsimplus.cloudlets.Cloudlet cloudlet) {
        this.cloudsimId = cloudlet.getId();
        this.length = cloudlet.getLength();
        this.finishedLength = cloudlet.getFinishedLengthSoFar();
        this.executionTime = cloudlet.getTotalExecutionTime();
        this.vmId = cloudlet.getVm().getId();
    }

    public void record(org.cloudsimplus.cloudlets.Cloudlet cloudlet, double time) {
        if (cloudlet.getStartTime() >= 0) {
            this.startTime = cloudlet.getStartTime();
        }

        if (cloudlet.getFinishTime() > 0) {
            this.finishTime = cloudlet.getFinishTime();
        }

        this.finishedLength = cloudlet.getFinishedLengthSoFar();
        this.executionTime = cloudlet.getTotalExecutionTime();
    }

    public long getCloudsimId() {
        return this.cloudsimId;
    }

    public double getStartTime() {
        return this.startTime;
    }

    public double getFinishTime() {
        return this.finishTime;
    }

    public long getLength() {
        return this.length;
    }

    public long getFinishedLength() {
        return this.finishedLength;
    }

    public double getExecutionTime() {
        return this.executionTime;
    }

    public long getVmId() {
        return this.vmId;
    }
}
