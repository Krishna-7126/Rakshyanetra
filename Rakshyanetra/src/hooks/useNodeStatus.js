// src/hooks/useNodeStatus.js
import { useEffect, useState } from 'react';

const TIMEOUT_SEC = 15; // 15s allows for NTP jitter & network latency

function deriveGlobalStatus(baseOnline, topOnline) {
  if (baseOnline && topOnline)   return 'ONLINE';
  if (!baseOnline && !topOnline) return 'SYSTEM OFFLINE';
  return 'DEGRADED';
}

export function useNodeStatus(data) {
  const [baseOnline, setBaseOnline] = useState(false);
  const [topOnline,  setTopOnline]  = useState(false);
  const [globalStatus, setGlobalStatus] = useState('SYSTEM OFFLINE');

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const bTs = data?.base?.ts ?? 0;
      const tTs = data?.top?.ts  ?? 0;

      const bOnline = bTs > 0 && (now - bTs) <= TIMEOUT_SEC;
      const tOnline = tTs > 0 && (now - tTs) <= TIMEOUT_SEC;

      setBaseOnline(bOnline);
      setTopOnline(tOnline);
      setGlobalStatus(deriveGlobalStatus(bOnline, tOnline));
    };

    tick(); // run immediately
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data?.base?.ts, data?.top?.ts]);

  return { baseOnline, topOnline, globalStatus };
}
