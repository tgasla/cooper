package org.cooper.simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;
import java.time.Instant;

import org.cloudsimplus.datacenters.Datacenter;

public class Simulation {
    private final String id;
    private final String name;
    private final String startedAt;
    private String endedAt;
    private HashMap<Double, Host> hosts = new HashMap<>();

    public Simulation(String name) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.startedAt = Instant.now().toString();
    }

    public void recordState(Datacenter dc, double time) {
        var hostList = dc.getHostList();
        HashMap<Double, org.cloudsimplus.hosts.Host> currentHosts = new HashMap<>();

        for (var host : currentHosts.values()) {
            double hostId = host.getId();

            if (!hosts.containsKey(hostId)) {
                hosts.put(hostId, new Host(host.getId(), time));
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
}
