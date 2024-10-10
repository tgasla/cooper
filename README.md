# Cooper - Cloudsim Interface

This is a web interface for exploring [cloudsimplus](https://github.com/cloudsimplus/cloudsimplus) simulations.

This repository includes both a Java API for collecting simulation data from cloudsimplus and a React web interface.

### Gitlab Mirror
This repository is [mirrored on Gitlab](https://csgitlab.ucd.ie/doylemark/cooper) however the [primary remote](https://github.com/doylemark/cooper) is Github.

### Building the library
1. Start the postgres container
```zsh
docker compose up -d
```
2. Install Dependencies
```zsh
sh mvnw install
```
3. Migrate the database
```zsh
sh mvnw flyway:migrate
```
4. Run the Maven build again to generate JOOQ models from the database schema
```zsh
sh mvnw install
```
