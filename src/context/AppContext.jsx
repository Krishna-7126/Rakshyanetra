// src/context/AppContext.jsx
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useNodeStatus } from '../hooks/useNodeStatus';
import { detectAnomaly } from '../utils/anomalyDetection';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { data, connected, forceRefresh } = useFirebase();
  const { baseOnline, topOnline, globalStatus } = useNodeStatus(data);
  const [alertHistory, setAlertHistory] = useState([]);
  const [activeBlock, setActiveBlock] = useState('A');

  const telemetryHistoryRef = useRef([]);
  const lastTsRef = useRef(0);
  const [anomalyConfidence, setAnomalyConfidence] = useState(0);

  // True Edge Computing: frontend is Read-Only, but acts as a Watchdog sanitizer.
  // If a node is offline, we zero out its display values here at the root context.
  const derivedData = (() => {
    if (!data) return data;
    const { base, top, diff, alerts } = data;
    const bothOffline = !baseOnline && !topOnline;

    const baseRms = baseOnline ? (base?.vib_rms ?? 0) : 0;
    const topRms = topOnline ? (top?.vib_rms ?? 0) : 0;
    const vibrationAmplificationRatio = topRms / (baseRms || 1);

    return {
      base: {
        ...base,
        vib_rms:      baseRms,
        stress_proxy: baseOnline ? (base?.stress_proxy ?? 0) : 0,
      },
      top: {
        ...top,
        vib_rms: topRms,
        tilt_x:  topOnline ? (top?.tilt_x ?? 0) : 0,
        tilt_y:  topOnline ? (top?.tilt_y ?? 0) : 0,
      },
      diff: {
        ...diff,
        vib_ratio: bothOffline ? 0 : (diff?.vib_ratio ?? 0),
      },
      alerts: {
        ...alerts,
        // Override display score/status if the entire system is down
        health_score:    bothOffline ? '---' : (alerts?.health_score ?? 100),
        building_status: bothOffline ? 'SYSTEM OFFLINE' : (alerts?.building_status ?? 'normal'),
      },
      vibrationAmplificationRatio
    };
  })();

  useEffect(() => {
    if (!derivedData) return;
    const currentTs = Math.max(derivedData.base?.ts || 0, derivedData.top?.ts || 0);
    // Push new point if timestamp advanced or if it's the very first point
    if (currentTs > lastTsRef.current || telemetryHistoryRef.current.length === 0) {
      if (currentTs > 0) lastTsRef.current = currentTs;
      telemetryHistoryRef.current = [...telemetryHistoryRef.current, derivedData].slice(-50);
      const conf = detectAnomaly(telemetryHistoryRef.current);
      setAnomalyConfidence(conf);
    }
  }, [derivedData]);

  const pushAlert = useCallback((msg) => {
    setAlertHistory((prev) => [
      { id: Date.now(), msg, ts: new Date().toLocaleTimeString() },
      ...prev.slice(0, 49),
    ]);
  }, []);

  return (
    <AppContext.Provider value={{
      data: derivedData, connected, forceRefresh,
      baseOnline, topOnline, globalStatus,
      alertHistory, pushAlert,
      activeBlock, setActiveBlock,
      anomalyConfidence,
      vibrationAmplificationRatio: derivedData?.vibrationAmplificationRatio ?? 0,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
