// src/context/AppContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useNodeStatus } from '../hooks/useNodeStatus';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { data, connected, forceRefresh } = useFirebase();
  const { baseOnline, topOnline, globalStatus } = useNodeStatus(data);
  const [alertHistory, setAlertHistory] = useState([]);
  // activeBlock: 'A' | 'B' | 'C'  — only A has live sensors
  const [activeBlock, setActiveBlock] = useState('A');

  const pushAlert = useCallback((msg) => {
    setAlertHistory((prev) => [
      { id: Date.now(), msg, ts: new Date().toLocaleTimeString() },
      ...prev.slice(0, 49),
    ]);
  }, []);

  return (
    <AppContext.Provider value={{
      data, connected, forceRefresh,
      baseOnline, topOnline, globalStatus,
      alertHistory, pushAlert,
      activeBlock, setActiveBlock,
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
