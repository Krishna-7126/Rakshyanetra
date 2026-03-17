"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { startSimulation } from "@/lib/simulator";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { format } from "date-fns";

interface TelemetryMetrics {
  baseVibration: number;
  baseStress: number;
  topVibration: number;
  topTilt: number;
  temperature: number;
  anomalyScore: number;
}

interface ChartDataPoint {
  time: string;
  base: number;
  top: number;
}

interface TelemetryContextType {
  metrics: TelemetryMetrics;
  chartData: ChartDataPoint[];
  isMounted: boolean;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const INITIAL_METRICS: TelemetryMetrics = {
  baseVibration: 0,
  baseStress: 0,
  topVibration: 0,
  topTilt: 0,
  temperature: 24,
  anomalyScore: 0.1,
};

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [metrics, setMetrics] = useState<TelemetryMetrics>(INITIAL_METRICS);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    setIsMounted(true);
    
    // Start simulation when running in non-production or if desired
    const stopSim = startSimulation("building1");
    return () => {
      stopSim();
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const buildingRef = ref(db, "/building1");
    const unsubscribe = onValue(buildingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newMetrics: TelemetryMetrics = {
          baseVibration: data.baseVibration || 0,
          baseStress: data.baseStress || 0,
          topVibration: data.topVibration || 0,
          topTilt: data.topTilt || 0,
          temperature: data.temperature || 24,
          anomalyScore: data.anomalyScore || 0.1,
        };
        setMetrics(newMetrics);
        
        // Update Chart Data
        const now = format(new Date(), "HH:mm:ss");
        setChartData((prev) => {
          const last = prev[prev.length - 1];
          let newDataPoint: ChartDataPoint;
          if (last && last.time === now) {
            newDataPoint = { ...last, base: newMetrics.baseVibration, top: newMetrics.topVibration };
            return [...prev.slice(0, -1), newDataPoint];
          } else {
            newDataPoint = { time: now, base: newMetrics.baseVibration, top: newMetrics.topVibration };
            const updated = [...prev, newDataPoint];
            return updated.slice(-60);
          }
        });
      }
    });

    return () => unsubscribe();
  }, [isMounted]);

  return (
    <TelemetryContext.Provider value={{ metrics, chartData, isMounted }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
