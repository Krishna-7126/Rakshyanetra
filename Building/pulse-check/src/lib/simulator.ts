import { db } from "./firebase";
import { ref, update } from "firebase/database";

/**
 * Pulse-Check Sensor Simulator
 * Generates realistic structural monitoring data for a high-rise building.
 */

const SIMULATION_INTERVAL = 1000; // 1 second

export const startSimulation = (nodeId: string = "building1") => {
  console.log(`[Simulator] Starting data stream for ${nodeId}...`);

  const nodeRef = ref(db, `/${nodeId}`);

  const interval = setInterval(() => {
    // Structural Metadata Simulator
    const baseVibration = 0.05 + Math.random() * 0.15; // 0.05 to 0.20 g
    const topVibration = baseVibration * (1.2 + Math.random() * 0.5); // Top vibrates more
    const baseStress = 15400 + Math.random() * 1000; // Newtons/mm^2
    const topTilt = (Math.random() - 0.5) * 0.8; // -0.4 to 0.4 degrees
    const temperature = 26 + Math.random() * 4; // 26 to 30 C
    
    // Anomaly logic: 5% chance of a "spike"
    const isAnomaly = Math.random() > 0.95;
    const anomalyScore = isAnomaly ? 0.75 + Math.random() * 0.2 : 0.1 + Math.random() * 0.3;

    const data = {
      baseVibration,
      topVibration,
      baseStress,
      topTilt,
      temperature,
      anomalyScore,
      lastUpdated: new Date().toISOString(),
      status: anomalyScore > 0.7 ? "warning" : "online",
    };

    update(nodeRef, data).catch((err) => {
      console.error("[Simulator] Error updating Firebase:", err);
    });
  }, SIMULATION_INTERVAL);

  return () => {
    console.log(`[Simulator] Stopping data stream for ${nodeId}.`);
    clearInterval(interval);
  };
};
