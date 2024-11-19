package org.cooper.simulation;

import java.sql.DriverManager;
import java.util.UUID;

import org.cloudsimplus.cloudlets.Cloudlet;
import org.cloudsimplus.datacenters.Datacenter;
import org.cloudsimplus.hosts.Host;
import org.cloudsimplus.resources.Resource;
import org.cloudsimplus.vms.Vm;
import org.cooper.jooq.model.Tables;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.impl.DSL;

public class Simulation {
    private DSLContext ctx;
    private UUID simulationId;

    public Simulation(String name) {
        try {
            var conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/cooper", "postgres", "password");
            DSLContext ctx = DSL.using(conn, SQLDialect.POSTGRES);
            this.ctx = ctx;

            var id = ctx.insertInto(Tables.SIMULATION, Tables.SIMULATION.NAME)
                    .values(name)
                    .returningResult(Tables.SIMULATION.ID)
                    .fetchOne();

            if (id == null) {
                throw new RuntimeException("Failed to insert simulation");
            }
            this.simulationId = id.getValue(Tables.SIMULATION.ID);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void recordState(Datacenter dc, double time) {
        var hosts = dc.getHostList();
        this.insertTime(time);

        for (Host host : hosts) {
            traverseHost(host, time);
        }
    }

    private void insertTime(double time) {
        ctx.insertInto(Tables.TIME, Tables.TIME.SIMULATION_ID, Tables.TIME.SIMULATION_TIME_SECONDS)
                .values(this.simulationId, time)
                .execute();
    }

    private UUID findOrInsertHost(Host host, double time) {
        var id = ctx.select().from(Tables.HOST)
                .where(Tables.HOST.SIMULATION_ID.eq(this.simulationId))
                .and(Tables.HOST.CLOUDSIM_ID.eq(host.getId()))
                .fetchAny(Tables.HOST.ID);

        if (id == null) {
            id = ctx
                    .insertInto(Tables.HOST, Tables.HOST.SIMULATION_ID,
                            Tables.HOST.CLOUDSIM_ID, Tables.HOST.START_TIME_SECONDS)
                    .values(this.simulationId, host.getId(), time)
                    .returningResult(Tables.HOST.ID)
                    .fetchAny().value1();
        }

        return id;
    }

    private UUID findOrInsertVm(Vm vm, UUID hostId, double time) {
        var id = ctx.select().from(Tables.VM)
                .where(Tables.VM.SIMULATION_ID.eq(this.simulationId))
                .and(Tables.VM.CLOUDSIM_ID.eq(vm.getId()))
                .fetchAny(Tables.VM.ID);

        if (id == null) {
            id = ctx
                    .insertInto(Tables.VM, Tables.VM.SIMULATION_ID, Tables.VM.CLOUDSIM_ID, Tables.VM.HOST_ID,
                            Tables.VM.START_TIME_SECONDS)
                    .values(this.simulationId, vm.getId(), hostId, time)
                    .returningResult(Tables.VM.ID)
                    .fetchAny().value1();
        }

        return id;
    }

    private UUID findOrInsertCloudlet(Cloudlet cloudlet, UUID vmId, double time) {
        var id = ctx.select().from(Tables.CLOUDLET)
                .where(Tables.CLOUDLET.SIMULATION_ID.eq(this.simulationId))
                .and(Tables.CLOUDLET.CLOUDSIM_ID.eq(cloudlet.getId()))
                .fetchAny(Tables.CLOUDLET.ID);

        if (id == null) {
            id = ctx
                    .insertInto(Tables.CLOUDLET, Tables.CLOUDLET.SIMULATION_ID, Tables.CLOUDLET.CLOUDSIM_ID,
                            Tables.CLOUDLET.VM_ID,
                            Tables.CLOUDLET.START_TIME_SECONDS, Tables.CLOUDLET.LENGTH)
                    .values(this.simulationId, cloudlet.getId(), vmId, time, cloudlet.getLength())
                    .returningResult(Tables.CLOUDLET.ID)
                    .fetchAny().value1();
        }

        return id;
    }

    private void recordHostMetric(Host host, UUID hostId, double time) {
        ctx.insertInto(Tables.HOST_METRIC, Tables.HOST_METRIC.HOST_ID,
                Tables.HOST_METRIC.SIMULATION_TIME_SECONDS, Tables.HOST_METRIC.CPU_UTILIZATION,
                Tables.HOST_METRIC.RAM_USAGE_MB)
                .values(hostId, time, host.getCpuPercentUtilization(), host.getRamUtilization())
                .execute();
    }

    private void recordVmMetric(Vm vm, UUID vmId, double time) {
        Resource ram = vm.getRam();
        ctx.insertInto(Tables.VM_METRIC, Tables.VM_METRIC.VM_ID,
                Tables.VM_METRIC.SIMULATION_TIME_SECONDS, Tables.VM_METRIC.CPU_UTILIZATION,
                Tables.VM_METRIC.RAM_AVAILABLE_MB, Tables.VM_METRIC.RAM_ALLOCATED_MB)
                .values(vmId, time, vm.getCpuPercentUtilization(), ram.getAvailableResource(),
                        ram.getAllocatedResource())
                .execute();
    }

    private void recordCloudletMetric(Cloudlet cloudlet, UUID cloudletId, double time) {
        ctx.insertInto(Tables.CLOUDLET_METRIC, Tables.CLOUDLET_METRIC.CLOUDLET_ID,
                Tables.CLOUDLET_METRIC.SIMULATION_TIME_SECONDS, Tables.CLOUDLET_METRIC.CPU_UTILIZATION,
                Tables.CLOUDLET_METRIC.RAM_UTILIZATION)
                .values(cloudletId, time, cloudlet.getUtilizationOfCpu(), cloudlet.getUtilizationOfRam())
                .execute();
    }

    private void traverseHost(Host host, double time) {
        UUID hostId = this.findOrInsertHost(host, time);
        this.recordHostMetric(host, hostId, time);

        if (hostId == null) {
            throw new RuntimeException("Failed to find or insert host");
        }

        for (Vm vm : host.getVmList()) {
            UUID vmId = this.findOrInsertVm(vm, hostId, time);
            this.recordVmMetric(vm, vmId, time);

            if (vmId == null) {
                throw new RuntimeException("Failed to find or insert vm");
            }

            for (Cloudlet cloudlet : vm.getCloudletScheduler().getCloudletList()) {
                UUID cloudletId = this.findOrInsertCloudlet(cloudlet, vmId, time);
                this.recordCloudletMetric(cloudlet, cloudletId, time);

                if (cloudletId == null) {
                    throw new RuntimeException("Failed to find or insert cloudlet");
                }
            }
        }
    }
}
