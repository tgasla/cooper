CREATE TABLE IF NOT EXISTS host (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulation_id UUID NOT NULL REFERENCES simulation(id),

  cloudsim_id BIGINT NOT NULL,

  start_time_seconds DOUBLE PRECISION NOT NULL,
  finish_time_seconds DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS vm (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulation_id UUID NOT NULL REFERENCES simulation(id),
  host_id UUID NOT NULL REFERENCES host(id),

  cloudsim_id BIGINT NOT NULL,

  start_time_seconds DOUBLE PRECISION NOT NULL,
  finish_time_seconds DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS cloudlet (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulation_id UUID NOT NULL REFERENCES simulation(id),
  vm_id UUID NOT NULL REFERENCES vm(id),

  cloudsim_id BIGINT NOT NULL,

  length BIGINT NOT NULL,
  start_time_seconds DOUBLE PRECISION NOT NULL,
  finish_time_seconds DOUBLE PRECISION
);
