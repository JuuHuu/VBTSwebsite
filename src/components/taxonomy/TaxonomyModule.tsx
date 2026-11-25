import { useMemo, useState } from 'react';
import {
  Search,
  GitBranch,
  LayoutGrid,
  Check,
  Plus,
  X,
  ExternalLink,
  Scale,
  Filter,
} from 'lucide-react';
import {
  SENSORS,
  TAXONOMY_BRANCHES,
  COMPARE_PRESETS,
  type SensorEntry,
  type SensorCueType,
} from '../../data/sensors';
import { GOAL_BADGE_META, type GoalBadge } from '../../data/hardwareGoals';

interface TaxonomyModuleProps {
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onSetCompareIds: (ids: string[]) => void;
}

const CUE_LABELS: Record<SensorCueType, string> = {
  marker: 'Marker Displacement',
  shading: 'Surface Shading',
  multiview: 'Multiple Viewpoints',
  events: 'Event-Based',
  hybrid: 'Hybrid / Multimodal',
};

function GoalBadgePill({ goal, secondary = false }: { goal: GoalBadge; secondary?: boolean }) {
  const m = GOAL_BADGE_META[goal];
  return (
    <span
      title={`${m.name} (${secondary ? 'Secondary' : 'Primary'} Goal)`}
      style={
        secondary
          ? { color: m.color, borderColor: m.border, backgroundColor: '#FFFFFF' }
          : { color: '#FFFFFF', borderColor: m.border, backgroundColor: m.color }
      }
      className="inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none"
    >
      {m.short}
    </span>
  );
}

export function TaxonomyModule({
  compareIds,
  onToggleCompare,
  onSetCompareIds,
}: TaxonomyModuleProps) {
  const [view, setView] = useState<'tree' | 'grid'>('tree');
  const [query, setQuery] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<GoalBadge[]>([]);
  const [selectedCue, setSelectedCue] = useState<SensorCueType | 'all'>('all');
  const [minYear, setMinYear] = useState(2000);
  const [maxYear, setMaxYear] = useState(2026);
  const [detailSensor, setDetailSensor] = useState<SensorEntry | null>(null);

  const toggleGoal = (g: GoalBadge) => {
    setSelectedGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SENSORS.filter((s) => {
      if (s.year < minYear || s.year > maxYear) return false;
      if (selectedCue !== 'all' && s.opticalCue !== selectedCue) return false;
      if (selectedGoals.length > 0) {
        const hasGoal = selectedGoals.some(
          (g) => s.primaryGoal === g || s.secondaryGoal === g
        );
        if (!hasGoal) return false;
      }
      if (q) {
        const blob = `${s.name} ${s.branch} ${s.subbranch} ${s.summary} ${s.architecture} ${s.extractableSignals} ${s.citationShort}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [query, selectedGoals, selectedCue, minYear, maxYear]);

  const compareSensors = useMemo(
    () => compareIds.map((id) => SENSORS.find((s) => s.id === id)).filter(Boolean) as SensorEntry[],
    [compareIds]
  );

  // Group by Branch -> Subbranch for Tree View
  const groupedTree = useMemo(() => {
    return TAXONOMY_BRANCHES.map((branch) => {
      const inBranch = filtered.filter((s) => s.branch === branch);
      const subNames = Array.from(new Set(inBranch.map((s) => s.subbranch)));
      return {
        branch,
        count: inBranch.length,
        subgroups: subNames.map((sub) => ({
          subbranch: sub,
          items: inBranch.filter((s) => s.subbranch === sub).sort((a, b) => a.year - b.year),
        })),
      };
    }).filter((b) => b.count > 0);
  }, [filtered]);

  const renderCard = (s: SensorEntry) => {
    const isCompared = compareIds.includes(s.id);
    const borderColor = s.primaryGoal ? GOAL_BADGE_META[s.primaryGoal].border : '#CBD5E1';
    return (
      <div
        key={s.id}
        style={{ borderColor: isCompared ? '#1E3A5F' : borderColor }}
        className={`group relative flex flex-col justify-between rounded-xl border bg-white p-2.5 transition hover:shadow-md ${
          s.crossListed ? 'border-dashed' : 'border-solid'
        } ${isCompared ? 'ring-2 ring-[#2B5B84]/35' : ''}`}
      >
        <div>
          {/* Top badges row */}
          <div className="mb-1.5 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              {s.primaryGoal && <GoalBadgePill goal={s.primaryGoal} />}
              {s.secondaryGoal && <GoalBadgePill goal={s.secondaryGoal} secondary />}
              {!s.primaryGoal && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500">
                  Early
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] font-medium text-slate-500">{s.year}</span>
          </div>

          {/* Reference Thumbnail */}
          <button
            type="button"
            onClick={() => setDetailSensor(s)}
            className="flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-1"
          >
            {s.thumbnail ? (
              <img
                src={s.thumbnail}
                alt={s.name}
                loading="lazy"
                className="max-h-full max-w-full object-contain transition duration-200 group-hover:scale-105"
              />
            ) : (
              <span className="text-[11px] text-slate-400">No preview</span>
            )}
          </button>

          {/* Title & cue */}
          <button
            type="button"
            onClick={() => setDetailSensor(s)}
            className="mt-2 block w-full cursor-pointer text-left"
          >
            <div className="truncate text-xs font-semibold text-slate-900 group-hover:text-[#2B5B84]">
              {s.name}
            </div>
            <div className="mt-0.5 truncate text-[10px] text-slate-500">
              {CUE_LABELS[s.opticalCue]}
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="mt-2 flex items-center justify-between gap-1 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => setDetailSensor(s)}
            className="cursor-pointer text-[10px] font-medium text-slate-600 hover:text-[#2B5B84]"
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => onToggleCompare(s.id)}
            disabled={!isCompared && compareIds.length >= 4}
            className={`inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold transition ${
              isCompared
                ? 'bg-[#1E3A5F] text-white'
                : compareIds.length >= 4
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-slate-100 text-slate-700 hover:bg-[#E8F1F8] hover:text-[#2B5B84]'
            }`}
          >
            {isCompared ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
            {isCompared ? 'Pinned' : 'Compare'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <section id="taxonomy" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0EBF8] px-3 py-1 text-xs font-semibold text-[#63488E]">
            Section 3 · Fig. 4 Component-Based Taxonomy
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
            VBTS Taxonomy Explorer &amp; Side-by-Side Comparator
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Browse {SENSORS.length} representative vision-based tactile sensors organized by early architectures, sensing interface, optical system, and form factor. Filter by design goals, optical cue, or year, and pin up to 4 sensors to compare side by side.
          </p>
        </div>

        {/* View switcher */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
          <button
            onClick={() => setView('tree')}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              view === 'tree' ? 'bg-[#1E3A5F] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" /> Taxonomy Branches
          </button>
          <button
            onClick={() => setView('grid')}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              view === 'grid' ? 'bg-[#1E3A5F] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Timeline Grid
          </button>
        </div>
      </div>

      {/* Filter & Legend Toolbar */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid gap-3 md:grid-cols-12">
          {/* Search */}
          <div className="relative md:col-span-4">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sensor, cue, calibration, or paper..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-900 focus:border-[#2B5B84] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Optical cue filter */}
          <div className="flex items-center gap-2 md:col-span-4">
            <Filter className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <select
              value={selectedCue}
              onChange={(e) => setSelectedCue(e.target.value as SensorCueType | 'all')}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs text-slate-800"
            >
              <option value="all">All Optical Cues</option>
              <option value="shading">Surface Shading (Photometric)</option>
              <option value="marker">Marker Displacement</option>
              <option value="multiview">Multiple Viewpoints (Stereo/MLA)</option>
              <option value="events">Brightness-Change Events</option>
              <option value="hybrid">Hybrid / Multimodal</option>
            </select>
          </div>

          {/* Year Range */}
          <div className="flex items-center gap-2 text-xs md:col-span-4">
            <span className="shrink-0 font-medium text-slate-600">Years:</span>
            <input
              type="range"
              min={2000}
              max={2026}
              value={minYear}
              onChange={(e) => setMinYear(Math.min(+e.target.value, maxYear))}
              className="w-full"
            />
            <span className="shrink-0 font-mono text-xs font-semibold text-slate-800">
              {minYear}–{maxYear}
            </span>
          </div>
        </div>

        {/* Design Goal Badge Filter + Persistent Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-slate-600">Filter by Goal:</span>
            {(Object.keys(GOAL_BADGE_META) as GoalBadge[]).map((g) => {
              const m = GOAL_BADGE_META[g];
              const active = selectedGoals.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGoal(g)}
                  style={
                    active
                      ? { backgroundColor: m.color, borderColor: m.color, color: '#fff' }
                      : { borderColor: m.border, color: m.color, backgroundColor: m.bg }
                  }
                  className="cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition"
                >
                  {g} · {m.name}
                </button>
              );
            })}
            {(selectedGoals.length > 0 || query || selectedCue !== 'all' || minYear > 2000) && (
              <button
                onClick={() => {
                  setSelectedGoals([]);
                  setQuery('');
                  setSelectedCue('all');
                  setMinYear(2000);
                  setMaxYear(2026);
                }}
                className="cursor-pointer text-xs font-medium text-rose-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-3.5 rounded-xs bg-[#2B5B84]" /> Primary goal
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-3.5 rounded-xs border border-[#2B5B84] bg-white" /> Secondary goal
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-4 rounded-xs border border-dashed border-slate-500" /> Cross-listed branch
            </span>
            <span className="font-mono font-semibold text-slate-700">{filtered.length} shown</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div id="compare-panel" className="rounded-2xl border-2 border-[#2B5B84]/25 bg-white p-5 shadow-xs">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#2B5B84]" />
            <h3 className="font-serif text-lg font-semibold text-slate-900">
              Side-by-Side Sensor Comparator ({compareSensors.length}/4 pinned)
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Quick presets:</span>
            {COMPARE_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => onSetCompareIds(p.ids)}
                className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:border-[#2B5B84] hover:text-[#2B5B84]"
              >
                {p.label}
              </button>
            ))}
            {compareSensors.length > 0 && (
              <button
                onClick={() => onSetCompareIds([])}
                className="cursor-pointer text-[11px] font-medium text-rose-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {compareSensors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 py-6 text-center text-xs text-slate-500">
            Click <strong>+ Compare</strong> on any sensor cards below (or choose a preset above) to inspect differences in optical cues, architecture, calibration, and trade-offs side by side.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="w-36 py-2 pr-3 align-top text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Attribute
                  </th>
                  {compareSensors.map((s) => (
                    <th key={s.id} className="w-1/4 px-3 py-2 align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={s.thumbnail}
                            alt={s.name}
                            className="h-11 w-11 rounded border border-slate-200 bg-slate-50 object-contain p-0.5"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="font-mono text-[10px] font-normal text-slate-500">
                              {s.year} · {s.subbranch}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onToggleCompare(s.id)}
                          className="cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Remove from comparison"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11.5px]">
                <tr>
                  <td className="py-2 pr-3 font-semibold text-slate-700">Design Goals</td>
                  {compareSensors.map((s) => (
                    <td key={s.id} className="px-3 py-2">
                      <div className="flex gap-1">
                        {s.primaryGoal && <GoalBadgePill goal={s.primaryGoal} />}
                        {s.secondaryGoal && <GoalBadgePill goal={s.secondaryGoal} secondary />}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-semibold text-slate-700">Optical Cue</td>
                  {compareSensors.map((s) => (
                    <td key={s.id} className="px-3 py-2 font-medium text-[#2B5B84]">
                      {CUE_LABELS[s.opticalCue]}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-semibold text-slate-700">Architecture</td>
                  {compareSensors.map((s) => (
                    <td key={s.id} className="px-3 py-2 text-slate-700">{s.architecture}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-semibold text-slate-700">Extractable Cues</td>
                  {compareSensors.map((s) => (
                    <td key={s.id} className="px-3 py-2 text-slate-700">{s.extractableSignals}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-semibold text-slate-700">Calibration</td>
                  {compareSensors.map((s) => (
                    <td key={s.id} className="px-3 py-2 text-slate-700">{s.calibration}</td>
                  ))}
                </tr>
                <tr className="bg-amber-50/40">
                  <td className="py-2 pr-3 font-semibold text-amber-900">Key Trade-Offs</td>
                  {compareSensors.map((s) => (
                    <td key={s.id} className="px-3 py-2 text-amber-950/85">{s.tradeoffs}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-semibold text-slate-700">Reference</td>
                  {compareSensors.map((s) => (
                    <td key={s.id} className="px-3 py-2">
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-[#2B5B84] hover:underline"
                        >
                          {s.citationShort} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-600">{s.citationShort}</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Taxonomy Tree OR Timeline Grid */}
      {view === 'tree' ? (
        <div className="space-y-6">
          {groupedTree.map((branchGroup) => (
            <div key={branchGroup.branch} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-serif text-xl font-semibold text-slate-900">
                  {branchGroup.branch}
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs text-slate-600">
                  {branchGroup.count} sensors
                </span>
              </div>
              <div className="space-y-5">
                {branchGroup.subgroups.map((sg) => (
                  <div key={sg.subbranch}>
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2B5B84]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {sg.subbranch}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {sg.items.map(renderCard)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[...filtered].sort((a, b) => b.year - a.year || a.name.localeCompare(b.name)).map(renderCard)}
        </div>
      )}

      {/* Detail Modal for clicked sensor */}
      {detailSensor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
          onClick={() => setDetailSensor(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={detailSensor.thumbnail}
                  alt={detailSensor.name}
                  className="h-20 w-20 rounded-xl border border-slate-200 bg-slate-50 object-contain p-1"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    {detailSensor.primaryGoal && <GoalBadgePill goal={detailSensor.primaryGoal} />}
                    {detailSensor.secondaryGoal && <GoalBadgePill goal={detailSensor.secondaryGoal} secondary />}
                    <span className="font-mono text-xs text-slate-500">{detailSensor.year}</span>
                  </div>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-slate-900">
                    {detailSensor.name}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {detailSensor.branch} → {detailSensor.subbranch}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDetailSensor(null)}
                className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-700">{detailSensor.summary}</p>

            <dl className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3.5 text-xs">
              <div>
                <dt className="font-semibold text-slate-800">Optical Cue</dt>
                <dd className="text-slate-600">{CUE_LABELS[detailSensor.opticalCue]}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-800">Hardware Architecture</dt>
                <dd className="text-slate-600">{detailSensor.architecture}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-800">Extractable Signals</dt>
                <dd className="text-slate-600">{detailSensor.extractableSignals}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-800">Calibration Requirements</dt>
                <dd className="text-slate-600">{detailSensor.calibration}</dd>
              </div>
              <div>
                <dt className="font-semibold text-amber-900">Key Trade-Offs</dt>
                <dd className="text-amber-950/85">{detailSensor.tradeoffs}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              {detailSensor.url ? (
                <a
                  href={detailSensor.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B5B84] hover:underline"
                >
                  {detailSensor.citationShort} · Open Paper <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-xs text-slate-500">{detailSensor.citationShort}</span>
              )}
              <button
                onClick={() => onToggleCompare(detailSensor.id)}
                className="cursor-pointer rounded-lg bg-[#1E3A5F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2B5B84]"
              >
                {compareIds.includes(detailSensor.id) ? 'Remove from Comparator' : '+ Pin to Comparator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
