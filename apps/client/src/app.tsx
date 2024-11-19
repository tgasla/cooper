import React from "react";
import { timeFormat } from "d3-time-format";
import { Axis, Scale } from "@visx/visx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./screens";

function TimeAxis() {
  const now = new Date();

  const width = 800;
  const height = 100;

  const timeScale = Scale.scaleLinear({
    range: [0, width],
    domain: [0, 60],
  });

  return (
    <svg width={width} height={height}>
      <g transform="translate(0, 40)">
        <Axis.AxisBottom
          top={0}
          scale={timeScale}
          numTicks={6}
          tickFormat={timeFormat("%H:%M:%S")}
          tickStroke="#000"
        />
      </g>
    </svg>
  );
}

const queryClient = new QueryClient();

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function App() {
  return (
    <Providers>
      <div className="p-4">
        <Index />
      </div>
    </Providers>
  );
}

export default App;
