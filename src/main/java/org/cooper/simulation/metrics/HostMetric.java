package org.cooper.simulation.metrics;

public class HostMetric {
    private Double simulationTime; // seconds
    private Double cpuUtilization; // percentage
    private Long ramUsage; // megabytes

    public HostMetric(Double simulationTime, Double cpuUtilization, Long ramUsage) {
        this.simulationTime = simulationTime;
        this.cpuUtilization = cpuUtilization;
        this.ramUsage = ramUsage;
    }

    public Double getSimulationTime() {
        return simulationTime;
    }

    public Double getCpuUtilization() {
        return cpuUtilization;
    }

    public Long getRamUsage() {
        return ramUsage;
    }
}
