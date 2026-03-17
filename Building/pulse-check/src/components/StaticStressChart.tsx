"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Gauge } from "lucide-react";

export interface StressDataPoint {
  time: string;
  load: number;
  baseline: number;
}

interface StaticStressChartProps {
  data: StressDataPoint[];
  currentLoad: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 text-xs shadow-xl border border-cyan-400/10">
        <p className="mb-1.5 font-mono text-slate-400">{label}</p>
        {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
          <p key={i} className="font-mono" style={{ color: entry.color }}>
            {entry.name}: {Number(entry.value).toLocaleString()} kg
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function getLoadColor(load: number) {
  if (load > 18000) return { stroke: "#f87171", fill: "url(#stressGradientCritical)" };
  if (load > 14000) return { stroke: "#fbbf24", fill: "url(#stressGradientWarning)" };
  return { stroke: "#34d399", fill: "url(#stressGradientSafe)" };
}

export default function StaticStressChart({ data, currentLoad }: StaticStressChartProps) {
  const lc = getLoadColor(currentLoad);

  return (
    <div className="glass-card rounded-xl p-5 h-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-violet-400/10 p-2">
            <Gauge className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-slate-200 uppercase">
              Static Structural Stress
            </h2>
            <p className="text-[10px] tracking-widest text-slate-500 uppercase">
              HX711 · Strain Gauge Telemetry
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-violet-400/10 px-2.5 py-1 ring-1 ring-violet-400/20">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
          <span className="text-[10px] font-bold tracking-widest text-violet-300 uppercase">Live</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="stressGradientSafe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stressGradientWarning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stressGradientCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`}
              domain={[8000, 22000]}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Warning threshold reference line */}
            <ReferenceLine
              y={14000}
              stroke="#fbbf24"
              strokeDasharray="6 3"
              strokeOpacity={0.5}
              label={{ value: "WARN", position: "right", fontSize: 8, fill: "#fbbf24" }}
            />
            <ReferenceLine
              y={18000}
              stroke="#f87171"
              strokeDasharray="6 3"
              strokeOpacity={0.5}
              label={{ value: "CRIT", position: "right", fontSize: 8, fill: "#f87171" }}
            />
            <Area
              type="monotone"
              dataKey="load"
              name="Structural Load"
              stroke={lc.stroke}
              strokeWidth={2}
              fill={lc.fill}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
