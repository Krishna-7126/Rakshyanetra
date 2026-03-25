import { detectAnomaly } from './anomalyDetection.js';

// We need at least 5 points to establish a baseline
const normalHistory = [
  { base: { vib_rms: 0.1 }, top: { vib_rms: 0.1, tilt_x: 0, tilt_y: 0 }, vibrationAmplificationRatio: 1.0 },
  { base: { vib_rms: 0.12 }, top: { vib_rms: 0.11, tilt_x: 0.01, tilt_y: -0.01 }, vibrationAmplificationRatio: 1.05 },
  { base: { vib_rms: 0.09 }, top: { vib_rms: 0.1, tilt_x: 0, tilt_y: 0.02 }, vibrationAmplificationRatio: 0.95 },
  { base: { vib_rms: 0.11 }, top: { vib_rms: 0.12, tilt_x: -0.01, tilt_y: 0 }, vibrationAmplificationRatio: 1.02 },
  { base: { vib_rms: 0.1 }, top: { vib_rms: 0.1, tilt_x: 0, tilt_y: 0 }, vibrationAmplificationRatio: 1.0 },
];

console.log("--- Testing Anomaly Detection ---");

// Test 1: Normal behavior (adding another normal reading)
const noAnomalyData = [...normalHistory, { 
  base: { vib_rms: 0.11 }, 
  top: { vib_rms: 0.12, tilt_x: 0.01, tilt_y: 0 }, 
  vibrationAmplificationRatio: 1.01 
}];
console.log(`Normal state confidence: ${detectAnomaly(noAnomalyData)}%`);

// Test 2: High vibration anomaly (sudden spike)
const highVibData = [...normalHistory, { 
  base: { vib_rms: 0.8 }, 
  top: { vib_rms: 1.5, tilt_x: 0.5, tilt_y: -0.3 }, 
  vibrationAmplificationRatio: 2.5 
}];
console.log(`Anomaly confidence (Vibration Spike): ${detectAnomaly(highVibData)}%`);
