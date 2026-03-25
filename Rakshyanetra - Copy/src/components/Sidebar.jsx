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

function BlockBadge({ status }) {
  if (status === 'ONLINE')
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 tracking-widest">ACTIVE</span>;
  if (status === 'DEGRADED')
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 tracking-widest">DEGRADED</span>;
  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-600/40 text-slate-500 tracking-widest">OFFLINE</span>;
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group
         ${isActive
           ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
           : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`
      }
    >
      <Icon size={15} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { globalStatus, activeBlock, setActiveBlock } = useApp();
  const navigate = useNavigate();

  const selectBlock = (block) => {
    setActiveBlock(block);
    navigate('/'); // always navigate to overview on block switch
  };

  const blocks = [
    { key: 'A', badge: globalStatus, live: true },
    { key: 'B', badge: 'OFFLINE',    live: false },
    { key: 'C', badge: 'OFFLINE',    live: false },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-bg-panel border-r border-border-dim flex flex-col py-4 px-3 overflow-y-auto z-10">
      {/* Buildings */}
      <div className="mb-5">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-1">Buildings</p>
        {blocks.map(({ key, badge, live }) => (
          <button
            key={key}
            onClick={() => selectBlock(key)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1
                         transition-all duration-200 text-left
                         ${activeBlock === key
                           ? 'bg-blue-500/10 border border-blue-500/25 ring-1 ring-blue-500/10'
                           : 'hover:bg-white/5 border border-transparent'
                         }
                         ${!live ? 'opacity-50 hover:opacity-70' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Building2 size={14} className={live ? 'text-blue-400' : 'text-slate-500'} />
              <span className={`text-sm font-medium ${live ? 'text-slate-300' : 'text-slate-500'}`}>
                Block {key}
              </span>
            </div>
            {live ? <BlockBadge status={badge} /> : (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700/40 text-slate-600 tracking-widest">OFFLINE</span>
            )}
          </button>
        ))}
      </div>

      {/* Sensor Analysis — only visible/enabled when Block A active */}
      <div className={`mb-5 transition-opacity duration-300 ${activeBlock !== 'A' ? 'opacity-30 pointer-events-none' : ''}`}>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-1">Sensor Analysis</p>
        <div className="flex flex-col gap-0.5">
          {sensorLinks.map((l) => <NavItem key={l.to} {...l} />)}
        </div>
      </div>

      {/* System */}
      <div className={`transition-opacity duration-300 ${activeBlock !== 'A' ? 'opacity-30 pointer-events-none' : ''}`}>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-1">System</p>
        <div className="flex flex-col gap-0.5">
          {systemLinks.map((l) => <NavItem key={l.to} {...l} />)}
        </div>
      </div>

      <div className="mt-auto pt-4 text-[10px] text-slate-700 text-center tracking-widest">
        RAKSHYANETRA v1.0
      </div>
    </aside>
  );
}
