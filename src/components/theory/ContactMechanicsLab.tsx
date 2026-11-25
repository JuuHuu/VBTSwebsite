import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { MathBlock } from '../MathBlock';
import {
  computeHertz,
  computeViscoelastic,
  computePartialSlip,
  computeBoussinesq,
  computeHelmholtzHodge,
  type Vector2D,
} from '../../physics/contactMechanics';

type ModelTab = 'hertz' | 'visco' | 'boussinesq' | 'hhd' | 'slip' | 'photometric';

const MODEL_TABS: { id: ModelTab; label: string; eqs: string }[] = [
  { id: 'hertz', label: 'Hertz Contact', eqs: 'Eqs. 1–2' },
  { id: 'visco', label: 'Linear Viscoelasticity', eqs: 'Eq. 3' },
  { id: 'boussinesq', label: 'Boussinesq / Green', eqs: 'Eqs. 4–5' },
  { id: 'hhd', label: 'Helmholtz–Hodge', eqs: 'Eq. 6' },
  { id: 'slip', label: 'Cattaneo–Mindlin Slip', eqs: 'Eqs. 7–8' },
  { id: 'photometric', label: 'Photometric Stereo', eqs: 'Eqs. 9–10' },
];

function VectorFieldPlot({
  title,
  subtitle,
  vectors,
  color,
}: {
  title: string;
  subtitle: string;
  vectors: Vector2D[];
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
      <div className="text-xs font-semibold text-slate-800">{title}</div>
      <div className="mb-1.5 text-[10px] text-slate-500">{subtitle}</div>
      <svg viewBox="-1.1 -1.1 2.2 2.2" className="h-36 w-full rounded bg-slate-50">
        <circle cx={0} cy={0} r={0.85} fill="none" stroke="#CBD5E1" strokeDasharray="0.06 0.05" strokeWidth={0.02} />
        {vectors.map((v, i) => {
          const ex = v.x + v.ux * 0.42;
          const ey = v.y + v.uy * 0.42;
          const mag = Math.hypot(v.ux, v.uy);
          return (
            <g key={i}>
              <circle cx={v.x} cy={v.y} r={0.025} fill="#94A3B8" />
              {mag > 0.02 && (
                <line
                  x1={v.x}
                  y1={v.y}
                  x2={ex}
                  y2={ey}
                  stroke={color}
                  strokeWidth={0.032}
                  strokeLinecap="round"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ContactMechanicsLab() {
  const [tab, setTab] = useState<ModelTab>('hertz');

  // Hertz state
  const [hForce, setHForce] = useState(4.0);
  const [hRadius, setHRadius] = useState(8.0);
  const [hModulus, setHModulus] = useState(120);
  const [hPadThick, setHPadThick] = useState(2.5);
  const [showFinitePad, setShowFinitePad] = useState(true);

  // Visco state
  const [vRate, setVRate] = useState(2.5);
  const [vHold, setVHold] = useState(2.0);
  const [vTau, setVTau] = useState(1.2);
  const [vFrac, setVFrac] = useState(0.45);

  // Boussinesq state
  const [bTwoPeaks, setBTwoPeaks] = useState(true);
  const [bNoise, setBNoise] = useState(0.025);
  const [bReg, setBReg] = useState(0.18);

  // HHD state
  const [hhdNormal, setHhdNormal] = useState(0.8);
  const [hhdTwist, setHhdTwist] = useState(0.6);
  const [hhdShearX, setHhdShearX] = useState(0.5);
  const [hhdShearY, setHhdShearY] = useState(-0.2);

  // Slip state
  const [sFn, setSFn] = useState(6.0);
  const [sFt, setSFt] = useState(2.6);
  const [sMu, setSMu] = useState(0.65);

  // Photometric state
  const [pHeight, setPHeight] = useState(0.8);
  const [pGlare, setPGlare] = useState(0.35);
  const [pSoftObj, setPSoftObj] = useState(false);

  const hertz = useMemo(
    () => computeHertz(hForce, hRadius, hModulus, 0.49, 200000, 0.3, hPadThick),
    [hForce, hRadius, hModulus, hPadThick]
  );

  const visco = useMemo(
    () => computeViscoelastic(vRate, vHold, vTau, vFrac),
    [vRate, vHold, vTau, vFrac]
  );

  const bouss = useMemo(
    () => computeBoussinesq(bTwoPeaks, bNoise, bReg),
    [bTwoPeaks, bNoise, bReg]
  );

  const hhd = useMemo(
    () => computeHelmholtzHodge(hhdNormal, hhdTwist, hhdShearX, hhdShearY),
    [hhdNormal, hhdTwist, hhdShearX, hhdShearY]
  );

  const slip = useMemo(() => computePartialSlip(sFn, sFt, sMu), [sFn, sFt, sMu]);

  // Photometric 1D cross-section profile
  const photoProfile = useMemo(() => {
    const N = 50;
    const pts = [];
    let zRec = 0;
    const dx = 2 / (N - 1);
    for (let i = 0; i < N; i++) {
      const x = -1 + i * dx;
      const objZ = Math.abs(x) < 0.65 ? pHeight * Math.cos((x / 0.65) * (Math.PI / 2)) : 0;
      const sensorZ = pSoftObj ? objZ * 0.58 : objZ;
      const gxTrue =
        Math.abs(x) < 0.65
          ? -(pSoftObj ? 0.58 : 1) * pHeight * (Math.PI / (2 * 0.65)) * Math.sin((x / 0.65) * (Math.PI / 2))
          : 0;
      // Glare / calibration bias introduces additive gradient error that integrates into low-freq drift
      const gxNoisy = gxTrue + pGlare * (0.35 * Math.exp(-Math.pow((x - 0.25) / 0.22, 2)) + 0.14);
      zRec += gxNoisy * dx;
      pts.push({ x, objZ, sensorZ, zRec: Math.max(-0.2, zRec) });
    }
    return pts;
  }, [pHeight, pGlare, pSoftObj]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-xl font-semibold text-slate-900">
            Interactive Contact Mechanics & Failure-Mode Lab
          </h3>
          <p className="text-sm text-slate-600">
            Explore all analytical foundations from Section 2.2 alongside the real-world physical breakdowns from Section 2.3.
          </p>
        </div>
      </div>

      {/* Model tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
        {MODEL_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? 'bg-[#1E3A5F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}{' '}
            <span className={`ml-1 font-mono text-[10px] ${tab === t.id ? 'text-sky-200' : 'text-slate-500'}`}>
              {t.eqs}
            </span>
          </button>
        ))}
      </div>

      {/* HERTZ */}
      {tab === 'hertz' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl bg-slate-50 p-3">
              <MathBlock
                display
                tex="a = \sqrt{R\delta}, \quad F_n = \frac{4}{3} E^*\sqrt{R}\,\delta^{3/2}, \quad \frac{1}{E^*} = \frac{1-\nu_1^2}{E_1} + \frac{1-\nu_2^2}{E_2}"
              />
            </div>
            <div className="space-y-3 text-xs">
              <label className="block">
                <div className="mb-1 flex justify-between">
                  <span className="font-medium text-slate-700">Normal Load <MathBlock tex="F_n" /></span>
                  <span className="font-mono text-slate-900">{hForce.toFixed(1)} N</span>
                </div>
                <input type="range" min={0.5} max={10} step={0.1} value={hForce} onChange={(e) => setHForce(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between">
                  <span className="font-medium text-slate-700">Indenter Radius <MathBlock tex="R" /></span>
                  <span className="font-mono text-slate-900">{hRadius.toFixed(1)} mm</span>
                </div>
                <input type="range" min={2} max={18} step={0.5} value={hRadius} onChange={(e) => setHRadius(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between">
                  <span className="font-medium text-slate-700">Elastomer Modulus <MathBlock tex="E_1" /></span>
                  <span className="font-mono text-slate-900">{hModulus} kPa</span>
                </div>
                <input type="range" min={40} max={350} step={10} value={hModulus} onChange={(e) => setHModulus(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between">
                  <span className="font-medium text-slate-700">Finite Pad Thickness <MathBlock tex="h" /></span>
                  <span className="font-mono text-slate-900">{hPadThick.toFixed(1)} mm</span>
                </div>
                <input type="range" min={1.0} max={8.0} step={0.2} value={hPadThick} onChange={(e) => setHPadThick(+e.target.value)} className="w-full" />
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-amber-900">
                <input type="checkbox" checked={showFinitePad} onChange={(e) => setShowFinitePad(e.target.checked)} />
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span className="font-medium">Show Sec. 2.3 Failure Mode: Rigid-Backing Stiffening</span>
              </label>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-7">
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <div className="text-[11px] text-slate-500">Indentation δ</div>
                <div className="font-mono text-base font-semibold text-[#1E3A5F]">{hertz.indentationMm.toFixed(2)} mm</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <div className="text-[11px] text-slate-500">Contact Radius a</div>
                <div className="font-mono text-base font-semibold text-[#1E3A5F]">{hertz.contactRadiusMm.toFixed(2)} mm</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <div className="text-[11px] text-slate-500">Peak Pressure p₀</div>
                <div className="font-mono text-base font-semibold text-[#1E3A5F]">{hertz.peakPressureKPa.toFixed(0)} kPa</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-700">
                <span>Normal Load vs. Indentation Depth</span>
                <div className="flex gap-3 text-[11px]">
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#2B5B84]" /> Ideal Hertz Half-Space</span>
                  {showFinitePad && <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#D97706]" /> Finite Pad on Rigid Backing</span>}
                </div>
              </div>
              <svg viewBox="0 0 420 200" className="w-full">
                {(() => {
                  const maxX = Math.max(...hertz.idealCurve.map((p) => p.delta), 1);
                  const maxY = Math.max(
                    ...hertz.idealCurve.map((p) => p.force),
                    ...(showFinitePad ? hertz.finitePadCurve.map((p) => Math.min(p.force, hForce * 3.2)) : [0]),
                    5
                  );
                  const sx = (d: number) => 42 + (d / maxX) * 360;
                  const sy = (f: number) => 172 - (Math.min(f, maxY) / maxY) * 150;
                  const idealPath = hertz.idealCurve.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.delta).toFixed(1)},${sy(p.force).toFixed(1)}`).join(' ');
                  const padPath = hertz.finitePadCurve.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.delta).toFixed(1)},${sy(p.force).toFixed(1)}`).join(' ');
                  return (
                    <>
                      <line x1={42} y1={172} x2={402} y2={172} stroke="#94A3B8" strokeWidth={1} />
                      <line x1={42} y1={22} x2={42} y2={172} stroke="#94A3B8" strokeWidth={1} />
                      <path d={idealPath} fill="none" stroke="#2B5B84" strokeWidth={2.4} />
                      {showFinitePad && <path d={padPath} fill="none" stroke="#D97706" strokeWidth={2.2} strokeDasharray="5 3" />}
                      <circle cx={sx(hertz.indentationMm)} cy={sy(hForce)} r={5} fill="#2B5B84" stroke="#fff" strokeWidth={1.5} />
                      <text x={220} y={194} textAnchor="middle" fontSize={10} fill="#475569">Indentation δ (mm)</text>
                      <text x={14} y={98} textAnchor="middle" fontSize={10} fill="#475569" transform="rotate(-90 14 98)">Force Fn (N)</text>
                    </>
                  );
                })()}
              </svg>
              <p className="mt-1 text-xs text-slate-600">
                <strong>Physical takeaway:</strong> When contact radius <MathBlock tex="a" /> approaches pad thickness <MathBlock tex="h" />, the rigid acrylic window prevents subsurface gel flow, making the pad feel much stiffer than Hertz predicts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VISCOELASTICITY */}
      {tab === 'visco' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl bg-slate-50 p-3">
              <MathBlock display tex="\sigma(t) = \int_0^t E_{\mathrm{rel}}(t - t')\,\dot{\varepsilon}(t')\,dt'" />
            </div>
            <div className="space-y-3 text-xs">
              <label className="block">
                <div className="mb-1 flex justify-between">
                  <span className="font-medium text-slate-700">Press / Release Speed</span>
                  <span className="font-mono">{vRate.toFixed(1)}×</span>
                </div>
                <input type="range" min={0.5} max={5} step={0.1} value={vRate} onChange={(e) => setVRate(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between">
                  <span className="font-medium text-slate-700">Sustained Hold Duration</span>
                  <span className="font-mono">{vHold.toFixed(1)} s</span>
                </div>
                <input type="range" min={0.5} max={4.0} step={0.1} value={vHold} onChange={(e) => setVHold(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between">
                  <span className="font-medium text-slate-700">Viscoelastic Fraction</span>
                  <span className="font-mono">{Math.round(vFrac * 100)}%</span>
                </div>
                <input type="range" min={0} max={0.75} step={0.05} value={vFrac} onChange={(e) => setVFrac(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between">
                  <span className="font-medium text-slate-700">Relaxation Time Constant</span>
                  <span className="font-mono">{vTau.toFixed(1)} s</span>
                </div>
                <input type="range" min={0.2} max={3.0} step={0.1} value={vTau} onChange={(e) => setVTau(+e.target.value)} className="w-full" />
              </label>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-700">
                <span>Press → Hold → Release Time Response</span>
                <div className="flex gap-3 text-[11px]">
                  <span className="text-slate-500">--- Pure Elastic Stress</span>
                  <span className="text-[#2B5B84]">— Viscoelastic Stress σ(t)</span>
                  <span className="text-[#D97706]">— Lingering Gel Rebound</span>
                </div>
              </div>
              <svg viewBox="0 0 420 205" className="w-full">
                {(() => {
                  const maxT = visco[visco.length - 1]?.t || 5;
                  const maxS = 28;
                  const sx = (t: number) => 42 + (t / maxT) * 362;
                  const sy = (s: number) => 176 - (s / maxS) * 150;
                  const idealP = visco.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.t).toFixed(1)},${sy(p.stressIdeal).toFixed(1)}`).join(' ');
                  const viscoP = visco.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.t).toFixed(1)},${sy(p.stressVisco).toFixed(1)}`).join(' ');
                  const rebP = visco.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.t).toFixed(1)},${sy(p.reboundResidual * 95).toFixed(1)}`).join(' ');
                  return (
                    <>
                      <line x1={42} y1={176} x2={404} y2={176} stroke="#94A3B8" />
                      <line x1={42} y1={24} x2={42} y2={176} stroke="#94A3B8" />
                      <path d={idealP} fill="none" stroke="#94A3B8" strokeWidth={1.6} strokeDasharray="4 3" />
                      <path d={viscoP} fill="none" stroke="#2B5B84" strokeWidth={2.4} />
                      <path d={rebP} fill="none" stroke="#D97706" strokeWidth={1.8} />
                      <text x={220} y={196} textAnchor="middle" fontSize={10} fill="#475569">Time t (s)</text>
                      <text x={14} y={100} textAnchor="middle" fontSize={10} fill="#475569" transform="rotate(-90 14 100)">Stress / Rebound</text>
                    </>
                  );
                })()}
              </svg>
              <p className="mt-1 text-xs text-slate-600">
                <strong>Why calibration drifts dynamically:</strong> During a constant hold, stress relaxes downward; after object release, the elastomer rebounds slowly (amber tail), creating false phantom force readings during rapid manipulation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BOUSSINESQ / GREEN */}
      {tab === 'boussinesq' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl bg-slate-50 p-3">
              <MathBlock display tex="w(\mathbf{x}) = \frac{1-\nu^2}{\pi E}\int_{\Omega}\frac{p_n(\boldsymbol{\xi})}{\|\mathbf{x}-\boldsymbol{\xi}\|}\,dA_{\boldsymbol{\xi}}" />
            </div>
            <div className="space-y-3 text-xs">
              <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-700">
                <input type="checkbox" checked={bTwoPeaks} onChange={(e) => setBTwoPeaks(e.target.checked)} />
                Two-point pressure contact (shows elastic spatial smoothing)
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between">
                  <span className="font-medium text-slate-700">Marker / Depth Measurement Noise</span>
                  <span className="font-mono">{(bNoise * 100).toFixed(1)}%</span>
                </div>
                <input type="range" min={0} max={0.055} step={0.002} value={bNoise} onChange={(e) => setBNoise(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between">
                  <span className="font-medium text-slate-700">Inverse Regularization Strength λ</span>
                  <span className="font-mono">{bReg.toFixed(2)}</span>
                </div>
                <input type="range" min={0.02} max={0.8} step={0.02} value={bReg} onChange={(e) => setBReg(+e.target.value)} className="w-full" />
              </label>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-700">
                <span>Forward Smoothing vs. Ill-Posed Inverse Reconstruction</span>
                <div className="flex gap-3 text-[11px]">
                  <span className="text-slate-700">— True Pressure p_n</span>
                  <span className="text-rose-600">— Naive Inverse (Noisy)</span>
                  <span className="text-emerald-700">— Regularized Inverse</span>
                </div>
              </div>
              <svg viewBox="0 0 420 205" className="w-full">
                {(() => {
                  const sx = (x: number) => 42 + ((x + 1) / 2) * 360;
                  const sy = (v: number) => 155 - Math.max(-0.6, Math.min(1.8, v)) * 76;
                  const makePath = (arr: number[]) =>
                    arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(bouss.x[i]).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
                  return (
                    <>
                      <line x1={42} y1={155} x2={402} y2={155} stroke="#94A3B8" />
                      <path d={makePath(bouss.truePressure)} fill="none" stroke="#334155" strokeWidth={2.2} strokeDasharray="4 3" />
                      <path d={makePath(bouss.naiveInverse)} fill="none" stroke="#E11D48" strokeWidth={1.4} opacity={0.85} />
                      <path d={makePath(bouss.regularizedInverse)} fill="none" stroke="#047857" strokeWidth={2.3} />
                      <text x={222} y={194} textAnchor="middle" fontSize={10} fill="#475569">Sensor Surface Coordinate x</text>
                    </>
                  );
                })()}
              </svg>
              <p className="mt-1 text-xs text-slate-600">
                <strong>Ill-posed inverse problem (Sec. 2.3):</strong> The elastomer acts as a low-pass spatial filter; even 2% tracking noise causes naive Boussinesq inversion (red) to oscillate wildly without regularization or FEM priors (green).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HELMHOLTZ-HODGE */}
      {tab === 'hhd' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="rounded-xl bg-slate-50 p-3 lg:col-span-5">
              <MathBlock display tex="\mathbf{u}_{\parallel} = \nabla\phi + \nabla^{\perp}\psi + \mathbf{h}" />
              <p className="mt-1 text-xs text-slate-600">
                Mix normal compression, torsional twist, and lateral shear to see how Helmholtz–Hodge separates the tangential marker field into three orthogonal geometric components.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs lg:col-span-7">
              <label className="block">
                <div className="mb-1 flex justify-between"><span>Normal Push (∇φ)</span><span className="font-mono">{hhdNormal.toFixed(1)}</span></div>
                <input type="range" min={0} max={1.2} step={0.1} value={hhdNormal} onChange={(e) => setHhdNormal(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between"><span>Torsional Twist (∇⊥ψ)</span><span className="font-mono">{hhdTwist.toFixed(1)}</span></div>
                <input type="range" min={-1.2} max={1.2} step={0.1} value={hhdTwist} onChange={(e) => setHhdTwist(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between"><span>Lateral Shear X (hₓ)</span><span className="font-mono">{hhdShearX.toFixed(1)}</span></div>
                <input type="range" min={-1} max={1} step={0.1} value={hhdShearX} onChange={(e) => setHhdShearX(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between"><span>Lateral Shear Y (hᵧ)</span><span className="font-mono">{hhdShearY.toFixed(1)}</span></div>
                <input type="range" min={-1} max={1} step={0.1} value={hhdShearY} onChange={(e) => setHhdShearY(+e.target.value)} className="w-full" />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <VectorFieldPlot title="Total Field u∥" subtitle="Observed marker motion" vectors={hhd.total} color="#1E3A5F" />
            <VectorFieldPlot title="Curl-Free ∇φ" subtitle="Divergence → normal push" vectors={hhd.curlFree} color="#0284C7" />
            <VectorFieldPlot title="Rotational ∇⊥ψ" subtitle="Curl → twist torque" vectors={hhd.rotational} color="#9333EA" />
            <VectorFieldPlot title="Harmonic h" subtitle="Uniform translation → shear" vectors={hhd.harmonic} color="#D97706" />
          </div>
        </div>
      )}

      {/* CATTANEO-MINDLIN SLIP */}
      {tab === 'slip' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl bg-slate-50 p-3">
              <MathBlock display tex="\frac{c}{a} = \left(1 - \frac{F_t}{\mu F_n}\right)^{1/3}, \qquad 0 \le F_t \le \mu F_n" />
            </div>
            <div className="space-y-3 text-xs">
              <label className="block">
                <div className="mb-1 flex justify-between"><span>Normal Load <MathBlock tex="F_n" /></span><span className="font-mono">{sFn.toFixed(1)} N</span></div>
                <input type="range" min={1} max={10} step={0.2} value={sFn} onChange={(e) => setSFn(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between"><span>Tangential Load <MathBlock tex="F_t" /></span><span className="font-mono">{sFt.toFixed(1)} N</span></div>
                <input type="range" min={0} max={8} step={0.1} value={sFt} onChange={(e) => setSFt(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between"><span>Friction Coefficient <MathBlock tex="\mu" /></span><span className="font-mono">{sMu.toFixed(2)}</span></div>
                <input type="range" min={0.2} max={1.2} step={0.05} value={sMu} onChange={(e) => setSMu(+e.target.value)} className="w-full" />
              </label>
            </div>
            <div className={`rounded-lg border p-3 text-xs font-medium ${slip.isGrossSlip ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
              {slip.isGrossSlip
                ? `GROSS SLIP (Ft ≥ μFn = ${(sMu * sFn).toFixed(2)} N): Central stick region has vanished!`
                : `PARTIAL SLIP: Central stick radius c/a = ${(slip.stickRatio * 100).toFixed(0)}% (outer ${(100 - slip.stickRatio * 100).toFixed(0)}% is already micro-slipping).`}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {/* Circular contact patch */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <div className="mb-1 text-xs font-semibold text-slate-700">Contact Patch (Stick vs. Slip Annulus)</div>
              <svg viewBox="-1.25 -1.25 2.5 2.5" className="h-44 w-44">
                {/* Outer slip annulus */}
                <circle cx={0} cy={0} r={1.0} fill="#FED7AA" stroke="#EA580C" strokeWidth={0.04} />
                {/* Inner stick zone */}
                {slip.stickRatio > 0.01 && (
                  <circle cx={0} cy={0} r={slip.stickRatio} fill="#BAE6FD" stroke="#0284C7" strokeWidth={0.04} />
                )}
                <text x={0} y={0.06} textAnchor="middle" fontSize={0.18} fontWeight={700} fill="#0F172A">
                  {slip.isGrossSlip ? 'SLIP' : 'STICK'}
                </text>
              </svg>
              <div className="flex gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#BAE6FD] border border-[#0284C7]" /> Stick (r ≤ c)</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#FED7AA] border border-[#EA580C]" /> Slip (c &lt; r ≤ a)</span>
              </div>
            </div>

            {/* Shear traction profile */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <div className="mb-1 text-xs font-semibold text-slate-700">Shear Traction Profile τ(r) / μp₀</div>
              <svg viewBox="0 0 240 190" className="w-full">
                {(() => {
                  const sx = (r: number) => 28 + r * 195;
                  const sy = (v: number) => 160 - v * 130;
                  const limP = slip.profile.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.rNorm).toFixed(1)},${sy(p.hertzPressureNorm).toFixed(1)}`).join(' ');
                  const tauP = slip.profile.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.rNorm).toFixed(1)},${sy(p.tractionNorm).toFixed(1)}`).join(' ');
                  return (
                    <>
                      <line x1={28} y1={160} x2={225} y2={160} stroke="#94A3B8" />
                      <line x1={28} y1={24} x2={28} y2={160} stroke="#94A3B8" />
                      <path d={limP} fill="none" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 3" />
                      <path d={tauP} fill="none" stroke="#EA580C" strokeWidth={2.4} />
                      <line x1={sx(slip.stickRatio)} y1={26} x2={sx(slip.stickRatio)} y2={160} stroke="#0284C7" strokeDasharray="3 2" />
                      <text x={125} y={180} textAnchor="middle" fontSize={10} fill="#475569">Normalized Radius r / a</text>
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* PHOTOMETRIC STEREO */}
      {tab === 'photometric' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl bg-slate-50 p-3">
              <MathBlock display tex="\mathbf{n} = \frac{[-g_x,-g_y,1]^{\mathsf T}}{\sqrt{1+g_x^2+g_y^2}}, \qquad \nabla^2 z = \frac{\partial g_x}{\partial x} + \frac{\partial g_y}{\partial y}" />
            </div>
            <div className="space-y-3 text-xs">
              <label className="block">
                <div className="mb-1 flex justify-between"><span>Object Relief Height</span><span className="font-mono">{pHeight.toFixed(2)} mm</span></div>
                <input type="range" min={0.2} max={1.4} step={0.05} value={pHeight} onChange={(e) => setPHeight(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="mb-1 flex justify-between"><span>Calibration / Glare Gradient Bias</span><span className="font-mono">{Math.round(pGlare * 100)}%</span></div>
                <input type="range" min={0} max={1} step={0.05} value={pGlare} onChange={(e) => setPGlare(+e.target.value)} className="w-full" />
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-amber-900">
                <input type="checkbox" checked={pSoftObj} onChange={(e) => setPSoftObj(e.target.checked)} />
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span className="font-medium">Deformable Object (Sensor sees flattened shape)</span>
              </label>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-700">
                <span>1D Cross-Section: True Object vs. Integrated Height</span>
                <div className="flex gap-3 text-[11px]">
                  <span className="text-slate-600">--- Undeformed Object</span>
                  <span className="text-[#2B5B84]">— Deformed Gel</span>
                  <span className="text-rose-600">— Drifted Integration</span>
                </div>
              </div>
              <svg viewBox="0 0 420 200" className="w-full">
                {(() => {
                  const sx = (x: number) => 42 + ((x + 1) / 2) * 360;
                  const sy = (z: number) => 165 - z * 90;
                  const pObj = photoProfile.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.objZ).toFixed(1)}`).join(' ');
                  const pGel = photoProfile.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.sensorZ).toFixed(1)}`).join(' ');
                  const pRec = photoProfile.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.zRec).toFixed(1)}`).join(' ');
                  return (
                    <>
                      <line x1={42} y1={165} x2={402} y2={165} stroke="#94A3B8" />
                      <path d={pObj} fill="none" stroke="#64748B" strokeWidth={1.6} strokeDasharray="4 3" />
                      <path d={pGel} fill="none" stroke="#2B5B84" strokeWidth={2.2} />
                      <path d={pRec} fill="none" stroke="#E11D48" strokeWidth={2.0} />
                      <text x={222} y={190} textAnchor="middle" fontSize={10} fill="#475569">Sensor Surface Coordinate x</text>
                    </>
                  );
                })()}
              </svg>
              <p className="mt-1 text-xs text-slate-600">
                <strong>Optical sensitivity (Sec. 2.3):</strong> Even localized specular glare or coating wear biases gradient estimates, which Poisson integration accumulates into global low-frequency height drift (red).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
