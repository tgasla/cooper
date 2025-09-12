package org.cooper.simulation;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import lombok.Getter;

import org.cloudsimplus.listeners.VmHostEventInfo;
import org.cloudsimplus.listeners.CloudletVmEventInfo;
import org.cloudsimplus.core.events.SimEvent;
import org.cloudsimplus.core.CloudSimTag;
import org.cloudsimplus.datacenters.Datacenter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@Getter
public class SimulationRecording {

    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    private final String id;
    private final String name;
    private final String startedAt;
    private final Map<Long, Host> hosts = new HashMap<>();
    private final Datacenter datacenter;
    private double simulationDuration;

    public SimulationRecording(final String name, final Datacenter datacenter) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.startedAt = Instant.now().toString();
        this.datacenter = datacenter;
        datacenter.getSimulation().addOnEventProcessingListener(this::onEventProcessingListener);
        for (var csHost : datacenter.getHostList()) {
            var host = addHost(csHost);
            host.addStartTime(csHost.getStartTime());
        }
    }

    private Host addHost(final org.cloudsimplus.hosts.Host csHost) {
        var host = new Host(csHost);
        hosts.put(csHost.getId(), host);
        return host;
    }

    private void onEventProcessingListener(final SimEvent event) {
        if (event.getTag() == CloudSimTag.HOST_POWER_ON) {
            var csHost = (org.cloudsimplus.hosts.Host) event.getData();
            var host = hosts.get(csHost.getId());
            if (host == null) {
                host = addHost(csHost);
            }
            host.addStartTime(csHost.getStartTime());
        }
        // else if (event.getTag() == CloudSimTag.HOST_POWER_OFF) { // done using listener in Host.java
        //     var csHost = (org.cloudsimplus.hosts.Host) event.getData();
        //     var host = hosts.get(csHost.getId());
        //     if (host != null && (host.getEndTimesSeconds().isEmpty() ||
        //         host.getEndTimesSeconds().get(host.getEndTimesSeconds().size() - 1) != csHost.getFinishTime())) {
        //         host.getEndTimesSeconds().add(csHost.getFinishTime());
        //     }
        // }
        else if (event.getTag() == CloudSimTag.HOST_ADD) { // not called if the host is already in the datacenter
            var csHost = (org.cloudsimplus.hosts.Host) event.getData();
            var host = hosts.get(csHost.getId());
            if (host == null) {
                addHost(csHost);
            }
        }
        else if (event.getTag() == CloudSimTag.VM_CREATE_ACK) {
            var csVm = (org.cloudsimplus.vms.Vm) event.getData();
            csVm.addOnHostAllocationListener(this::vmHostAllocationListener);
        }
        // else if (event.getTag() == CloudSimTag.VM_DESTROY) { // ok
        //     var vm = (org.cloudsimplus.vms.Vm) event.getData();
        // }
        // else if (event.getTag() == CloudSimTag.CLOUDLET_CREATION) { //ok
        //     var cloudlet = (org.cloudsimplus.cloudlets.Cloudlet) event.getData();
        // }
        else if (event.getTag() == CloudSimTag.CLOUDLET_SUBMIT) {
            var csCloudlet = (org.cloudsimplus.cloudlets.Cloudlet) event.getData();
            csCloudlet.addOnUpdateProcessingListener(this::cloudletProcessingListener);
            var csVm = csCloudlet.getVm();
            if (csVm != null) {
                var csHost = csVm.getHost();
                var host = hosts.get(csHost.getId());
                var vm = host.getVms().get(csVm.getId());
                vm.addCloudlet(csCloudlet);
            }
        }
        else if (event.getTag() == CloudSimTag.CLOUDLET_RETURN) { // ok
            var csCloudlet = (org.cloudsimplus.cloudlets.Cloudlet) event.getData();
            var csVm = csCloudlet.getVm();
            var csHost = csVm.getHost();
            var host = hosts.get(csHost.getId());
            var vm = host.getVms().get(csVm.getId());
            var cloudlet = vm.getCloudlets().get(csCloudlet.getId());
            // cloudlet.setStartTime(csCloudlet.getStartTime());
            cloudlet.setFinishTime(csCloudlet.getFinishTime());
            cloudlet.setExecutionTime(csCloudlet.getTotalExecutionTime());
            cloudlet.setFinishedLength(csCloudlet.getFinishedLengthSoFar());
        }
    }

    private void vmHostAllocationListener(final VmHostEventInfo event) {
        var csVm = event.getVm();
        var csHost = event.getHost();
        var host = hosts.get(csHost.getId());
        var vm = host.getVms().get(csVm.getId());
        if (vm == null) {
            vm = host.addVm(csVm);
        }

        var vmStartTimesSeconds = vm.getStartTimesSeconds();
        if (!csVm.hasStarted() || 
            ( !vmStartTimesSeconds.isEmpty() &&
                vmStartTimesSeconds.get(vmStartTimesSeconds.size() - 1) == csVm.getStartTime() )) {
            return;
        }
        vm.addStartTime(csVm.getStartTime());
    }

    private void cloudletProcessingListener(final CloudletVmEventInfo event) {
        var csCloudlet = event.getCloudlet();
        var csVm = event.getVm();
        // if (csVm == null) {
        //     return; // the cloudlet is not assigned to any VM
        // }
        var csHost = csVm.getHost();
        // if (csHost == null) {
        //     return; // the VM is not assigned to any host
        // }
        var host = hosts.get(csHost.getId());
        // if (host == null) {
        //     return; // the host is not recorded
        // }
        var vm = host.getVms().get(csVm.getId());
        // if (vm == null) {
        //     return; // the VM is not recorded
        // }
        var cloudletRecord = vm.getCloudlets().get(csCloudlet.getId());
        // if (cloudletRecord == null) {
        //     return;
        // }
        if (csCloudlet.hasStarted()) {
            if (cloudletRecord.getStartTime() != csCloudlet.getStartTime()) {
                cloudletRecord.setStartTime(csCloudlet.getStartTime());
            }
            if (csCloudlet.isRunning()) {
                cloudletRecord.setExecutionTime(csCloudlet.getTotalExecutionTime());
                cloudletRecord.setFinishedLength(csCloudlet.getFinishedLengthSoFar());
            }
        }
    }

    // private void clockTickListener(final SimEvent event) { // may be useful later
    // }

    public String end() {
        Map<String, Object> recording = new HashMap<>();
        recording.put("id", id);
        recording.put("name", name);
        recording.put("startedAt", startedAt);
        recording.put("duration", this.datacenter.getSimulation().clock());
        recording.put("hosts", hosts);

        return GSON.toJson(recording);
    }
}
