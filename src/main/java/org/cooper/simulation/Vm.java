package org.cooper.simulation;

import java.util.Optional;

public class Vm {
    private String cloudsimId;
    private Double startTimeSeconds;
    private Optional<String> endTimeSeconds;
    private String hostId;

    public Vm(String cloudsimId, Double startTimeSeconds) {
        this.cloudsimId = cloudsimId;
        this.startTimeSeconds = startTimeSeconds;
    }

    public String getCloudsimId() {
        return cloudsimId;
    }

    public Double getStartTimeSeconds() {
        return startTimeSeconds;
    }

    public String getHostId() {
        return hostId;
    }

    public Optional<String> getEndTimeSeconds() {
        return endTimeSeconds;
    }
}
