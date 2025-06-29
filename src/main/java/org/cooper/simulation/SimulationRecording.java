package org.cooper.simulation;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.cloudsimplus.core.CloudSimPlus;
import org.cloudsimplus.core.events.SimEvent;
import org.cloudsimplus.core.CloudSimTag;
import org.cloudsimplus.datacenters.Datacenter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class SimulationRecording {

    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    private final String id;
    private final String name;
    private final String startedAt;
    private final Map<Long, Host> hosts = new HashMap<>();
    private double simulationDuration;

    public SimulationRecording(final String name, final CloudSimPlus simulation, final Datacenter datacenter) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.startedAt = Instant.now().toString();
        simulation.addOnEventProcessingListener(this::onEventProcessingListener);
        // datacenter.getHostList().forEach(cloudsimHost -> hosts.put(cloudsimHost.getId(), new Host(cloudsimHost)));
        for (var cloudsimHost : datacenter.getHostList()) {
            var host = new Host(cloudsimHost);
            hosts.put(cloudsimHost.getId(), host);
            host.record(cloudsimHost);
        }
    }

    private void onEventProcessingListener(final SimEvent event) {
        if (event.getTag() == CloudSimTag.VM_CREATE_ACK) { // ok
            var vm = (org.cloudsimplus.vms.Vm) event.getData();
            // System.out.println("VM created: " + vm.getId());
        }
        else if (event.getTag() == CloudSimTag.VM_DESTROY) { // ok
            var vm = (org.cloudsimplus.vms.Vm) event.getData();
            // System.out.println("VM destroyed: " + vm.getId());
        }
        else if (event.getTag() == CloudSimTag.HOST_ADD) {
            var csHost = (org.cloudsimplus.hosts.Host) event.getData();
            // System.out.println("Host created: " + csHost.getId());
            var host = new Host(csHost);
            hosts.put(csHost.getId(), host);
            host.record(csHost);
        }
        else if (event.getTag() == CloudSimTag.CLOUDLET_CREATION) { //ok
            // System.out.println("Cloudlet Starting");
        }
        else if (event.getTag() == CloudSimTag.CLOUDLET_RETURN) { // ok
            // System.out.println("Cloudlet Finished");
        }
    }

    public void tick(final Datacenter dc) {
        // var hostList = dc.getHostList();

        // for (var cloudsimHost : hostList) {
        //     double hostId = cloudsimHost.getId();
        //     hosts.computeIfAbsent(hostId, id -> new Host(cloudsimHost));
        // }
        // for (Host host : hosts.values()) {
        //     var csHost = dc.getHostById(host.getCloudsimId());
        //     host.record(csHost, time);
        // }
        for (Host host : hosts.values()) {
            var csHost = dc.getHostById(host.getCloudsimId());
            host.record(csHost);
        }
        // hosts.values().forEach(host -> host.record(dc.getHostById(host.getCloudsimId())));

        // this.simulationDuration = dc.getSimulation().clock();
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getStartedAt() { return startedAt; }
    public double getSimulationDuration() { return simulationDuration; }
    public Map<Long, Host> getHosts() { return hosts; }

    public String end(final Datacenter dc) {
        tick(dc);
        Map<String, Object> recording = new HashMap<>();
        recording.put("id", id);
        recording.put("name", name);
        recording.put("startedAt", startedAt);
        recording.put("duration", dc.getSimulation().clock());
        recording.put("hosts", hosts);

        return GSON.toJson(recording);
    }
}
