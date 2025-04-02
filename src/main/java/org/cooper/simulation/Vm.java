package org.cooper.simulation;

import java.util.ArrayList;
import java.util.Optional;

import com.google.gson.annotations.SerializedName;
import org.cooper.simulation.metrics.VmMetric;

public class Vm {
    @SerializedName("id")
    private long cloudsimId;
    private Double startTimeSeconds;
    // private Optional<String> endTimeSeconds;
    private String hostId;
    private ArrayList<VmMetric> metrics = new ArrayList<>();

    public Vm(long cloudsimId, Double startTimeSeconds) {
        this.cloudsimId = cloudsimId;
        this.startTimeSeconds = startTimeSeconds;
    }

    public long getCloudsimId() {
        return cloudsimId;
    }

    public Double getStartTimeSeconds() {
        return startTimeSeconds;
    }

    public String getHostId() {
        return hostId;
    }

    // public Optional<String> getEndTimeSeconds() {
    // return endTimeSeconds;
    // }
}
