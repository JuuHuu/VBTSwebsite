import { useMemo, useState } from 'react';
import { Calculator, ExternalLink, Info } from 'lucide-react';
import {
  DATA_BUDGET_POINTS,
  NATIVE_ONLY_BUDGETS,
  REGIMES,
  type CountingUnit,
  type DataBudgetPoint,
  type DataOrigin,
} from '../../data/dataRegimes';
import { MathBlock } from '../MathBlock';

const ORIGIN_META: Record<DataOrigin, { label: string; color: string; stroke: string }> = {
  real: { label: 'Real (Physical)', color: '#0F766E', stroke: '#115E59' },
  generated: { label: 'Simulated / Generated', color: '#7C3AED', stroke: '#5B21B6' },
  mixed: { label: 'Real + Simulated', color: '#B45309', stroke: '#92400E' },
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${Math.round(n)}`;
}

// Deterministic jitter per point so overlapping counts in the same regime spread horizontally
function xJitter(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1000;
  return (h / 1000) * 2 - 1; // -1..1
}

export function DataBudgetChart() {
  const [subsetMode, setSubsetMode] = useState<'curated' | 'all'>('curated');
  const [unitFilter, setUnitFilter] = useState<'all' | CountingUnit>('all');
  const [originFilter, setOriginFilter] = useState<'all' | DataOrigin>('all');
  const [selectedPoint, setSelectedPoint] = useState<DataBudgetPoint | null>(
    () => DATA_BUDGET_POINTS.find((p) => p.label.toLowerCase().includes('tacwam') && p.count > 100000) ?? DATA_BUDGET_POINTS[0]
  );

  // Interactive N_obs = sum N_g * m_g accounting calculator
  const [calcSensors, setCalcSensors] = useState(2);
  const [calcViewsPerSensor, setCalcViewsPerSensor] = useState(1);
  const [calcEpisodes, setCalcEpisodes] = useState(300);
  const [calcSteps, setCalcSteps] = useState(500);
  const calcTotalRecords = calcEpisodes * calcSteps * calcSensors;

  const visiblePoints = useMemo(() => {
    return DATA_BUDGET_POINTS.filter((p) => {
      if (subsetMode === 'curated' && !p.inCuratedFig5) return false;
      if (unitFilter !== 'all' && p.unit !== unitFilter) return false;
      if (originFilter !== 'all' && p.origin !== originFilter) return false;
      return true;
    });
  }, [subsetMode, unitFilter, originFilter]);

  // SVG chart dimensions
  const W = 920;
  const H = 430;
  const padL = 62;
  const padR = 18;
  const padT = 56;
  const padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const colW = plotW / 5;

  const minExp = 0; // 10^0 = 1
  const maxExp = 7.4; // > 10^7

  const yOf = (count: number) => {
    const exp = Math.log10(Math.max(1, count));
    const t = (exp - minExp) / (maxExp - minExp);
    return padT + plotH * (1 - t);
  };

  const xOf = (p: DataBudgetPoint) => {
    const colCenter = padL + (p.regime - 0.5) * colW;
    return colCenter + xJitter(p.id) * (colW * 0.34);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Dataset Scope:</span>
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setSubsetMode('curated')}
              className={`cursor-pointer rounded-md px-2.5 py-1 font-medium ${
                subsetMode === 'curated' ? 'bg-[#1E3A5F] text-white' : 'text-slate-600'
              }`}
            >
              Curated Survey Plot ({DATA_BUDGET_POINTS.filter((p) => p.inCuratedFig5).length})
            </button>
            <button
              onClick={() => setSubsetMode('all')}
              className={`cursor-pointer rounded-md px-2.5 py-1 font-medium ${
                subsetMode === 'all' ? 'bg-[#1E3A5F] text-white' : 'text-slate-600'
              }`}
            >
              Full Audited Ledger ({DATA_BUDGET_POINTS.length})
            </button>
          </div>

          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value as 'all' | CountingUnit)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="all">All Counting Units</option>
            <option value="optical_sensor_observation">● Optical Observation Records</option>
            <option value="robot_episode">◆ Robot Interaction Episodes</option>
          </select>

          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value as 'all' | DataOrigin)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="all">All Data Origins</option>
            <option value="real">Real (Physical)</option>
            <option value="generated">Simulated / Generated</option>
            <option value="mixed">Real + Simulated</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1 font-medium">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-700" /> Optical records
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="inline-block h-2.5 w-2.5 rotate-45 bg-slate-700" /> Episodes / trials
          </span>
          {(Object.keys(ORIGIN_META) as DataOrigin[]).map((o) => (
            <span key={o} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: ORIGIN_META[o].color }}
              />
              {ORIGIN_META[o].label.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      {/* Main Chart + Selected Point Inspector */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xs lg:col-span-8">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[680px]">
            {/* Regime background columns */}
            {REGIMES.map((r, i) => (
              <g key={r.id}>
                <rect
                  x={padL + i * colW + 3}
                  y={8}
                  width={colW - 6}
                  height={H - 18}
                  rx={8}
                  fill={r.bg}
                  stroke={r.border}
                  strokeWidth={1}
                />
                <text
                  x={padL + (i + 0.5) * colW}
                  y={25}
                  textAnchor="middle"
                  fontSize={11.5}
                  fontWeight={700}
                  fill={r.color}
                >
                  Regime {r.roman}
                </text>
                <text
                  x={padL + (i + 0.5) * colW}
                  y={40}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#475569"
                >
                  {r.shortName}
                </text>
              </g>
            ))}

            {/* Horizontal log10 grid lines */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((exp) => {
              const y = yOf(Math.pow(10, exp));
              return (
                <g key={exp}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={W - padR}
                    y2={y}
                    stroke="#CBD5E1"
                    strokeWidth={0.8}
                    strokeDasharray={exp === 0 ? undefined : '3 3'}
                  />
                  <text x={padL - 8} y={y + 3.5} textAnchor="end" fontSize={10} fontFamily="JetBrains Mono, monospace" fill="#475569">
                    10^{exp}
                  </text>
                </g>
              );
            })}

            {/* Y-axis label */}
            <text
              x={15}
              y={padT + plotH / 2}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight={600}
              fill="#334155"
              transform={`rotate(-90 15 ${padT + plotH / 2})`}
            >
              Reported Count in Explicit Unit (log scale)
            </text>

            {/* Plotted audited data points */}
            {visiblePoints.map((p) => {
              const cx = xOf(p);
              const cy = yOf(p.count);
              const isSel = selectedPoint?.id === p.id;
              const om = ORIGIN_META[p.origin];
              const isEp = p.unit === 'robot_episode';
              const yUpper = p.upperCount ? yOf(p.upperCount) : null;

              return (
                <g
                  key={p.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setSelectedPoint(p)}
                  onClick={() => setSelectedPoint(p)}
                >
                  {/* Range bar if upperCount exists */}
                  {yUpper !== null && (
                    <line x1={cx} y1={cy} x2={cx} y2={yUpper} stroke={om.color} strokeWidth={2.2} />
                  )}
                  {/* Lower-bound upward arrow if greater_than */}
                  {p.relation === 'greater_than' && (
                    <path d={`M${cx},${cy - 7} L${cx},${cy - 17} M${cx - 3},${cy - 13} L${cx},${cy - 17} L${cx + 3},${cy - 13}`} stroke={om.color} strokeWidth={1.3} fill="none" />
                  )}

                  {isSel && (
                    <circle cx={cx} cy={cy} r={11} fill={`${om.color}28`} stroke={om.color} strokeWidth={1.4} />
                  )}

                  {isEp ? (
                    <polygon
                      points={`${cx},${cy - 6.5} ${cx + 6.5},${cy} ${cx},${cy + 6.5} ${cx - 6.5},${cy}`}
                      fill={om.color}
                      stroke="#FFFFFF"
                      strokeWidth={1.4}
                    />
                  ) : (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5.8}
                      fill={om.color}
                      stroke="#FFFFFF"
                      strokeWidth={1.4}
                    />
                  )}

                  {isSel && (
                    <g pointerEvents="none">
                      <rect
                        x={Math.min(W - 140, Math.max(padL + 4, cx - 58))}
                        y={Math.max(padT + 2, cy - 30)}
                        width={116}
                        height={18}
                        rx={4}
                        fill="#0F172A"
                        fillOpacity={0.9}
                      />
                      <text
                        x={Math.min(W - 82, Math.max(padL + 62, cx))}
                        y={Math.max(padT + 14, cy - 18)}
                        textAnchor="middle"
                        fontSize={9.5}
                        fontWeight={600}
                        fill="#FFFFFF"
                      >
                        {p.label.slice(0, 15)} ({formatCount(p.count)})
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="mt-1.5 flex items-center gap-1.5 px-2 text-[11px] text-slate-500">
            <Info className="h-3.5 w-3.5 shrink-0 text-[#2B5B84]" />
            <span>
              All {DATA_BUDGET_POINTS.length} data points are loaded directly from the survey&apos;s audited source ledger (correcting Illustrator label drift). Hover or click any marker to inspect its exact unit and accounting formula.
            </span>
          </div>
        </div>

        {/* Right: Selected Study Audit Card + N_obs Accounting Sandbox */}
        <div className="space-y-4 lg:col-span-4">
          {selectedPoint && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span
                  style={{
                    backgroundColor: REGIMES[selectedPoint.regime - 1].bg,
                    color: REGIMES[selectedPoint.regime - 1].color,
                  }}
                  className="rounded px-2 py-0.5 font-mono text-[10px] font-bold"
                >
                  Regime {REGIMES[selectedPoint.regime - 1].roman} · {selectedPoint.role}
                </span>
                <span
                  style={{ backgroundColor: ORIGIN_META[selectedPoint.origin].color }}
                  className="rounded px-2 py-0.5 text-[10px] font-semibold text-white"
                >
                  {ORIGIN_META[selectedPoint.origin].label}
                </span>
              </div>

              <h4 className="mt-2 font-serif text-lg font-semibold text-slate-900">
                {selectedPoint.label}
              </h4>
              <p className="text-[11px] text-slate-500">{selectedPoint.paperTitle}</p>

              <div className="mt-3 rounded-xl bg-slate-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Normalized Verified Count
                </div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-[#1E3A5F]">
                    {selectedPoint.relation === 'greater_than' ? '>' : selectedPoint.relation === 'approximate' ? '~' : ''}
                    {selectedPoint.count.toLocaleString()}
                    {selectedPoint.upperCount ? `–${selectedPoint.upperCount.toLocaleString()}` : ''}
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    {selectedPoint.unit === 'robot_episode' ? 'robot episodes' : 'optical records'}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-700">
                  <strong>Reported:</strong> {selectedPoint.reportedQuantity}
                </div>
                {selectedPoint.conversionNote && (
                  <div className="mt-1 text-[11px] text-slate-600">
                    <strong>Accounting note:</strong> {selectedPoint.conversionNote}
                  </div>
                )}
                {selectedPoint.sourceLocator && (
                  <div className="mt-1 font-mono text-[10px] text-slate-500">
                    Source locator: {selectedPoint.sourceLocator}
                  </div>
                )}
              </div>

              {selectedPoint.url && (
                <a
                  href={selectedPoint.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#2B5B84] hover:underline"
                >
                  {selectedPoint.citation} · Open Source Paper <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Interactive Unit-Accounting Calculator (Section 4 formula) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <Calculator className="h-3.5 w-3.5 text-[#2B5B84]" />
              Interactive Record-Counting Rule
            </div>
            <div className="my-1.5 rounded-lg bg-slate-50 px-2 py-1 text-center">
              <MathBlock tex="N_{\mathrm{obs}} = \sum_{g} N_g m_g" />
            </div>
            <div className="space-y-2 text-[11px]">
              <label className="block">
                <div className="flex justify-between">
                  <span className="text-slate-600">Distinct physical VBTS units (<MathBlock tex="m_g" />)</span>
                  <span className="font-mono font-semibold">{calcSensors}</span>
                </div>
                <input type="range" min={1} max={5} value={calcSensors} onChange={(e) => setCalcSensors(+e.target.value)} className="w-full" />
              </label>
              <label className="block">
                <div className="flex justify-between">
                  <span className="text-slate-600">Simultaneous camera views / sensor</span>
                  <span className="font-mono font-semibold">{calcViewsPerSensor} {calcViewsPerSensor > 1 ? '(combined → 1 record)' : ''}</span>
                </div>
                <input type="range" min={1} max={3} value={calcViewsPerSensor} onChange={(e) => setCalcViewsPerSensor(+e.target.value)} className="w-full" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Episodes</span>
                    <span className="font-mono font-semibold">{calcEpisodes}</span>
                  </div>
                  <input type="range" min={10} max={1200} step={10} value={calcEpisodes} onChange={(e) => setCalcEpisodes(+e.target.value)} className="w-full" />
                </label>
                <label className="block">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Steps / ep.</span>
                    <span className="font-mono font-semibold">{calcSteps}</span>
                  </div>
                  <input type="range" min={20} max={1000} step={20} value={calcSteps} onChange={(e) => setCalcSteps(+e.target.value)} className="w-full" />
                </label>
              </div>
              <div className="rounded-lg bg-[#EEF5FB] p-2.5 text-center">
                <div className="text-[10px] font-medium text-[#2B5B84]">Equivalent Optical Observation Records</div>
                <div className="font-mono text-lg font-bold text-[#1E3A5F]">
                  {calcTotalRecords.toLocaleString()} records
                </div>
                <div className="text-[10px] text-slate-600">
                  Stereo/multi-camera views of one sensor do <strong>not</strong> inflate <MathBlock tex="N_{\mathrm{obs}}" />; distinct fingers do.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Native-Unit Non-Convertible Strip */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-800">
            Why Some Corpora Stay in Native Units (Not Plotted on the Optical Record Axis)
          </div>
          <span className="text-[11px] text-slate-500">
            Retained separately when sequence lengths, sensor multiplicity, or transducer modalities differ
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {NATIVE_ONLY_BUDGETS.filter((n) =>
            ['R099', 'R071', 'R126', 'R127'].includes(n.paperId)
          ).map((n) => (
            <div key={n.id} className="rounded-lg border border-slate-200 bg-white p-2.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{n.label}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9.5px] text-slate-600">
                  Regime {REGIMES[n.regime - 1]?.roman}
                </span>
              </div>
              <div className="mt-1 font-mono text-[10.5px] font-medium text-[#2B5B84]">
                {n.reportedQuantity}
              </div>
              <p className="mt-1 text-[10.5px] leading-snug text-slate-600">{n.note.slice(0, 125)}{n.note.length > 125 ? '…' : ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
