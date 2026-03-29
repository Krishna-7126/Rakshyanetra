// src/App.jsx
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar           from './components/TopBar';
import Sidebar          from './components/Sidebar';
import AlertToast       from './components/AlertToast';
import BlockOfflineState from './components/BlockOfflineState';
import FloatingParticles from './components/FloatingParticles';
import ToastContainer from './components/ToastContainer';
import SessionExpiryWarning from './components/SessionExpiryWarning';
import { useApp }       from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const Overview = lazy(() => import('./pages/Overview'));
const Vibration = lazy(() => import('./pages/Vibration'));
const Tilt = lazy(() => import('./pages/Tilt'));
const Stress = lazy(() => import('./pages/Stress'));
const AIPrediction = lazy(() => import('./pages/AIPrediction'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Config = lazy(() => import('./pages/Config'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.18 } },
};
function AnimatedPage({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
      {children}
    </motion.div>
  );
}

function PageLoader() {
  return (
    <div className="w-full min-h-[220px] flex items-center justify-center">
      <div className="num text-xs tracking-[0.14em] uppercase text-slate-500">Loading View...</div>
    </div>
  );
}

function MainContent() {
  const { activeBlock } = useApp();
  const location = useLocation();

  if (activeBlock !== 'A') {
    return (
      <motion.div key={`block-${activeBlock}`} variants={pageVariants} initial="initial" animate="animate" className="w-full">
        <BlockOfflineState block={activeBlock} />
      </motion.div>
    );
  }
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

function AppLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Fixed animated particle background — sits behind everything */}
      <FloatingParticles />

      <SessionExpiryWarning />
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        <Sidebar />
        <main className="flex-1 w-full overflow-y-auto p-4 relative">
          <AlertToast />
          <MainContent />
        </main>
      </div>
    </div>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    const publicRoutes = ['/login', '/signup'];
    
    // If unauthenticated outside public route, redirect to login with location state
    if (!user && !publicRoutes.includes(location.pathname)) {
      navigate('/login', { replace: true, state: { from: location } });
    }
    
    // If authenticated and on login/signup, redirect to dashboard
    if (user && ['/', '/login', '/signup'].includes(location.pathname)) {
      if (location.pathname !== '/') navigate('/', { replace: true });
    }
  }, [user, loading, location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-deep text-slate-300">
        <div className="num text-sm tracking-[0.2em] uppercase">Initializing Console...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/*" element={user ? <AppLayout /> : <Login />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastContainer />
        <AuthGate />
      </ToastProvider>
    </AuthProvider>
  );
}
