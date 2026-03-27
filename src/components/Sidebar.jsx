// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Activity, GitMerge, Layers,
  Brain, BarChart2, Settings, Building2,
} from 'lucide-react';

const sensorLinks = [
  { to: '/',          icon: LayoutDashboard, label: 'Overview' },
  { to: '/vibration', icon: Activity,        label: 'Vibration' },
  { to: '/tilt',      icon: GitMerge,        label: 'Tilt / Inclination' },
  { to: '/stress',    icon: Layers,          label: 'Structural Stress' },
];
const systemLinks = [
  { to: '/ai',        icon: Brain,    label: 'AI Prediction' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/config',    icon: Settings, label: 'System Config' },
];

const statusCfg = {
  ONLINE:          { text: 'ACTIVE',   cls: 'text-cyan-400',   border: 'border-cyan-500/30',   bg: 'bg-cyan-500/10' },
  DEGRADED:        { text: 'DEGRADED', cls: 'text-amber-400',  border: 'border-amber-500/30',  bg: 'bg-amber-500/10' },
  'SYSTEM OFFLINE':{ text: 'OFFLINE',  cls: 'text-slate-500',  border: 'border-slate-600/40',  bg: '' },
};

function BlockBadge({ status }) {
  const cfg = statusCfg[status] ?? statusCfg['SYSTEM OFFLINE'];
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest border ${cfg.cls} ${cfg.border} ${cfg.bg}`}>
      {cfg.text}
    </span>
  );
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to} end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative
         ${isActive
           ? 'text-white'
           : 'text-slate-300 hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(90deg, rgba(26,60,120,0.33), rgba(15,47,99,0.2))',
                border: '1px solid rgba(106,143,191,0.35)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
            />
          )}
          <Icon size={15} className="flex-shrink-0 relative z-10 transition-all group-hover:scale-110 text-brand-orange" />
          <span className="relative z-10 truncate">{label}</span>
          {isActive && (
            <div
              className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
              style={{ background: 'linear-gradient(180deg, #EC7D1D, #1A3C78)' }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.16em] mb-2 px-2 flex items-center gap-2">
      <span className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(106,143,191,0.35), transparent)' }} />
      {children}
    </p>
  );
}

export default function Sidebar() {
  const { globalStatus, activeBlock, setActiveBlock } = useApp();
  const navigate = useNavigate();

  const selectBlock = (block) => { setActiveBlock(block); navigate('/'); };

  const blocks = [
    { key: 'A', status: globalStatus, live: true },
    { key: 'B', status: 'SYSTEM OFFLINE', live: false },
    { key: 'C', status: 'SYSTEM OFFLINE', live: false },
  ];

  return (
    <aside
      className="sidebar-border w-64 flex-shrink-0 flex flex-col py-4 px-3 overflow-y-auto relative z-10"
      style={{
        background: 'linear-gradient(180deg, rgba(8,23,43,0.97) 0%, rgba(5,16,32,0.96) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="mb-5">
        <SectionLabel>Buildings</SectionLabel>
        {blocks.map(({ key, status, live }) => (
          <button
            key={key}
            onClick={() => selectBlock(key)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1
                         transition-all duration-200 text-left relative overflow-hidden
                         ${activeBlock === key ? '' : 'hover:bg-white/5'}
                         ${!live ? 'opacity-50 hover:opacity-70' : ''}`}
            style={activeBlock === key ? {
              background: 'linear-gradient(90deg, rgba(26,60,120,0.3), rgba(15,47,99,0.18))',
              border: '1px solid rgba(106,143,191,0.32)',
            } : { border: '1px solid transparent' }}
          >
            <div className="flex items-center gap-2">
              <Building2 size={14} style={{ color: live ? '#EC7D1D' : '#64748b' }} />
              <span className={`text-sm font-medium ${live ? 'text-slate-200' : 'text-slate-500'}`}>
                Block {key}
              </span>
            </div>
            <BlockBadge status={status} />
          </button>
        ))}
      </div>

      {/* Sensor Analysis */}
      <div className={`mb-5 transition-opacity duration-300 ${activeBlock !== 'A' ? 'opacity-25 pointer-events-none' : ''}`}>
        <SectionLabel>Sensor Analysis</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {sensorLinks.map(l => <NavItem key={l.to} {...l} />)}
        </div>
      </div>

      {/* System */}
      <div className={`transition-opacity duration-300 ${activeBlock !== 'A' ? 'opacity-25 pointer-events-none' : ''}`}>
        <SectionLabel>System</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {systemLinks.map(l => <NavItem key={l.to} {...l} />)}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-5">
        <div
          className="h-px mb-3 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(236,125,29,0.35), transparent)' }}
        />
        <p className="text-[9px] text-slate-500 text-center tracking-[0.16em] uppercase">
          Structural Health Intelligence v1.0
        </p>
      </div>
    </aside>
  );
}
