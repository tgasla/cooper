CREATE TABLE time (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulation_id UUID NOT NULL REFERENCES simulation(id),

  simulation_time_seconds DOUBLE PRECISION NOT NULL
);
