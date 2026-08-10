import React, { useEffect, useRef, useMemo } from 'react';
import { useRadioStore } from '../lib/store';

// Detecta se é dispositivo mobile (touch + viewport pequeno)
function isMobileDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
  );
}

export const DynamicBackground: React.FC = () => {
  const { tracks, currentTrackIndex, isPlaying, theme } = useRadioStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mobile = useMemo(() => isMobileDevice(), []);

  const currentTrack = tracks[currentTrackIndex];
  const accentColor = currentTrack?.accentColor || '#ec4899';
  const secondaryColor = currentTrack?.secondaryColor || '#06b6d4';

  // --- MOBILE: CSS animated gradient (GPU-accelerated, zero JS per frame) ---
  if (mobile) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 opacity-90"
        style={{
          background: `linear-gradient(135deg, #050505 0%, ${accentColor}08 35%, ${secondaryColor}06 65%, #050505 100%)`,
          backgroundSize: '400% 400%',
          animation: isPlaying ? 'mobileAurora 12s ease infinite' : 'mobileAurora 20s ease infinite',
        }}
      />
    );
  }

  // --- DESKTOP: Canvas com animação full (performance desktop aguenta) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Particles array
    const particleCount = 40;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += isPlaying ? 0.008 : 0.002;
      const w = canvas.width;
      const h = canvas.height;

      // Base background fill based on theme
      if (theme === 'dark') {
        ctx.fillStyle = '#050505';
      } else {
        ctx.fillStyle = '#0a0a0f';
      }
      ctx.fillRect(0, 0, w, h);

      // Create animated morphing gradient radial orbs
      const orb1X = w * 0.3 + Math.sin(time) * 120;
      const orb1Y = h * 0.3 + Math.cos(time * 0.8) * 100;
      const orb1Radius = Math.min(w, h) * 0.55;

      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, orb1Radius);
      grad1.addColorStop(0, accentColor + (theme === 'dark' ? '30' : '18'));
      grad1.addColorStop(0.6, accentColor + '08');
      grad1.addColorStop(1, 'transparent');

      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(orb1X, orb1Y, orb1Radius, 0, Math.PI * 2);
      ctx.fill();

      // Secondary orb
      const orb2X = w * 0.7 + Math.cos(time * 0.7) * 140;
      const orb2Y = h * 0.65 + Math.sin(time * 0.9) * 120;
      const orb2Radius = Math.min(w, h) * 0.6;

      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, orb2Radius);
      grad2.addColorStop(0, secondaryColor + (theme === 'dark' ? '28' : '15'));
      grad2.addColorStop(0.6, secondaryColor + '05');
      grad2.addColorStop(1, 'transparent');

      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(orb2X, orb2Y, orb2Radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw subtle Cyber grid overlay
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw subtle floating cosmic dust particles
      particles.forEach((p) => {
        p.x += p.speedX * (isPlaying ? 1.5 : 0.5);
        p.y += p.speedY * (isPlaying ? 1.5 : 0.5);

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.fillStyle = accentColor;
        ctx.globalAlpha = p.alpha * (theme === 'dark' ? 0.6 : 0.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [accentColor, secondaryColor, isPlaying, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 opacity-90"
    />
  );
};
