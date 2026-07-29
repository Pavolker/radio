import React, { useEffect, useRef } from 'react';
import { useRadioStore } from '../lib/store';
import { audioEngine } from '../lib/audioEngine';

interface AudioVisualizerProps {
  height?: number;
  className?: string;
  compact?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  height = 160,
  className = '',
  compact = false
}) => {
  const { visualizerMode, isPlaying, tracks, currentTrackIndex, theme } = useRadioStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentTrack = tracks[currentTrackIndex];
  const accentColor = currentTrack?.accentColor || '#06b6d4';
  const secondaryColor = currentTrack?.secondaryColor || '#ec4899';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let peaks: number[] = new Array(32).fill(0);

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = height;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Get real or synthetic audio frequency & waveform
      const freqData = audioEngine.getFrequencyData();
      const waveData = audioEngine.getWaveformData();

      if (visualizerMode === 'spectrum') {
        // --- 1. SPECTRUM FREQUENCY BARS ---
        const barCount = compact ? 24 : 36;
        const barWidth = (w / barCount) - 3;
        const step = Math.floor(freqData.length / barCount);

        for (let i = 0; i < barCount; i++) {
          const val = isPlaying ? freqData[i * step] || 0 : 4;
          const barHeight = Math.max(4, (val / 255) * (h - 20));
          const x = i * (barWidth + 3) + 2;
          const y = h - barHeight;

          // Peak holding caps
          if (val > (peaks[i] || 0)) {
            peaks[i] = val;
          } else {
            peaks[i] = Math.max(0, (peaks[i] || 0) - 3);
          }
          const peakY = h - (peaks[i] / 255) * (h - 20) - 4;

          // Gradient bar fill
          const grad = ctx.createLinearGradient(x, h, x, y);
          grad.addColorStop(0, accentColor);
          grad.addColorStop(1, secondaryColor);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Peak cap
          ctx.fillStyle = secondaryColor;
          ctx.fillRect(x, Math.max(0, peakY), barWidth, 2);
        }
      } else if (visualizerMode === 'waveform') {
        // --- 2. OSCILLOSCOPE WAVEFORM ---
        ctx.lineWidth = compact ? 2 : 3;
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, accentColor);
        grad.addColorStop(0.5, secondaryColor);
        grad.addColorStop(1, accentColor);
        ctx.strokeStyle = grad;

        ctx.beginPath();
        const sliceWidth = w / waveData.length;
        let x = 0;

        for (let i = 0; i < waveData.length; i++) {
          const v = isPlaying ? waveData[i] / 128.0 : 1.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Glow effect
        ctx.shadowBlur = 12;
        ctx.shadowColor = accentColor;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (visualizerMode === 'aurora') {
        // --- 3. RADIAL AURORA RING ---
        const centerX = w / 2;
        const centerY = h / 2;
        const baseRadius = Math.min(w, h) * 0.28;
        const sliceCount = 64;

        ctx.save();
        ctx.translate(centerX, centerY);

        const grad = ctx.createRadialGradient(0, 0, baseRadius * 0.5, 0, 0, baseRadius * 1.8);
        grad.addColorStop(0, accentColor + '20');
        grad.addColorStop(0.7, secondaryColor + '80');
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        for (let i = 0; i < sliceCount; i++) {
          const angle = (i / sliceCount) * Math.PI * 2;
          const dataIdx = Math.floor((i / sliceCount) * freqData.length);
          const amp = isPlaying ? (freqData[dataIdx] / 255) * 45 : 3;
          const r = baseRadius + amp;

          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      } else if (visualizerMode === 'vumeter') {
        // --- 4. ANALOG VU METER DUAL NEEDLES ---
        const meterWidth = Math.min((w - 40) / 2, 220);
        const meterHeight = h - 20;

        // Calculate stereo signal levels
        let sumL = 0, sumR = 0;
        const half = Math.floor(freqData.length / 2);
        for (let i = 0; i < half; i++) sumL += freqData[i];
        for (let i = half; i < freqData.length; i++) sumR += freqData[i];

        const avgL = isPlaying ? (sumL / half) / 255 : 0.05;
        const avgR = isPlaying ? (sumR / half) / 255 : 0.05;

        const drawSingleMeter = (startX: number, label: string, level: number) => {
          // Meter background box
          ctx.fillStyle = theme === 'dark' ? '#11131f' : '#e2e8f0';
          ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(startX, 10, meterWidth, meterHeight, 8);
          ctx.fill();
          ctx.stroke();

          // Label
          ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#475569';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`VU METER ${label}`, startX + 12, 28);

          // Arc scale
          const pivotX = startX + meterWidth / 2;
          const pivotY = 10 + meterHeight + 15;
          const radius = meterHeight * 0.85;

          ctx.beginPath();
          ctx.arc(pivotX, pivotY, radius, Math.PI * 1.25, Math.PI * 1.75);
          ctx.strokeStyle = theme === 'dark' ? '#334155' : '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Needle angle (-45 deg to +45 deg)
          const angle = Math.PI * 1.25 + level * (Math.PI * 0.5);
          const needleX = pivotX + Math.cos(angle) * radius;
          const needleY = pivotY + Math.sin(angle) * radius;

          ctx.beginPath();
          ctx.moveTo(pivotX, pivotY);
          ctx.lineTo(needleX, needleY);
          ctx.strokeStyle = level > 0.85 ? '#ef4444' : accentColor;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Needle Pivot Knob
          ctx.beginPath();
          ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#64748b';
          ctx.fill();
        };

        const leftX = (w / 2) - meterWidth - 10;
        const rightX = (w / 2) + 10;
        drawSingleMeter(leftX, 'LEFT', avgL);
        drawSingleMeter(rightX, 'RIGHT', avgR);
      } else if (visualizerMode === 'particles') {
        // --- 5. MATRIX CYBER PARTICLES ---
        const cols = compact ? 20 : 32;
        const colWidth = w / cols;
        for (let i = 0; i < cols; i++) {
          const val = isPlaying ? freqData[i * 2] || 10 : 10;
          const count = Math.floor((val / 255) * 8);
          for (let c = 0; c < count; c++) {
            const px = i * colWidth + colWidth / 2;
            const py = h - (c * 18) - 10;
            ctx.fillStyle = c > 6 ? '#ef4444' : c > 4 ? secondaryColor : accentColor;
            ctx.beginPath();
            ctx.arc(px, py, compact ? 2.5 : 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [visualizerMode, isPlaying, accentColor, secondaryColor, compact, height, theme]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full block" />
    </div>
  );
};
