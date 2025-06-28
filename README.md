# Cooper

Cooper is a Java library and web interface that provides a simple and efficient way to record and analyze [CloudSimPlus](https://github.com/cloudsimplus/cloudsimplus) simulations.



## Requirements

- Java 21 or later
- Maven 3.6 or later
- CloudSimPlus 8.5.2 or later

## Installation

Add Cooper to your Maven project:

```xml
<dependency>
    <groupId>io.github.doylemark</groupId>
    <artifactId>cooper</artifactId>
    <version>0.0.3</version>
</dependency>
```

## Quick Start

```java
SimulationRecording recording = new SimulationRecording("Dynamic VMs Arrival");

simulation.startSync();

// Run the simulation and record state at each tick
while (simulation.isRunning()) {
    double clock = simulation.runFor(1);
    recording.tick(datacenter, clock);
}

// Get the final state as JSON
String output = recording.end(datacenter, simulation.clock());
```

## Building from Source

```bash
# Clone the repository
git clone https://github.com/doylemark/cooper.git
cd cooper

# Build the project
mvn clean install
```

## Self-Hosting Frontend

Make sure you have Node.js (preferably latest version) and pnpm installed. It is recommended to use fnm to manage node and npm versions.
See [this reddit comment](https://www.reddit.com/r/pop_os/comments/lpvk1z/comment/gq6ml3s/).
Then run:

```bash
cd cooper/apps/client
pnpm install
pnpm build
pnpm dev
```
