import { motion } from 'framer-motion';

export default function AuthShell({
  direction = 'left',
  eyebrow,
  title,
  description,
  children,
}) {
  const initialX = direction === 'right' ? 40 : -40;

  return (
    <motion.div
      initial={{ opacity: 0, x: initialX }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="min-h-screen relative overflow-hidden bg-brand-deep flex items-center justify-center px-4 py-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-slate-900 to-brand-deep" />

      <div className="absolute -top-44 -left-36 h-96 w-96 rounded-full bg-brand-blue/25 blur-3xl opacity-80" />
      <div className="absolute -bottom-44 -right-44 h-96 w-96 rounded-full bg-brand-orange/20 blur-3xl opacity-80" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-slate-800/30 blur-3xl opacity-40" />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07] md:opacity-[0.14]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(106,143,191,0.25) 0px, rgba(106,143,191,0.25) 1px, transparent 1px, transparent 72px), repeating-linear-gradient(0deg, rgba(106,143,191,0.18) 0px, rgba(106,143,191,0.18) 1px, transparent 1px, transparent 72px)',
        }}
      />
      <div
        className="login-bg-glow absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(70% 45% at 15% 20%, rgba(236,125,29,0.08) 0%, transparent 70%), radial-gradient(55% 40% at 80% 75%, rgba(106,143,191,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[26px] border border-slate-600/50 bg-gradient-to-b from-slate-900/80 to-slate-950/90 shadow-[0_32px_64px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="p-7 md:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-8">
              <div className="flex items-center justify-start mb-6">
                <motion.img
                  src="/rakshyanetra-brand.svg"
                  alt="Rakshyanetra"
                  className="h-14 md:h-16 w-auto"
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45 }}
                />
              </div>

              <motion.p
                className="text-[11px] tracking-[0.16em] uppercase text-brand-orange/90 font-semibold"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {eyebrow}
              </motion.p>

              <motion.h1
                className="login-hero-title mt-2 text-4xl md:text-5xl text-white leading-[1.02] tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                {title}
              </motion.h1>

              <motion.p
                className="text-base text-slate-300 mt-4 font-medium leading-relaxed max-w-[62ch]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {description}
              </motion.p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
