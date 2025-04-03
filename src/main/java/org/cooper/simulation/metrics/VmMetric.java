package org.cooper.simulation.metrics;

public class VmMetric {
    private Double simulationTimeSeconds; // seconds
    private Double cpuUtilization; // percentage
    private Double ramUsage; // megabytes

    public VmMetric(Double simulationTime, Double cpuUtilization, Double ramUsage) {
        this.simulationTimeSeconds = simulationTime;
        this.cpuUtilization = cpuUtilization;
        this.ramUsage = ramUsage;
    }

    public Double getSimulationTime() {
        return simulationTimeSeconds;
    }

    public Double getCpuUtilization() {
        return cpuUtilization;
    }

    public Double getRamUsage() {
        return ramUsage;
    }
}
