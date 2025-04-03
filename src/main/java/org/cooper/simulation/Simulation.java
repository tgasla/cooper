package org.cooper.simulation;

import java.util.HashMap;
import java.util.UUID;
import java.time.Instant;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.cloudsimplus.datacenters.Datacenter;

public class Simulation {
    private final String id;
    private final String name;
    private String startedAt;
    private String endedAt;
    private HashMap<Double, Host> hosts = new HashMap<>();
    private Boolean recordMetrics = true;

    public Simulation(String name) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.startedAt = Instant.now().toString();
    }

    public Simulation(String name, Boolean recordMetrics) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.startedAt = Instant.now().toString();
        this.recordMetrics = recordMetrics;
    }

    public void recordState(Datacenter dc, double time) {
        var hostList = dc.getHostList();

        for (var cloudsimHost : hostList) {
            double hostId = cloudsimHost.getId();

            if (!this.hosts.containsKey(hostId)) {
                this.hosts.put(hostId, new Host(cloudsimHost));
            }
        }

        for (Host host : this.hosts.values()) {
            var csHost = dc.getHostById(host.getCloudsimId());
            host.record(csHost, time, this.recordMetrics);
        }
    }

    public String getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public String getStartedAt() {
        return this.startedAt;
    }

    public String getEndedAt() {
        return this.endedAt;
    }

    public void setEndedAt(String endedAt) {
        this.endedAt = endedAt;
    }

    public HashMap<Double, Host> getHosts() {
        return this.hosts;
    }

    /**
     * Returns the current state of the simulation as a JSON string.
     * The JSON includes simulation metadata and all hosts with their nested
     * entities.
     * 
     * @return Pretty-printed JSON string representing the simulation state
     */
    public String endSimulation(Datacenter dc, double time) {
        this.recordState(dc, time);

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        HashMap<String, Object> simulationState = new HashMap<>();

        // Add simulation metadata
        simulationState.put("id", this.id);
        simulationState.put("name", this.name);
        simulationState.put("startedAt", this.startedAt);
        simulationState.put("endedAt", this.endedAt);
        simulationState.put("hosts", this.hosts);

        return gson.toJson(simulationState);
    }
}
