import { BASELINE_SCORES, type TradeoffScores } from '../../data/hardwareGoals';

interface TradeoffRadarProps {
  scores: TradeoffScores;
  accentColor: string;
  label: string;
}

const AXES: { key: keyof TradeoffScores; label: string }[] = [
  { key: 'compactness', label: 'Compactness' },
  { key: 'coverage', label: 'Coverage Area' },
  { key: 'spatialDetail', label: 'Spatial Detail' },
  { key: 'forceCapability', label: 'Force Perf.' },
  { key: 'temporalBandwidth', label: 'Temporal Speed' },
  { key: 'calibrationEase', label: 'Calib. Simplicity' },
];

export function TradeoffRadar({ scores, accentColor, label }: TradeoffRadarProps) {
  const cx = 145;
  const cy = 115;
  const R = 76;

  const pt = (axisIdx: number, val: number) => {
    const angle = -Math.PI / 2 + (axisIdx * 2 * Math.PI) / AXES.length;
    const r = (Math.max(0, Math.min(100, val)) / 100) * R;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  };

  const toPoly = (s: TradeoffScores) =>
    AXES.map((a, i) => pt(i, s[a.key]).join(',')).join(' ');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-800">Coupled Design Trade-Off Profile</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full border border-slate-400 bg-slate-200" />
            Baseline VBTS
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            {label}
          </span>
        </div>
      </div>

      <svg viewBox="0 0 290 232" className="mx-auto h-52 w-full max-w-[300px]">
        {/* Concentric hexagonal grid */}
        {[25, 50, 75, 100].map((ring) => (
          <polygon
            key={ring}
            points={AXES.map((_, i) => pt(i, ring).join(',')).join(' ')}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={ring === 100 ? 1.2 : 0.8}
          />
        ))}
        {/* Spokes & Labels */}
        {AXES.map((a, i) => {
          const [x2, y2] = pt(i, 100);
          const [lx, ly] = pt(i, 122);
          return (
            <g key={a.key}>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#E2E8F0" strokeWidth={0.8} />
              <text
                x={lx}
                y={ly + 3}
                textAnchor="middle"
                fontSize={9.5}
                fontWeight={600}
                fill="#334155"
              >
                {a.label}
              </text>
            </g>
          );
        })}
        {/* Baseline polygon */}
        <polygon
          points={toPoly(BASELINE_SCORES)}
          fill="rgba(148, 163, 184, 0.14)"
          stroke="#94A3B8"
          strokeWidth={1.4}
          strokeDasharray="4 3"
        />
        {/* Active lever polygon */}
        <polygon
          points={toPoly(scores)}
          fill={`${accentColor}2E`}
          stroke={accentColor}
          strokeWidth={2.2}
        />
        {AXES.map((a, i) => {
          const [px, py] = pt(i, scores[a.key]);
          return <circle key={a.key} cx={px} cy={py} r={3.2} fill={accentColor} stroke="#fff" strokeWidth={1} />;
        })}
      </svg>

      <div className="mt-1 grid grid-cols-3 gap-1.5 text-center">
        {AXES.map((a) => {
          const delta = Math.round(scores[a.key] - BASELINE_SCORES[a.key]);
          return (
            <div key={a.key} className="rounded bg-slate-50 px-1.5 py-1">
              <div className="text-[10px] text-slate-500">{a.label}</div>
              <div className="font-mono text-xs font-semibold text-slate-800">
                {Math.round(scores[a.key])}
                <span
                  className={`ml-1 text-[10px] ${
                    delta > 0 ? 'text-emerald-700' : delta < 0 ? 'text-rose-600' : 'text-slate-400'
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
