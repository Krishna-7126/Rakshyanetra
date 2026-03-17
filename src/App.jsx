// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar           from './components/TopBar';
import Sidebar          from './components/Sidebar';
import AlertToast       from './components/AlertToast';
import BlockOfflineState from './components/BlockOfflineState';
import FloatingParticles from './components/FloatingParticles';
import { useApp }       from './context/AppContext';
import Overview         from './pages/Overview';
import Vibration        from './pages/Vibration';
import Tilt             from './pages/Tilt';
import Stress           from './pages/Stress';
import AIPrediction     from './pages/AIPrediction';
import Analytics        from './pages/Analytics';
import Config           from './pages/Config';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.18 } },
};
function AnimatedPage({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
      {children}
    </motion.div>
  );
}

function MainContent() {
  const { activeBlock } = useApp();
  const location = useLocation();
  if (activeBlock !== 'A') {
    return (
      <motion.div key={`block-${activeBlock}`} variants={pageVariants} initial="initial" animate="animate" className="h-full">
        <BlockOfflineState block={activeBlock} />
      </motion.div>
    );
  }
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"          element={<AnimatedPage><Overview /></AnimatedPage>} />
        <Route path="/vibration" element={<AnimatedPage><Vibration /></AnimatedPage>} />
        <Route path="/tilt"      element={<AnimatedPage><Tilt /></AnimatedPage>} />
        <Route path="/stress"    element={<AnimatedPage><Stress /></AnimatedPage>} />
        <Route path="/ai"        element={<AnimatedPage><AIPrediction /></AnimatedPage>} />
        <Route path="/analytics" element={<AnimatedPage><Analytics /></AnimatedPage>} />
        <Route path="/config"    element={<AnimatedPage><Config /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Fixed animated particle background — sits behind everything */}
      <FloatingParticles />

      <TopBar />
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        <Sidebar />
        <main className="flex-1 min-h-screen w-full overflow-y-auto p-4 relative">
          <AlertToast />
          <MainContent />
        </main>
      </div>
    </div>
  );
}
