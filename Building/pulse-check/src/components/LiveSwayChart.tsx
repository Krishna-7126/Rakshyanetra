"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Activity } from "lucide-react";

export interface SwayDataPoint {
  time: string;
  x: number;
  y: number;
  z: number;
}

interface LiveSwayChartProps {
  data: SwayDataPoint[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 text-xs shadow-xl border border-cyan-400/10">
        <p className="mb-1.5 font-mono text-slate-400">{label}</p>
        {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
          <p key={i} className="font-mono" style={{ color: entry.color }}>
            {entry.name.toUpperCase()}: {entry.value.toFixed(4)} g
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LiveSwayChart({ data }: LiveSwayChartProps) {
  return (
    <div className="glass-card rounded-xl p-5 h-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-cyan-400/10 p-2">
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-slate-200 uppercase">
              Dynamic Building Sway
            </h2>
            <p className="text-[10px] tracking-widest text-slate-500 uppercase">
              MPU6050 · Live Vibration Telemetry
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-2.5 py-1 ring-1 ring-cyan-400/20">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 pulse-dot" />
          <span className="text-[10px] font-bold tracking-widest text-cyan-300 uppercase">Live</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-3 flex gap-4">
        {[
          { key: "x", color: "#22d3ee", label: "X-Axis" },
          { key: "y", color: "#a78bfa", label: "Y-Axis" },
          { key: "z", color: "#fb923c", label: "Z-Axis" },
        ].map((axis) => (
          <div key={axis.key} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: axis.color }} />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              {axis.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.06)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: "#475569", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(34,211,238,0.1)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#475569", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v.toFixed(2)}g`}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="x"
              name="X"
              stroke="#22d3ee"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="y"
              name="Y"
              stroke="#a78bfa"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="z"
              name="Z"
              stroke="#fb923c"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
