/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep space dark palette
        'bg-primary':  '#030712',
        'bg-card':     '#0a1628',
        'bg-panel':    '#060f1e',
        'border-dim':  '#0f2a4a',
        // Teal / cyan (primary accent)
        'neon-cyan':   '#06B6D4',
        'neon-teal':   '#14B8A6',
        // Electric blue
        'neon-blue':   '#3B82F6',
        'neon-indigo': '#6366F1',
        // Status
        'neon-green':  '#10B981',
        'neon-yellow': '#F59E0B',
        'neon-red':    '#EF4444',
        // Violet for AI
        'neon-violet': '#8B5CF6',
        'neon-orange': '#F97316',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Rajdhani', 'monospace'],
      },
      backgroundImage: {
        'space-grad': 'linear-gradient(135deg, #030712 0%, #060f1e 30%, #081628 60%, #06101e 100%)',
        'teal-glow':  'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.08))',
        'card-grad':  'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(59,130,246,0.04) 100%)',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':       'float 6s ease-in-out infinite',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 8px rgba(6,182,212,0.4)' },
          '50%':     { boxShadow: '0 0 20px rgba(6,182,212,0.8)' },
        },
      },
    },
  },
  plugins: [],
};
