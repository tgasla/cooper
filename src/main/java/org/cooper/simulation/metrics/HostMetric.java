package org.cooper.simulation.metrics;

class HostMetric {
    private Double simulationTime; // seconds
    private Double cpuUtilization; // percentage
    private Integer ramUsage; // megabytes

    public HostMetric(Double simulationTime, Double cpuUtilization, Integer ramUsage) {
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

    public Integer getRamUsage() {
        return ramUsage;
    }
}
