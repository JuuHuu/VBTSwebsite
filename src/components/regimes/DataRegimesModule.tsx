import { useState } from 'react';
import {
  Database,
  Cpu,
  ArrowLeftRight,
  Brain,
  ExternalLink,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  REGIMES,
  SIMULATORS,
  TRANSFER_METHODS,
  EMBODIED_METHODS,
  type EmbodiedEntry,
  type SimulatorEntry,
} from '../../data/dataRegimes';
import { MathBlock } from '../MathBlock';
import { DataBudgetChart } from './DataBudgetChart';

type DeepDiveTab = 'simulators' | 'transfer' | 'embodied';

export function DataRegimesModule() {
  const [activeRegimeId, setActiveRegimeId] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [deepTab, setDeepTab] = useState<DeepDiveTab>('simulators');
  const [selectedSim, setSelectedSim] = useState<SimulatorEntry>(SIMULATORS[4]); // DiffTactile
  const [embodiedFilter, setEmbodiedFilter] = useState<'All' | EmbodiedEntry['category']>('All');

  // Interactive Slow-Fast Latency Demo (Regime V)
  const [vlaChunkMs, setVlaChunkMs] = useState(250); // slow action-chunking period (ms)
  const [reactiveMs, setReactiveMs] = useState(18);  // fast tactile reflex period (ms)
  const [slipWindowMs, setSlipWindowMs] = useState(65); // time before object slips out

  const activeRegime = REGIMES.find((r) => r.id === activeRegimeId)!;
  const slowCatchesSlip = vlaChunkMs <= slipWindowMs;
  const fastCatchesSlip = reactiveMs <= slipWindowMs;

  const filteredEmbodied =
    embodiedFilter === 'All'
      ? EMBODIED_METHODS
      : EMBODIED_METHODS.filter((e) => e.category === embodiedFilter);

  return (
    <section id="regimes" className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF0F4] px-3 py-1 text-xs font-semibold text-[#8E3A59]">
          Section 4 · Fig. 5 &amp; Tables 4–7
        </span>
        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
          Data &amp; Learning Regimes: From Sensor Readout to Embodied Intelligence
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Explore how tactile data, mathematical formulations, simulation engines, cross-sensor transfer, and embodied vision-language-action (VLA) models organize into five overlapping regimes—with explicit unit-audited data budgets.
        </p>
      </div>

      {/* 5 Regime Interactive Cards (Table 4) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {REGIMES.map((r) => {
            const active = r.id === activeRegimeId;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRegimeId(r.id)}
                style={{
                  borderColor: active ? r.color : '#E2E8F0',
                  backgroundColor: active ? r.bg : '#FFFFFF',
                }}
                className="cursor-pointer rounded-xl border-2 p-3 text-left transition hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{ backgroundColor: r.color }}
                    className="rounded px-1.5 py-0.5 font-mono text-[11px] font-bold text-white"
                  >
                    Regime {r.roman}
                  </span>
                </div>
                <div className="mt-1.5 text-xs font-semibold text-slate-900">{r.name}</div>
                <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-slate-600">
                  {r.purpose}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Regime Formula & Detail Banner */}
        <div
          style={{ backgroundColor: activeRegime.bg, borderColor: activeRegime.border }}
          className="grid gap-4 rounded-2xl border p-4 lg:grid-cols-12"
        >
          <div className="lg:col-span-5">
            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: activeRegime.color }}>
              Regime {activeRegime.roman} Formal Pipeline
            </div>
            <div className="mt-1.5 rounded-xl bg-white/95 px-3 py-2 shadow-2xs">
              <MathBlock display tex={activeRegime.formulaTex} />
            </div>
            <div className="mt-2 text-[11px] text-slate-600">
              <strong>Representative works:</strong> {activeRegime.example}
            </div>
          </div>
          <div className="grid gap-3 text-xs sm:grid-cols-2 lg:col-span-7">
            <div className="rounded-xl bg-white/90 p-3">
              <div className="font-semibold text-slate-900">Primary Data &amp; Supervision</div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">{activeRegime.supervision}</p>
            </div>
            <div className="rounded-xl bg-amber-50/85 p-3">
              <div className="font-semibold text-amber-900">Key Structural Bottleneck</div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-amber-950/85">{activeRegime.bottleneck}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Audited Log-Scale Data Budget Explorer (Fig. 5) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[#2B5B84]" />
          <h3 className="font-serif text-xl font-semibold text-slate-900">
            Interactive Data Budget Explorer Across Regimes I–V (Fig. 5 Audited Ledger)
          </h3>
        </div>
        <DataBudgetChart />
      </div>

      {/* Deep-Dive Interactive Labs for Regimes III, IV, V (Tables 5, 6, 7) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-serif text-xl font-semibold text-slate-900">
              Methodological Deep Dives: Simulation, Transfer, &amp; Embodied Control
            </h3>
            <p className="text-xs text-slate-600">
              Compare how computational regimes tackle the reality gap (Table 5), hardware shifts (Table 6), and slow–fast embodied manipulation (Table 7).
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setDeepTab('simulators')}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                deepTab === 'simulators'
                  ? 'bg-[#63488E] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" /> Regime III · Simulators
            </button>
            <button
              onClick={() => setDeepTab('transfer')}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                deepTab === 'transfer'
                  ? 'bg-[#8B6240] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" /> Regime IV · Cross-Sensor
            </button>
            <button
              onClick={() => setDeepTab('embodied')}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                deepTab === 'embodied'
                  ? 'bg-[#8E3A59] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Brain className="h-3.5 w-3.5" /> Regime V · World Models &amp; VLAs
            </button>
          </div>
        </div>

        {/* TAB 1: SIMULATORS (TABLE 5) */}
        {deepTab === 'simulators' && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Fidelity vs Throughput 2D Map */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 lg:col-span-7">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>Fidelity–Throughput Trade-Off Landscape (Table 5)</span>
                <span className="text-[10.5px] font-normal text-slate-500">Click any simulator dot</span>
              </div>
              <svg viewBox="0 0 460 255" className="w-full">
                {/* Axes */}
                <line x1={48} y1={215} x2={435} y2={215} stroke="#94A3B8" strokeWidth={1.2} />
                <line x1={48} y1={20} x2={48} y2={215} stroke="#94A3B8" strokeWidth={1.2} />
                {/* Quadrant shading */}
                <rect x={242} y={20} width={193} height={97} fill="#EEF5FB" opacity={0.6} />
                <text x={428} y={35} textAnchor="end" fontSize={9.5} fill="#2B5B84" fontWeight={600}>
                  High Fidelity + High Speed Frontier
                </text>
                <text x={242} y={242} textAnchor="middle" fontSize={10.5} fill="#475569" fontWeight={600}>
                  Simulation Throughput / Parallel Speed →
                </text>
                <text x={15} y={118} textAnchor="middle" fontSize={10.5} fill="#475569" fontWeight={600} transform="rotate(-90 15 118)">
                  Continuum Mechanics Fidelity →
                </text>

                {SIMULATORS.map((sim) => {
                  const cx = 48 + (sim.throughput / 100) * 375;
                  const cy = 215 - (sim.mechanicsFidelity / 100) * 185;
                  const isSel = selectedSim.id === sim.id;
                  return (
                    <g
                      key={sim.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedSim(sim)}
                    >
                      {isSel && <circle cx={cx} cy={cy} r={13} fill="#63488E26" stroke="#63488E" strokeWidth={1.5} />}
                      <circle cx={cx} cy={cy} r={6.5} fill={isSel ? '#63488E' : '#2B5B84'} stroke="#FFFFFF" strokeWidth={1.5} />
                      <text
                        x={cx}
                        y={cy - 10}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={isSel ? 700 : 600}
                        fill={isSel ? '#4C1D95' : '#1E293B'}
                      >
                        {sim.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {/* Two-part reality gap note */}
              <div className="mt-2 grid gap-2 sm:grid-cols-2 text-[11px]">
                <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                  <strong className="text-[#63488E]">Optical Reality Gap:</strong> Unmodeled LED nonuniformity, internal reflections, lens distortion, sensor noise, and coating wear.
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                  <strong className="text-[#9A6B26]">Mechanical Reality Gap:</strong> Rigid/penetration approximations vs. hyperelasticity, viscoelastic hysteresis, friction anisotropy, and soft-object deformation.
                </div>
              </div>
            </div>

            {/* Selected Simulator Details */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 lg:col-span-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#F3EFFA] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-[#63488E]">
                    {selectedSim.category}
                  </span>
                  <span className="font-mono text-xs text-slate-500">{selectedSim.year}</span>
                </div>
                <h4 className="mt-2 font-serif text-xl font-semibold text-slate-900">
                  {selectedSim.name}
                </h4>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <div className="text-[10px] text-slate-500">Throughput</div>
                    <div className="font-mono text-sm font-bold text-[#2B5B84]">{selectedSim.throughput}/100</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <div className="text-[10px] text-slate-500">Mechanics</div>
                    <div className="font-mono text-sm font-bold text-[#63488E]">{selectedSim.mechanicsFidelity}/100</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <div className="text-[10px] text-slate-500">Optics</div>
                    <div className="font-mono text-sm font-bold text-[#2E7D5B]">{selectedSim.opticalFidelity}/100</div>
                  </div>
                </div>

                <dl className="mt-3 space-y-2.5 text-xs">
                  <div>
                    <dt className="font-semibold text-slate-800">Principal Modeling Role</dt>
                    <dd className="text-slate-600">{selectedSim.role}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-800">Generated Outputs &amp; Applications</dt>
                    <dd className="text-slate-600">{selectedSim.outputs}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-800">Validation Target (Table 5)</dt>
                    <dd className="text-slate-600">{selectedSim.validation}</dd>
                  </div>
                </dl>
              </div>

              {selectedSim.url && (
                <a
                  href={selectedSim.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#63488E] hover:underline"
                >
                  {selectedSim.citation} · Open Paper <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CROSS-SENSOR TRANSFER (TABLE 6) */}
        {deepTab === 'transfer' && (
          <div className="space-y-5">
            {/* 3-Tier Transfer Difficulty Ladder */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                <div className="font-mono text-[10.5px] font-bold uppercase text-emerald-800">Tier 1 · Easiest</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">Unit-to-Unit Transfer</div>
                <p className="mt-1 text-xs text-slate-600">
                  Unseen unit of the <em>same</em> sensor model. Tests tolerance to silicone casting, LED intensity, coating wear, and mounting tolerances.
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                <div className="font-mono text-[10.5px] font-bold uppercase text-amber-800">Tier 2 · Coupled Shift</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">Cross-Design Optical Transfer</div>
                <p className="mt-1 text-xs text-slate-600">
                  Across distinct VBTS families (e.g., DIGIT ↔ GelSight ↔ TacTip). Both <strong>optical encoding</strong> and <strong>contact mechanics</strong> shift simultaneously.
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5">
                <div className="font-mono text-[10.5px] font-bold uppercase text-rose-800">Tier 3 · Cross-Modality</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">Cross-Transducer Transfer</div>
                <p className="mt-1 text-xs text-slate-600">
                  Optical VBTS provides dense supervision to train non-optical magnetic skins or sparse taxel arrays (deployed sensor is not a VBTS).
                </p>
              </div>
            </div>

            {/* Table 6 Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TRANSFER_METHODS.map((tm) => (
                <div key={tm.id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{tm.name}</span>
                      <span className="rounded bg-[#F9F2EC] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#8B6240]">
                        {tm.tier}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1.5 text-[11.5px]">
                      <p className="text-slate-700"><strong>Transferred:</strong> {tm.transferred}</p>
                      <p className="text-slate-600"><strong>Device interface:</strong> {tm.interface}</p>
                      <p className="rounded bg-amber-50/80 p-2 text-[11px] text-amber-950">
                        <strong>Evidence boundary:</strong> {tm.boundary}
                      </p>
                    </div>
                  </div>
                  {tm.url && (
                    <a
                      href={tm.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B6240] hover:underline"
                    >
                      {tm.citation} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EMBODIED TACTILE INTELLIGENCE (TABLE 7) */}
        {deepTab === 'embodied' && (
          <div className="space-y-5">
            {/* Interactive Slow-Fast Latency & Slip Arrest Visualizer */}
            <div className="rounded-xl border border-[#8E3A59]/25 bg-[#FAF0F4]/60 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Zap className="h-4 w-4 text-[#8E3A59]" />
                  Why Slow–Fast Architectures Matter (RDP, T-Rex, AT-VLA)
                </div>
                <span className="text-[11px] text-slate-600">
                  Compare open-loop action-chunking VLAs against millisecond reactive tactile loops
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-12">
                <div className="space-y-2.5 text-xs lg:col-span-5">
                  <label className="block">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Slow VLA Action-Chunk Horizon</span>
                      <span className="font-mono font-semibold">{vlaChunkMs} ms ({(1000 / vlaChunkMs).toFixed(1)} Hz)</span>
                    </div>
                    <input type="range" min={50} max={500} step={10} value={vlaChunkMs} onChange={(e) => setVlaChunkMs(+e.target.value)} className="w-full" />
                  </label>
                  <label className="block">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Fast Tactile Feedback Loop</span>
                      <span className="font-mono font-semibold">{reactiveMs} ms ({(1000 / reactiveMs).toFixed(0)} Hz)</span>
                    </div>
                    <input type="range" min={5} max={80} step={1} value={reactiveMs} onChange={(e) => setReactiveMs(+e.target.value)} className="w-full" />
                  </label>
                  <label className="block">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Incipient-to-Gross Slip Window</span>
                      <span className="font-mono font-semibold text-rose-700">{slipWindowMs} ms</span>
                    </div>
                    <input type="range" min={25} max={180} step={5} value={slipWindowMs} onChange={(e) => setSlipWindowMs(+e.target.value)} className="w-full" />
                  </label>
                </div>

                {/* Live Timeline Bar Comparison */}
                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5 lg:col-span-7">
                  <div className="text-[11px] font-semibold text-slate-700">
                    Timeline After Incipient Slip Onset (t = 0 ms → Drop Threshold at {slipWindowMs} ms)
                  </div>
                  {/* Slow VLA row */}
                  <div>
                    <div className="mb-1 flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700">Slow Action-Chunking VLA Only</span>
                      <span className={`font-semibold ${slowCatchesSlip ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {slowCatchesSlip ? 'Reacts in time' : `MISSES SLIP (+${vlaChunkMs - slipWindowMs} ms late → drop!)`}
                      </span>
                    </div>
                    <div className="relative h-6 w-full overflow-hidden rounded bg-slate-100">
                      <div
                        className={`h-full transition-all ${slowCatchesSlip ? 'bg-emerald-500/80' : 'bg-rose-500/80'}`}
                        style={{ width: `${Math.min(100, (vlaChunkMs / 500) * 100)}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900"
                        style={{ left: `${(slipWindowMs / 500) * 100}%` }}
                        title="Slip failure deadline"
                      />
                    </div>
                  </div>
                  {/* Slow-Fast row */}
                  <div>
                    <div className="mb-1 flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700">Slow–Fast Reactive Policy (RDP / T-Rex / AT-VLA)</span>
                      <span className={`font-semibold ${fastCatchesSlip ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {fastCatchesSlip ? `ARRESTS SLIP (${slipWindowMs - reactiveMs} ms safety margin)` : 'Too slow for slip window'}
                      </span>
                    </div>
                    <div className="relative h-6 w-full overflow-hidden rounded bg-slate-100">
                      <div
                        className={`h-full transition-all ${fastCatchesSlip ? 'bg-emerald-600' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, (reactiveMs / 500) * 100)}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900"
                        style={{ left: `${(slipWindowMs / 500) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#8E3A59]" />
                    <span>
                      Also watch for <strong>modality dominance</strong>: policies trained on narrow demos often ignore touch unless evaluated under visual occlusion or tactile-drop ablations.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category filter + Table 7 Grid */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', 'Multimodal Reasoning', 'Tactile World Models', 'Policies & VLAs'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEmbodiedFilter(cat)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                    embodiedFilter === cat
                      ? 'bg-[#8E3A59] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEmbodied.map((em) => (
                <div key={em.id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-[#FAF0F4] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#8E3A59]">
                        {em.category}
                      </span>
                      <span className="font-mono text-[10.5px] text-slate-500">{em.year}</span>
                    </div>
                    <h4 className="mt-1.5 text-sm font-semibold text-slate-900">{em.name}</h4>
                    <p className="mt-1.5 text-[11.5px] text-slate-600">
                      <strong>Data &amp; modalities:</strong> {em.data}
                    </p>
                    <p className="mt-1 text-[11.5px] text-slate-700">
                      <strong>Functional role:</strong> {em.role}
                    </p>
                  </div>
                  {em.url && (
                    <a
                      href={em.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#8E3A59] hover:underline"
                    >
                      {em.citation} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
