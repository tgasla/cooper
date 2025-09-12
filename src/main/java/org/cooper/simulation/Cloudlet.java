package org.cooper.simulation;

import lombok.Getter;
import lombok.Setter;
import com.google.gson.annotations.SerializedName;

@Getter
@Setter
public class Cloudlet {

    @SerializedName("id")
    private final long cloudsimId;
    private double startTime;
    private double finishTime;
    private final long length;
    private long finishedLength;
    private double executionTime;
    private final long numCpuCores;
    private final long vmId;

    public Cloudlet(final org.cloudsimplus.cloudlets.Cloudlet cloudlet) {
        this.cloudsimId = cloudlet.getId();
        this.length = cloudlet.getLength();
        this.numCpuCores = cloudlet.getPesNumber();
        this.vmId = cloudlet.getVm().getId();
    }

    // public void record(final org.cloudsimplus.cloudlets.Cloudlet cloudlet) {
    //     if (cloudlet.getStartTime() >= 0) {
    //         this.startTime = cloudlet.getStartTime();
    //     }

    //     if (cloudlet.getFinishTime() > 0) {
    //         this.finishTime = cloudlet.getFinishTime();
    //     }

    //     this.finishedLength = cloudlet.getFinishedLengthSoFar();
    //     this.executionTime = cloudlet.getTotalExecutionTime();
    // }
}
