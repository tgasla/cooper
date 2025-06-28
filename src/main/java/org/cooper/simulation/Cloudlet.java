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

import org.cloudsimplus.listeners.CloudletEventInfo;

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
        // Assuming a listener for Cloudlet finish events exists
        cloudlet.addOnFinishListener(this::onCloudletFinishListener);
    }

    // Listener for Cloudlet finish events
    public void onCloudletFinishListener(CloudletEventInfo event) {
        var finishedCloudlet = event.getCloudlet();
        this.finishTime = finishedCloudlet.getFinishTime();
        this.finishedLength = finishedCloudlet.getFinishedLengthSoFar();
        this.executionTime = finishedCloudlet.getTotalExecutionTime();
    }

    public void record(org.cloudsimplus.cloudlets.Cloudlet cloudlet, double time) {
        if (cloudlet.getStartTime() >= 0 && this.startTime == 0) { // Record start time only once
            this.startTime = cloudlet.getStartTime();
        }

        // Finish time is now handled by the listener.
        // We still need to update progress periodically for running cloudlets.
        if (cloudlet.getFinishTime() <= 0) { // If cloudlet hasn't finished
            this.finishedLength = cloudlet.getFinishedLengthSoFar();
            this.executionTime = cloudlet.getTotalExecutionTime();
        }
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
