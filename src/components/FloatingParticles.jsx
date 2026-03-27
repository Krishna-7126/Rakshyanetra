// src/components/FloatingParticles.jsx
// Animated canvas background: glowing cyan/blue/violet dots that slowly drift upward
// with connecting lines, giving a floating neural/holographic feel
import { useEffect, useRef } from 'react';

const COLORS = [
  'rgba(106,143,191,',
  'rgba(26,60,120,',
  'rgba(236,125,29,',
  'rgba(148,173,205,',
];

export default function FloatingParticles() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate particles
    const N = 44;
    const particles = Array.from({ length: N }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      vy:   -(Math.random() * 0.18 + 0.04),
      vx:   (Math.random() - 0.5) * 0.08,
      r:    Math.random() * 1.2 + 0.35,
      a:    Math.random() * 0.35 + 0.08,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,       // for sine wobble
    }));

    let frame = 0;
    let raf;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update positions
      particles.forEach(p => {
        p.x += p.vx + Math.sin(frame * 0.008 + p.phase) * 0.08;
        p.y += p.vy;
        if (p.y < -10)           p.y = canvas.height + 10;
        if (p.x < -10)           p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });

      // Draw connections
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 92) {
            const alpha = (1 - dist / 92) * 0.06;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(106,143,191,${alpha})`;
            ctx.lineWidth = 0.45;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach(p => {
        // Subtle glow: two layered circles
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${(p.a * 0.12).toFixed(3)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.a.toFixed(2)})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.45 }}
    />
  );
}
