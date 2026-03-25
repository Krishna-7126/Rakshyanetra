/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Updated deep dark palette
        'bg-primary':  '#0B0F19',
        'bg-card':     '#111827',
        'bg-panel':    '#0D1117',
        'border-dim':  '#1F2937',
        // Neon accents (status-aware)
        'neon-green':  '#10B981',  // emerald-500
        'neon-blue':   '#3B82F6',  // blue-500
        'neon-red':    '#EF4444',  // red-500
        'neon-yellow': '#F59E0B',  // amber-500
        'neon-cyan':   '#06B6D4',  // cyan-500
        'neon-orange': '#F97316',  // orange-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Rajdhani', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
