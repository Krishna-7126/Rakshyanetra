// src/hooks/useFirebase.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { db } from '../firebase';
import { ref, onValue, off } from 'firebase/database';

const BASE_PATH   = 'buildings/building_01/sensors/base/latest';
const TOP_PATH    = 'buildings/building_01/sensors/top/latest';
const DIFF_PATH   = 'buildings/building_01/differential/latest';
const ALERTS_PATH = 'buildings/building_01/alerts';

const defaultBase = {
  vib_rms: 0, stress_proxy: 0, alert: false, sustained: false, ts: 0,
};
const defaultTop = {
  tilt_x: 0, tilt_y: 0, vib_rms: 0, alert: false, sustained: false, ts: 0,
};
const defaultDiff   = { vib_ratio: 0, ratio_alert: false };
const defaultAlerts = { building_status: 'normal', health_score: 0, base_status: 'normal', top_status: 'normal' };

export function useFirebase() {
  const [data, setData] = useState({
    base:   defaultBase,
    top:    defaultTop,
    diff:   defaultDiff,
    alerts: defaultAlerts,
  });
  const [connected, setConnected] = useState(false);

  // Refs hold latest raw values so we don't recreate listeners on every update
  const rawRef  = useRef({ base: defaultBase, top: defaultTop, diff: defaultDiff, alerts: defaultAlerts });
  const refsRef = useRef([]);  // Firebase db refs for cleanup

  const attach = useCallback(() => {
    // Cleanup previous listeners
    refsRef.current.forEach(({ dbRef }) => off(dbRef));
    refsRef.current = [];

    const makeRef = (path, key, defaults) => {
      const dbRef = ref(db, path);
      onValue(dbRef, (snap) => {
        const val = snap.val();
        rawRef.current[key] = val ? { ...defaults, ...val } : { ...defaults };
        setConnected(true);
        // Push to state immediately (ESP32 controls send rate)
        setData((prev) => ({ ...prev, [key]: rawRef.current[key] }));
      }, () => {
        setConnected(false);
      });
      return dbRef;
    };

    refsRef.current = [
      { dbRef: makeRef(BASE_PATH,   'base',   defaultBase) },
      { dbRef: makeRef(TOP_PATH,    'top',    defaultTop) },
      { dbRef: makeRef(DIFF_PATH,   'diff',   defaultDiff) },
      { dbRef: makeRef(ALERTS_PATH, 'alerts', defaultAlerts) },
    ];
  }, []);

  useEffect(() => {
    attach();
    return () => refsRef.current.forEach(({ dbRef }) => off(dbRef));
  }, [attach]);

  const forceRefresh = useCallback(() => {
    setData({ base: defaultBase, top: defaultTop, diff: defaultDiff, alerts: defaultAlerts });
    setConnected(false);
    attach();
  }, [attach]);

  return { data, connected, forceRefresh };
}
