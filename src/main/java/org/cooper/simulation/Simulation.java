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
    private final String startedAt;
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
        System.out.println("Recording state at time " + time);
        var hostList = dc.getHostList();

        for (var cloudsimHost : hostList) {
            double hostId = cloudsimHost.getId();

            if (!hosts.containsKey(hostId)) {
                Host host = new Host(cloudsimHost.getId());

                if (cloudsimHost.isActive()) {
                    host.start(time);
                }

                hosts.put(hostId, host);
            }

            var existingHost = hosts.get(hostId);

            if (recordMetrics) {
                existingHost.recordMetric(cloudsimHost, time);
            }

            Host simulationHost = hosts.get(hostId);

            for (var vm : cloudsimHost.getVmList()) {
                if (!simulationHost.getVms().containsKey(vm.getId())) {
                    simulationHost.addVm(vm.getId(), time);
                }
            }
        }

        for (var host : hosts.values()) {
            var cloudsimHost = dc.getHostById(host.getCloudsimId());

            if (!cloudsimHost.isActive()) {
                double finishTime = cloudsimHost.getFinishTime();
                host.finish(finishTime);
            }
        }
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getStartedAt() {
        return startedAt;
    }

    public String getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(String endedAt) {
        this.endedAt = endedAt;
    }

    public HashMap<Double, Host> getHosts() {
        return hosts;
    }

    /**
     * Returns the current state of the simulation as a JSON string.
     * The JSON includes simulation metadata and all hosts with their nested
     * entities.
     * 
     * @return Pretty-printed JSON string representing the simulation state
     */
    public String getState() {
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        HashMap<String, Object> simulationState = new HashMap<>();

        // Add simulation metadata
        simulationState.put("id", id);
        simulationState.put("name", name);
        simulationState.put("startedAt", startedAt);
        simulationState.put("endedAt", endedAt);
        simulationState.put("hosts", hosts);

        return gson.toJson(simulationState);
    }
}
