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

    public SimulationRecording(String name) {
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
    public void tick(Datacenter dc, double time) {
        // Ensure all hosts from the datacenter are known to the recording
        var hostList = dc.getHostList();
        for (var cloudsimHost : hostList) {
            long hostId = cloudsimHost.getId(); // Host ID is long
            // Convert hostId to Double for map key, consistent with previous version, though Long might be better.
            Double mapKey = (double) hostId;
            if (!this.hosts.containsKey(mapKey)) {
                // This will also attach listeners within the Host constructor
                this.hosts.put(mapKey, new Host(cloudsimHost));
            }
        }

        // Call record on each host. This will propagate to VMs and Cloudlets
        // for periodic updates of entities that are still running or need state refresh.
        for (Host host : this.hosts.values()) {
            // Retrieve the corresponding CloudSim Host object.
            // The Host object in our map might be stale if the simulation dynamically adds/removes hosts,
            // though our current listeners don't handle dynamic host removal from the `this.hosts` map.
            var csHost = dc.getHostById(host.getCloudsimId());
            if (csHost != null) { // Host might have been shut down and removed from DC
                host.record(csHost, time);
            }
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
    public String end(Datacenter dc, double time) {
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
