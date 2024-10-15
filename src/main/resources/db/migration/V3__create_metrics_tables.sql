CREATE TABLE IF NOT EXISTS host_metric (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES host(id),

  simulation_time_seconds DOUBLE PRECISION NOT NULL,

  cpu_utilization DOUBLE PRECISION NOT NULL,
  ram_usage_mb BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS vm_metric (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vm_id UUID NOT NULL REFERENCES vm(id),

  simulation_time_seconds DOUBLE PRECISION NOT NULL,

  ram_allocated_mb BIGINT NOT NULL,
  ram_available_mb BIGINT NOT NULL,
  cpu_utilization DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS cloudlet_metric (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cloudlet_id UUID NOT NULL REFERENCES cloudlet(id),

  simulation_time_seconds DOUBLE PRECISION NOT NULL,

  cpu_utilization DOUBLE PRECISION NOT NULL,
  ram_utilization DOUBLE PRECISION NOT NULL
);
