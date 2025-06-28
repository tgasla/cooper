package org.cooper.simulation;

import java.time.Instant;
import java.util.HashMap;
import java.util.UUID;

import org.cloudsimplus.datacenters.Datacenter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class SimulationRecording {

    private final String id;
    private final String name;
    private final String startedAt;
    private final HashMap<Double, Host> hosts = new HashMap<>();
    private double simulationDuration;

    public SimulationRecording(final String name) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.startedAt = Instant.now().toString();
    }

    /**
     * Records the state of the simulation at a given time.
     *
     * @param dc   The datacenter to record the state of
     * @param time The time to record the state at
     */
    public void tick(final Datacenter dc, final double time) {
        var hostList = dc.getHostList();

        for (var cloudsimHost : hostList) {
            double hostId = cloudsimHost.getId();

            if (!this.hosts.containsKey(hostId)) {
                this.hosts.put(hostId, new Host(cloudsimHost));
            }
        }

        for (Host host : this.hosts.values()) {
            var csHost = dc.getHostById(host.getCloudsimId());
            host.record(csHost, time);
        }

        this.simulationDuration = dc.getSimulation().clock();
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

    public Double getSimulationDuration() {
        return this.simulationDuration;
    }

    public HashMap<Double, Host> getHosts() {
        return this.hosts;
    }

    /**
     * Returns the end state of the simulation as a JSON string. The JSON
     * includes simulation metadata and all hosts with their nested entities.
     *
     * @param dc   The datacenter to record the state of
     * @param time The time to record the state at
     * @return Pretty-printed JSON string representing the simulation state
     */
    public String end(final Datacenter dc, final double time) {
        this.tick(dc, time);

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        HashMap<String, Object> recording = new HashMap<>();

        recording.put("id", this.id);
        recording.put("name", this.name);
        recording.put("startedAt", this.startedAt);
        recording.put("duration", this.simulationDuration);
        recording.put("hosts", this.hosts);

        return gson.toJson(recording);
    }
}
