import { useEffect, useRef } from 'react';
import { evalSurfaceDisplacement, type SensorSimState } from './TactileSensor3D';

interface SimulatedCameraCanvasProps {
  state: SensorSimState;
}

export function SimulatedCameraCanvas({ state }: SimulatedCameraCanvasProps) {
  const camCanvasRef = useRef<HTMLCanvasElement>(null);
  const estCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevHeightRef = useRef<Float32Array | null>(null);
  const eventEnergyRef = useRef<number[]>(new Array(48).fill(0));
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let rafId = 0;

    const render = () => {
      const s = stateRef.current;
      const camCanvas = camCanvasRef.current;
      const estCanvas = estCanvasRef.current;
      if (!camCanvas || !estCanvas) return;

      const ctx = camCanvas.getContext('2d');
      const ectx = estCanvas.getContext('2d');
      if (!ctx || !ectx) return;

      const W = camCanvas.width;
      const H = camCanvas.height;

      // Sample 48x48 height field for shading, events, and reconstruction
      const G = 48;
      const heights = new Float32Array(G * G);
      let maxDepth = 0;
      for (let iy = 0; iy < G; iy++) {
        for (let ix = 0; ix < G; ix++) {
          const x = -1.15 + (2.3 * ix) / (G - 1);
          const z = -1.15 + (2.3 * iy) / (G - 1);
          const { dy } = evalSurfaceDisplacement(x, z, s);
          heights[iy * G + ix] = dy;
          if (-dy > maxDepth) maxDepth = -dy;
        }
      }

      // --- PANEL A: Raw Camera View ---
      if (s.cue === 'shading') {
        // Photometric Stereo RGB directional lighting from gradients (gx, gy)
        const img = ctx.createImageData(W, H);
        const data = img.data;
        for (let py = 0; py < H; py++) {
          const gyIdx = Math.min(G - 2, Math.max(1, Math.floor((py / H) * (G - 1))));
          for (let px = 0; px < W; px++) {
            const gxIdx = Math.min(G - 2, Math.max(1, Math.floor((px / W) * (G - 1))));
            const gx = (heights[gyIdx * G + (gxIdx + 1)] - heights[gyIdx * G + (gxIdx - 1)]) * 14.0;
            const gy = (heights[(gyIdx + 1) * G + gxIdx] - heights[(gyIdx - 1) * G + gxIdx]) * 14.0;
            const nz = 1 / Math.sqrt(1 + gx * gx + gy * gy);
            const nx = -gx * nz;
            const ny = -gy * nz;

            // Three directional RGB LEDs at 120 deg intervals
            const r = Math.max(0, Math.min(255, 118 + 135 * (0.86 * nx + 0.5 * ny) + 25 * nz));
            const g = Math.max(0, Math.min(255, 118 + 135 * (-0.86 * nx + 0.5 * ny) + 25 * nz));
            const b = Math.max(0, Math.min(255, 128 + 135 * (-ny) + 32 * nz));
            const idx = (py * W + px) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
          }
        }
        ctx.putImageData(img, 0, 0);
      } else if (s.cue === 'marker') {
        ctx.fillStyle = '#EEF4F9';
        ctx.fillRect(0, 0, W, H);
        // Soft indentation shadow
        for (let iy = 0; iy < G; iy++) {
          for (let ix = 0; ix < G; ix++) {
            const d = -heights[iy * G + ix];
            if (d > 0.01) {
              ctx.fillStyle = `rgba(56, 130, 196, ${Math.min(0.45, d * 1.4)})`;
              ctx.fillRect((ix / G) * W, (iy / G) * H, W / G + 1, H / G + 1);
            }
          }
        }
        // Draw 9x9 reference + displaced markers & arrows
        const M = 9;
        for (let iy = 0; iy < M; iy++) {
          for (let ix = 0; ix < M; ix++) {
            const x = -0.95 + (1.9 * ix) / (M - 1);
            const z = -0.95 + (1.9 * iy) / (M - 1);
            const { dx, dz, stress } = evalSurfaceDisplacement(x, z, s);
            const px0 = ((x + 1.15) / 2.3) * W;
            const py0 = ((z + 1.15) / 2.3) * H;
            const px1 = ((x + dx * 1.2 + 1.15) / 2.3) * W;
            const py1 = ((z + dz * 1.2 + 1.15) / 2.3) * H;

            // Reference circle (dashed outline)
            ctx.beginPath();
            ctx.arc(px0, py0, 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(100,116,139,0.45)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Displacement arrow
            const mag = Math.hypot(px1 - px0, py1 - py0);
            if (mag > 1.5) {
              ctx.beginPath();
              ctx.moveTo(px0, py0);
              ctx.lineTo(px1, py1);
              ctx.strokeStyle = stress > 0.45 ? '#E07A2F' : '#2563EB';
              ctx.lineWidth = 1.6;
              ctx.stroke();
            }

            // Displaced marker dot
            ctx.beginPath();
            ctx.arc(px1, py1, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = stress > 0.45 ? '#D97706' : '#1E3A5F';
            ctx.fill();
          }
        }
      } else if (s.cue === 'multiview') {
        // Split Left/Right stereo viewpoints with depth-dependent parallax disparity
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, W, H);
        const half = W / 2;
        const views = [
          { label: 'Left View', offset: 0, parallax: -1 },
          { label: 'Right View', offset: half, parallax: 1 },
        ];
        views.forEach((v) => {
          ctx.save();
          ctx.beginPath();
          ctx.rect(v.offset + 2, 2, half - 4, H - 4);
          ctx.clip();
          ctx.fillStyle = '#E6F0F8';
          ctx.fillRect(v.offset + 2, 2, half - 4, H - 4);

          const M = 7;
          for (let iy = 0; iy < M; iy++) {
            for (let ix = 0; ix < M; ix++) {
              const x = -0.9 + (1.8 * ix) / (M - 1);
              const z = -0.9 + (1.8 * iy) / (M - 1);
              const { dy, dx, dz } = evalSurfaceDisplacement(x, z, s);
              const disparity = v.parallax * (-dy * 26); // stereo shift proportional to depth
              const px = v.offset + ((x + dx + 1.15) / 2.3) * half + disparity;
              const py = ((z + dz + 1.15) / 2.3) * H;
              ctx.beginPath();
              ctx.arc(px, py, 2.8 + -dy * 6, 0, Math.PI * 2);
              ctx.fillStyle = -dy > 0.04 ? (v.parallax < 0 ? '#0284C7' : '#7C3AED') : '#334155';
              ctx.fill();
            }
          }
          ctx.fillStyle = 'rgba(15,23,42,0.78)';
          ctx.fillRect(v.offset + 6, 6, 62, 16);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '600 10px Inter, sans-serif';
          ctx.fillText(v.label, v.offset + 11, 17);
          ctx.restore();
        });
      } else {
        // Brightness-Change Events (asynchronous ON/OFF spikes that decay to zero when static!)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
        ctx.fillRect(0, 0, W, H);
        const prev = prevHeightRef.current;
        let activeEvents = 0;

        if (prev) {
          for (let iy = 0; iy < G; iy++) {
            for (let ix = 0; ix < G; ix++) {
              const diff = heights[iy * G + ix] - prev[iy * G + ix];
              if (Math.abs(diff) > 0.0025) {
                activeEvents++;
                ctx.fillStyle = diff < 0 ? '#38BDF8' : '#F59E0B';
                ctx.fillRect((ix / G) * W, (iy / G) * H, W / G + 0.8, H / G + 0.8);
              }
            }
          }
        }
        // Subtle indicator when static
        const hist = eventEnergyRef.current;
        hist.push(Math.min(1, activeEvents / 80));
        if (hist.length > 48) hist.shift();

        // Draw bottom event-rate ribbon
        ctx.fillStyle = 'rgba(15,23,42,0.85)';
        ctx.fillRect(0, H - 28, W, 28);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        hist.forEach((val, idx) => {
          const rx = (idx / (hist.length - 1)) * W;
          const ry = H - 5 - val * 18;
          if (idx === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        });
        ctx.stroke();

        ctx.fillStyle = activeEvents > 0 ? '#38BDF8' : '#94A3B8';
        ctx.font = '500 10px JetBrains Mono, monospace';
        ctx.fillText(
          activeEvents > 0
            ? `EVENTS ACTIVE (${activeEvents * 14} ev/ms)`
            : 'STATIC HOLD: 0 EVENTS (move sliders!)',
          8,
          15
        );
      }
      prevHeightRef.current = heights;

      // --- PANEL B: Reconstructed Height / Traction Map ---
      const eW = estCanvas.width;
      const eH = estCanvas.height;
      ectx.fillStyle = '#0F172A';
      ectx.fillRect(0, 0, eW, eH);

      for (let iy = 0; iy < G; iy++) {
        for (let ix = 0; ix < G; ix++) {
          const d = Math.min(1, -heights[iy * G + ix] / 0.34);
          // Viridis-like perceptual ramp (deep navy -> teal -> warm amber)
          const r = Math.round(18 + 235 * Math.pow(d, 1.35));
          const g = Math.round(35 + 185 * Math.sin(d * Math.PI * 0.85));
          const b = Math.round(68 + 140 * (1 - d) * Math.sqrt(d + 0.05));
          ectx.fillStyle = `rgb(${r},${g},${b})`;
          ectx.fillRect((ix / G) * eW, (iy / G) * eH, eW / G + 1, eH / G + 1);
        }
      }

      // Overlay shear vector field on reconstructed map
      const M = 6;
      for (let iy = 0; iy < M; iy++) {
        for (let ix = 0; ix < M; ix++) {
          const x = -0.85 + (1.7 * ix) / (M - 1);
          const z = -0.85 + (1.7 * iy) / (M - 1);
          const { dx, dz } = evalSurfaceDisplacement(x, z, s);
          const px = ((x + 1.15) / 2.3) * eW;
          const py = ((z + 1.15) / 2.3) * eH;
          const mag = Math.hypot(dx, dz);
          if (mag > 0.015) {
            ectx.beginPath();
            ectx.moveTo(px, py);
            ectx.lineTo(px + dx * 44, py + dz * 44);
            ectx.strokeStyle = 'rgba(255,255,255,0.85)';
            ectx.lineWidth = 1.4;
            ectx.stroke();
          }
        }
      }
      ectx.fillStyle = 'rgba(15,23,42,0.75)';
      ectx.fillRect(6, 6, 118, 17);
      ectx.fillStyle = '#F8FAFC';
      ectx.font = '500 10px JetBrains Mono, monospace';
      ectx.fillText(`Peak depth: ${(maxDepth * 4.8).toFixed(2)} mm`, 11, 18);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            Step 3 · Raw Sensor View
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
            {state.cue === 'marker'
              ? 'Markers'
              : state.cue === 'shading'
              ? 'RGB Shading'
              : state.cue === 'multiview'
              ? 'Stereo Pair'
              : 'DVS Events'}
          </span>
        </div>
        <canvas
          ref={camCanvasRef}
          width={216}
          height={186}
          className="w-full rounded-lg border border-slate-200"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            Step 4 · Estimated Field
          </span>
          <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] text-[#2B5B84]">
            Depth + Shear
          </span>
        </div>
        <canvas
          ref={estCanvasRef}
          width={216}
          height={186}
          className="w-full rounded-lg border border-slate-200"
        />
      </div>
    </div>
  );
}
