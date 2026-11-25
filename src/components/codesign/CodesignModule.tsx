import { useMemo, useState } from 'react';
import { AlertTriangle, Compass, Layers, ArrowRight } from 'lucide-react';
import {
  HARDWARE_GOALS,
  COUPLED_CONFLICTS,
  ADVISOR_SCENARIOS,
  type GoalBadge,
  type HardwareLever,
  type TradeoffScores,
} from '../../data/hardwareGoals';
import { MorphingSchematic } from './MorphingSchematic';
import { TradeoffRadar } from './TradeoffRadar';

interface CodesignModuleProps {
  onSelectSensorsForCompare: (ids: string[]) => void;
}

const ALL_LEVERS: HardwareLever[] = HARDWARE_GOALS.flatMap((g) => g.levers);

export function CodesignModule({ onSelectSensorsForCompare }: CodesignModuleProps) {
  const [activeGoalId, setActiveGoalId] = useState<GoalBadge>('Mi');
  const [activeLeverId, setActiveLeverId] = useState<string>('folded_optics');
  const [secondLeverId, setSecondLeverId] = useState<string>('');
  const [activeAdvisorId, setActiveAdvisorId] = useState<string | null>(null);

  const activeGoal = HARDWARE_GOALS.find((g) => g.id === activeGoalId)!;
  const activeLever = ALL_LEVERS.find((l) => l.id === activeLeverId) ?? activeGoal.levers[0];
  const secondLever = ALL_LEVERS.find((l) => l.id === secondLeverId) ?? null;

  const selectGoal = (gid: GoalBadge) => {
    setActiveGoalId(gid);
    const goal = HARDWARE_GOALS.find((g) => g.id === gid)!;
    setActiveLeverId(goal.levers[0].id);
    setActiveAdvisorId(null);
  };

  // Blend radar scores when a secondary lever is combined
  const combinedScores: TradeoffScores = useMemo(() => {
    if (!secondLever || secondLever.id === activeLever.id) return activeLever.scores;
    const s1 = activeLever.scores;
    const s2 = secondLever.scores;
    // Combining two complex hardware levers naturally increases calibration burden
    return {
      compactness: Math.round((s1.compactness + s2.compactness) / 2 - 4),
      coverage: Math.round((s1.coverage + s2.coverage) / 2),
      spatialDetail: Math.round((s1.spatialDetail + s2.spatialDetail) / 2),
      forceCapability: Math.round((s1.forceCapability + s2.forceCapability) / 2),
      temporalBandwidth: Math.round((s1.temporalBandwidth + s2.temporalBandwidth) / 2),
      calibrationEase: Math.max(20, Math.round(Math.min(s1.calibrationEase, s2.calibrationEase) - 10)),
    };
  }, [activeLever, secondLever]);

  const activeConflict = useMemo(() => {
    if (!secondLever) return null;
    return (
      COUPLED_CONFLICTS.find(
        (c) =>
          (c.leverA === activeLever.id && c.leverB === secondLever.id) ||
          (c.leverB === activeLever.id && c.leverA === secondLever.id)
      ) ?? null
    );
  }, [activeLever, secondLever]);

  const applyScenario = (scenarioId: string) => {
    const sc = ADVISOR_SCENARIOS.find((s) => s.id === scenarioId);
    if (!sc) return;
    setActiveAdvisorId(scenarioId);
    const first = ALL_LEVERS.find((l) => l.id === sc.recommendedLevers[0]);
    if (first) {
      setActiveGoalId(first.goalId);
      setActiveLeverId(first.id);
    }
    setSecondLeverId(sc.recommendedLevers[1] ?? '');
  };

  return (
    <section id="codesign" className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF7F2] px-3 py-1 text-xs font-semibold text-[#2E7D5B]">
          Section 3 · Fig. 3 &amp; Table 3
        </span>
        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
          6-Goal Hardware Co-Design &amp; Trade-Off Workbench
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          No single VBTS excels at every goal. Select any of the six hardware design goals below to see how physical changes relative to the baseline sensor reshape signal formation, calibration requirements, and coupled trade-offs.
        </p>
      </div>

      {/* 6 Goal Tabs */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {HARDWARE_GOALS.map((g) => {
          const selected = g.id === activeGoalId;
          return (
            <button
              key={g.id}
              onClick={() => selectGoal(g.id)}
              style={{
                borderColor: selected ? g.color : '#E2E8F0',
                backgroundColor: selected ? g.bgColor : '#FFFFFF',
              }}
              className="cursor-pointer rounded-xl border-2 p-3 text-left transition hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{ backgroundColor: g.color }}
                  className="rounded px-1.5 py-0.5 font-mono text-[11px] font-bold text-white"
                >
                  {g.id}
                </span>
                <span className="font-mono text-[10px] text-slate-500">{g.section}</span>
              </div>
              <div className="mt-1.5 text-xs font-semibold text-slate-900">{g.name}</div>
            </button>
          );
        })}
      </div>

      {/* Goal Banner + Lever Selector */}
      <div
        style={{ backgroundColor: activeGoal.bgColor, borderColor: activeGoal.borderColor }}
        className="rounded-xl border p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {activeGoal.name} <span className="font-mono text-xs font-normal text-slate-600">({activeGoal.section})</span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-700">{activeGoal.tagline}</p>
            <p className="mt-1 text-xs text-slate-600">
              <strong>Core bottleneck:</strong> {activeGoal.coreBottleneck}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeGoal.levers.map((lv) => (
              <button
                key={lv.id}
                onClick={() => {
                  setActiveLeverId(lv.id);
                  setActiveAdvisorId(null);
                }}
                style={
                  lv.id === activeLever.id
                    ? { backgroundColor: activeGoal.color, color: '#FFFFFF' }
                    : undefined
                }
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  lv.id === activeLever.id
                    ? 'shadow-xs'
                    : 'bg-white/90 text-slate-700 hover:bg-white'
                }`}
              >
                {lv.fig3Label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Co-Design Split: Morphing Schematic + Lever Details + Coupled Trade-Off Radar */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <MorphingSchematic lever={activeLever} />

          {/* Detailed Engineering Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-900">{activeLever.name}</h4>
              <div className="flex flex-wrap gap-1">
                {activeLever.modifiedParts.map((part, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-[#D48A5C]/40 bg-[#FFF5EE] px-2 py-0.5 text-[10px] font-medium text-[#9A4D24]"
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-700">{activeLever.mechanism}</p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-[11px] font-semibold text-slate-800">Calibration &amp; Compute Impact</div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{activeLever.calibrationImpact}</p>
              </div>
              <div className="rounded-lg bg-amber-50/70 p-3">
                <div className="text-[11px] font-semibold text-amber-900">Coupled Engineering Trade-Off</div>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-950/80">{activeLever.tradeoffNote}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 text-[11px]">
              <span className="font-semibold text-slate-700">Representative sensors:</span>
              {activeLever.representatives.map((r) => (
                <span key={r} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Trade-off Radar + Multi-Lever Combination Tester */}
        <div className="space-y-4 lg:col-span-5">
          <TradeoffRadar
            scores={combinedScores}
            accentColor={activeGoal.color}
            label={secondLever ? `${activeLever.fig3Label} + ${secondLever.fig3Label}` : activeLever.fig3Label}
          />

          {/* Combine Secondary Lever to Explore Physical Conflicts */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Layers className="h-3.5 w-3.5 text-[#9A4D24]" />
              Combine with a Second Hardware Lever (Test Conflicts)
            </div>
            <select
              value={secondLeverId}
              onChange={(e) => setSecondLeverId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="">None (single lever profile)</option>
              {HARDWARE_GOALS.map((g) => (
                <optgroup key={g.id} label={`${g.id} · ${g.name}`}>
                  {g.levers
                    .filter((l) => l.id !== activeLever.id)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.fig3Label}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>

            {activeConflict ? (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-950">
                <div className="flex items-center gap-1.5 font-semibold text-rose-800">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Coupled Physical Conflict: {activeConflict.title}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed">{activeConflict.explanation}</p>
              </div>
            ) : secondLever ? (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-[11px] text-slate-700">
                Combining <strong>{activeLever.fig3Label}</strong> with <strong>{secondLever.fig3Label}</strong> blends their mechanical/optical profiles while adding multi-subsystem calibration overhead.
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-slate-500">
                Tip: Try combining <em>Elastomer design</em> + <em>Event-based imaging</em>, or <em>Reflective surfaces</em> + <em>Tactile &amp; visual</em> to inspect coupled physical bottlenecks.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Design Advisor Wizard */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <Compass className="h-4 w-4 text-[#2B5B84]" />
          <h3 className="font-serif text-lg font-semibold text-slate-900">
            Task-Driven Sensor Design Advisor
          </h3>
          <span className="text-xs text-slate-500">
            Select a robotic manipulation target to load matching hardware levers and compare candidate sensors.
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {ADVISOR_SCENARIOS.map((sc) => {
            const isSel = activeAdvisorId === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => applyScenario(sc.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-xl border p-3 transition ${
                  isSel
                    ? 'border-[#2B5B84] bg-[#EEF5FB] shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900">{sc.title}</div>
                  <p className="mt-1 text-[11px] leading-snug text-slate-600">{sc.description}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    applyScenario(sc.id);
                    onSelectSensorsForCompare(sc.recommendedSensorIds);
                  }}
                  className="mt-2.5 inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#2B5B84] hover:underline"
                >
                  Compare {sc.recommendedSensorIds.length} sensors <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
        {activeAdvisorId && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-950">
            <strong>Design caveat:</strong>{' '}
            {ADVISOR_SCENARIOS.find((s) => s.id === activeAdvisorId)?.caveat}
          </div>
        )}
      </div>
    </section>
  );
}
