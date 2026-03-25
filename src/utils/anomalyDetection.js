export const detectAnomaly = (history) => {
  if (!history || history.length < 5) return 0; // Need minimum samples for baseline

  // Features to monitor for anomalies
  const features = [
    { path: ['base', 'vib_rms'] },
    { path: ['top', 'vib_rms'] },
    { path: ['top', 'tilt_x'] },
    { path: ['top', 'tilt_y'] },
    { path: ['vibrationAmplificationRatio'] }
  ];

  const getVal = (obj, pathArray) => {
    let val = obj;
    for (const p of pathArray) {
      if (val == null) return 0;
      val = val[p];
    }
    return val ?? 0;
  };

  let maxZScore = 0;

  for (const feature of features) {
    const values = history.map(pt => Math.abs(getVal(pt, feature.path)));
    const latest = values[values.length - 1];
    
    // Calculate baseline without the latest point
    const baseline = values.slice(0, -1);
    
    // If not enough baseline points, skip
    if (baseline.length === 0) continue;

    const mean = baseline.reduce((sum, val) => sum + val, 0) / baseline.length;
    const variance = baseline.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / baseline.length;
    let stdDev = Math.sqrt(variance);

    // Baseline minimum limit to prevent division by zero or super sensitive static noise
    if (stdDev < 0.005) stdDev = 0.005;

    const zScore = Math.abs(latest - mean) / stdDev;
    if (zScore > maxZScore) maxZScore = zScore;
  }

  // Map Z-Score to Anomaly Confidence Percentage (0 - 100%)
  // Z=0 is 0%. Z > 4 is 100%.
  let confidence = (maxZScore / 4.0) * 100;
  
  // Add an initial deadband to ignore minor deviations (Z < 1.0)
  if (maxZScore < 1.0) {
    confidence = Math.max(0, confidence * 0.1); // significantly dampen low z-scores
  } else if (maxZScore >= 1.0 && maxZScore < 2.0) {
    // 25% confidence cap for Z < 2
    confidence = Math.min(49, confidence); 
  } else if (maxZScore >= 2.0 && maxZScore < 3.0) {
    // 50-75% band
    confidence = Math.min(74, confidence + 20);
  } else {
    // > 3.0 Z-Score
    confidence = Math.min(100, confidence + 30);
  }

  return Math.round(Math.min(100, Math.max(0, confidence)));
};
