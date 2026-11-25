import { useState } from 'react';
import { Compass, Link2, CheckCircle2, AlertTriangle, Target } from 'lucide-react';
import {
  CHALLENGES,
  ROADMAP_COUPLINGS,
  type ChallengeId,
} from '../../data/futureRoadmap';

type Selection =
  | { kind: 'challenge'; id: ChallengeId }
  | { kind: 'coupling'; id: number };

export function RoadmapModule() {
  const [selection, setSelection] = useState<Selection>({ kind: 'challenge', id: '5.1' });

  const selectedChallenge =
    selection.kind === 'challenge'
      ? CHALLENGES.find((c) => c.id === selection.id)!
      : null;

  const selectedCoupling =
    selection.kind === 'coupling'
      ? ROADMAP_COUPLINGS.find((c) => c.id === selection.id)!
      : null;

  const isChallengeHighlighted = (id: ChallengeId) => {
    if (selection.kind === 'challenge') return selection.id === id;
    return selectedCoupling?.from === id || selectedCoupling?.to === id;
  };

  const isCouplingHighlighted = (num: number) => {
    if (selection.kind === 'coupling') return selection.id === num;
    const c = ROADMAP_COUPLINGS.find((x) => x.id === num);
    return c ? c.from === selection.id || c.to === selection.id : false;
  };

  return (
    <section id="roadmap" className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1EBE4] px-3 py-1 text-xs font-semibold text-[#6E4E37]">
          Section 5 · Open Challenges &amp; Unified Direction
        </span>
        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
          Integrated Future Directions Closed-Loop Roadmap
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Rather than evolving in isolation, the five open challenges reinforce one another across an online–offline robotic loop. Click any challenge block (5.1–5.5) or numbered coupling (1–6) to inspect its role and research priorities.
        </p>
      </div>

      {/* Interactive Loop Diagram + Detail Inspector */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Interactive SVG mirroring Fig. 6 */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:col-span-7">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">
              Self-Maintaining, Hardware-Agnostic Tactile Intelligence Loop
            </span>
            <span className="text-[11px] text-slate-500">Click boxes or numbered links</span>
          </div>

          <svg viewBox="0 0 600 415" className="w-full min-w-[520px]">
            <defs>
              <marker id="arrDark" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
              </marker>
              <marker id="arrHi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
              </marker>
            </defs>

            {/* Online dashed container */}
            <rect x={32} y={10} width={554} height={272} rx={12} fill="#FAFAF9" stroke="#94A3B8" strokeWidth={1.2} strokeDasharray="6 4" />
            <text x={44} y={26} fontSize={10} fontStyle="italic" fill="#64748B">Online (on the robot)</text>

            {/* Offline dashed container */}
            <rect x={32} y={304} width={554} height={102} rx={12} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={1.2} strokeDasharray="6 4" />
            <text x={44} y={320} fontSize={10} fontStyle="italic" fill="#64748B">Offline (data &amp; benchmarks)</text>

            {/* 5.1 Durability */}
            <g
              className="cursor-pointer"
              onClick={() => setSelection({ kind: 'challenge', id: '5.1' })}
            >
              <rect
                x={48} y={36} width={522} height={64} rx={8}
                fill="#F3EAF8"
                stroke={isChallengeHighlighted('5.1') ? '#7E4A96' : '#C4A5D4'}
                strokeWidth={isChallengeHighlighted('5.1') ? 2.6 : 1.3}
              />
              <text x={62} y={56} fontSize={12} fontWeight={700} fill="#1E293B">5.1 Sensor Reliability &amp; Durability</text>
              <text x={62} y={73} fontSize={10} fill="#475569">Abrasion-resistant coatings · Keyed replaceable pads · Online wear &amp; drift self-monitoring</text>
              <text x={62} y={88} fontSize={10} fill="#475569">In-situ recalibration · Endurance benchmarks across shear, impact &amp; healing cycles</text>
            </g>

            {/* Embodied Control Container */}
            <rect x={48} y={128} width={332} height={140} rx={10} fill="#FDECE7" stroke="#DE8F7C" strokeWidth={1.3} />
            <text x={214} y={143} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#7C2D12">Embodied Tactile Control</text>

            {/* 5.3 Multimodal Alignment */}
            <g
              className="cursor-pointer"
              onClick={() => setSelection({ kind: 'challenge', id: '5.3' })}
            >
              <rect
                x={58} y={150} width={312} height={46} rx={7}
                fill="#FFF8F6"
                stroke={isChallengeHighlighted('5.3') ? '#C25B45' : '#E5A899'}
                strokeWidth={isChallengeHighlighted('5.3') ? 2.5 : 1.2}
              />
              <text x={68} y={168} fontSize={11.5} fontWeight={700} fill="#1E293B">5.3 Multimodal Alignment (Slow)</text>
              <text x={68} y={185} fontSize={9.5} fill="#475569">Dual-granularity semantics + contact states · Tactile grounding tests</text>
            </g>

            {/* 5.4 Reactive Tactile Feedback */}
            <g
              className="cursor-pointer"
              onClick={() => setSelection({ kind: 'challenge', id: '5.4' })}
            >
              <rect
                x={58} y={214} width={312} height={46} rx={7}
                fill="#FFF8F6"
                stroke={isChallengeHighlighted('5.4') ? '#B84A39' : '#E5A899'}
                strokeWidth={isChallengeHighlighted('5.4') ? 2.5 : 1.2}
              />
              <text x={68} y={232} fontSize={11.5} fontWeight={700} fill="#1E293B">5.4 Reactive Tactile Feedback (Fast)</text>
              <text x={68} y={249} fontSize={9.5} fill="#475569">Fast elastomers + event/high-fps optics · Event-triggered slip arrest</text>
            </g>

            {/* 5.5 Cross-Sensor Generalization */}
            <g
              className="cursor-pointer"
              onClick={() => setSelection({ kind: 'challenge', id: '5.5' })}
            >
              <rect
                x={404} y={136} width={166} height={132} rx={8}
                fill="#ECF6E8"
                stroke={isChallengeHighlighted('5.5') ? '#4E8242' : '#9CC290'}
                strokeWidth={isChallengeHighlighted('5.5') ? 2.6 : 1.3}
              />
              <text x={416} y={156} fontSize={11.5} fontWeight={700} fill="#1E293B">5.5 Cross-Sensor</text>
              <text x={416} y={170} fontSize={11.5} fontWeight={700} fill="#1E293B">Generalization</text>
              <text x={416} y={190} fontSize={9.5} fill="#475569">• Physics intermediates</text>
              <text x={416} y={205} fontSize={9.5} fill="#475569">• Hardware metadata</text>
              <text x={416} y={220} fontSize={9.5} fill="#475569">• Few-shot adaptation</text>
              <text x={416} y={235} fontSize={9.5} fill="#475569">• Unit vs. cross-design</text>
              <text x={416} y={250} fontSize={9.5} fill="#475569">  transfer protocols</text>
            </g>

            {/* 5.2 Scalable Tactile Data */}
            <g
              className="cursor-pointer"
              onClick={() => setSelection({ kind: 'challenge', id: '5.2' })}
            >
              <rect
                x={48} y={328} width={522} height={66} rx={8}
                fill="#E8F4FA"
                stroke={isChallengeHighlighted('5.2') ? '#2B7A9E' : '#8EC3DC'}
                strokeWidth={isChallengeHighlighted('5.2') ? 2.6 : 1.3}
              />
              <text x={62} y={348} fontSize={12} fontWeight={700} fill="#1E293B">5.2 Scalable Tactile Data</text>
              <text x={62} y={365} fontSize={10} fill="#475569">Open schemas (hardware descriptors, calibration, wear state, counting units) · Auto-annotation</text>
              <text x={62} y={381} fontSize={10} fill="#475569">Deployment logs with failures &amp; recoveries · Evaluation by non-redundant contact diversity</text>
            </g>

            {/* Couplings (1)-(6) */}
            {/* Link 1: 5.1 -> 5.5 */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 1 })}>
              <line x1={486} y1={100} x2={486} y2={134} stroke={isCouplingHighlighted(1) ? '#D97706' : '#334155'} strokeWidth={isCouplingHighlighted(1) ? 2.4 : 1.5} markerEnd={isCouplingHighlighted(1) ? 'url(#arrHi)' : 'url(#arrDark)'} />
              <circle cx={486} cy={116} r={9} fill={isCouplingHighlighted(1) ? '#D97706' : '#1E3A5F'} />
              <text x={486} y={119.5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#FFF">1</text>
              <text x={500} y={120} fontSize={9.5} fontStyle="italic" fill="#334155">pad swap, drift</text>
            </g>

            {/* Link 2: 5.1 <-> Control */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 2 })}>
              <line x1={142} y1={100} x2={142} y2={126} stroke={isCouplingHighlighted(2) ? '#D97706' : '#334155'} strokeWidth={isCouplingHighlighted(2) ? 2.4 : 1.5} markerEnd={isCouplingHighlighted(2) ? 'url(#arrHi)' : 'url(#arrDark)'} />
              <line x1={290} y1={128} x2={290} y2={102} stroke={isCouplingHighlighted(2) ? '#D97706' : '#334155'} strokeWidth={isCouplingHighlighted(2) ? 2.4 : 1.5} markerEnd={isCouplingHighlighted(2) ? 'url(#arrHi)' : 'url(#arrDark)'} />
              <circle cx={118} cy={114} r={9} fill={isCouplingHighlighted(2) ? '#D97706' : '#1E3A5F'} />
              <text x={118} y={117.5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#FFF">2</text>
              <text x={152} y={117} fontSize={9.2} fontStyle="italic" fill="#334155">health &amp; limits</text>
              <text x={282} y={117} textAnchor="end" fontSize={9.2} fontStyle="italic" fill="#334155">load history</text>
            </g>

            {/* Link 3: 5.2 -> 5.5 */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 3 })}>
              <line x1={486} y1={328} x2={486} y2={270} stroke={isCouplingHighlighted(3) ? '#D97706' : '#334155'} strokeWidth={isCouplingHighlighted(3) ? 2.4 : 1.5} markerEnd={isCouplingHighlighted(3) ? 'url(#arrHi)' : 'url(#arrDark)'} />
              <circle cx={486} cy={294} r={9} fill={isCouplingHighlighted(3) ? '#D97706' : '#1E3A5F'} />
              <text x={486} y={297.5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#FFF">3</text>
              <text x={472} y={297} textAnchor="end" fontSize={9.2} fontStyle="italic" fill="#334155">multi-sensor pretraining</text>
            </g>

            {/* Link 4: 5.5 -> 5.3 & 5.4 */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 4 })}>
              <line x1={404} y1={174} x2={372} y2={174} stroke={isCouplingHighlighted(4) ? '#D97706' : '#334155'} strokeWidth={isCouplingHighlighted(4) ? 2.4 : 1.5} markerEnd={isCouplingHighlighted(4) ? 'url(#arrHi)' : 'url(#arrDark)'} />
              <line x1={404} y1={236} x2={372} y2={236} stroke={isCouplingHighlighted(4) ? '#D97706' : '#334155'} strokeWidth={isCouplingHighlighted(4) ? 2.4 : 1.5} markerEnd={isCouplingHighlighted(4) ? 'url(#arrHi)' : 'url(#arrDark)'} />
              <circle cx={392} cy={205} r={9} fill={isCouplingHighlighted(4) ? '#D97706' : '#1E3A5F'} />
              <text x={392} y={208.5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#FFF">4</text>
            </g>

            {/* Link 5: 5.3 <-> 5.4 */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 5 })}>
              <line x1={142} y1={196} x2={142} y2={212} stroke={isCouplingHighlighted(5) ? '#D97706' : '#334155'} strokeWidth={isCouplingHighlighted(5) ? 2.2 : 1.4} markerEnd={isCouplingHighlighted(5) ? 'url(#arrHi)' : 'url(#arrDark)'} />
              <line x1={290} y1={214} x2={290} y2={198} stroke={isCouplingHighlighted(5) ? '#D97706' : '#334155'} strokeWidth={isCouplingHighlighted(5) ? 2.2 : 1.4} markerEnd={isCouplingHighlighted(5) ? 'url(#arrHi)' : 'url(#arrDark)'} />
              <circle cx={214} cy={205} r={8.5} fill={isCouplingHighlighted(5) ? '#D97706' : '#1E3A5F'} />
              <text x={214} y={208.5} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">5</text>
            </g>

            {/* Link 6: Control -> 5.2 + Outer Feedback Loop */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 6 })}>
              <line x1={214} y1={268} x2={214} y2={326} stroke={isCouplingHighlighted(6) ? '#D97706' : '#334155'} strokeWidth={isCouplingHighlighted(6) ? 2.4 : 1.5} markerEnd={isCouplingHighlighted(6) ? 'url(#arrHi)' : 'url(#arrDark)'} />
              <circle cx={190} cy={294} r={9} fill={isCouplingHighlighted(6) ? '#D97706' : '#1E3A5F'} />
              <text x={190} y={297.5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#FFF">6</text>
              <text x={226} y={297} fontSize={9.2} fontStyle="italic" fill="#334155">logs &amp; failures</text>
              {/* Outer pretraining loop back up */}
              <polyline
                points="48,362 14,362 14,198 46,198"
                fill="none"
                stroke={isCouplingHighlighted(6) ? '#D97706' : '#475569'}
                strokeWidth={1.5}
                markerEnd={isCouplingHighlighted(6) ? 'url(#arrHi)' : 'url(#arrDark)'}
              />
              <text x={11} y={282} textAnchor="middle" fontSize={8.8} fontStyle="italic" fill="#475569" transform="rotate(-90 11 282)">
                pretraining &amp; benchmarks
              </text>
            </g>
          </svg>

          {/* Quick pills for couplings */}
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
            {ROADMAP_COUPLINGS.map((cp) => {
              const active = selection.kind === 'coupling' && selection.id === cp.id;
              return (
                <button
                  key={cp.id}
                  onClick={() => setSelection({ kind: 'coupling', id: cp.id })}
                  className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[10.5px] font-medium transition ${
                    active
                      ? 'bg-[#D97706] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ({cp.id}) {cp.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Structured Inspector Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
          {selectedChallenge && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  style={{ backgroundColor: selectedChallenge.bg, color: selectedChallenge.color }}
                  className="rounded-full px-2.5 py-0.5 font-mono text-xs font-bold"
                >
                  Section {selectedChallenge.id} · {selectedChallenge.loopRole}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-slate-900">
                {selectedChallenge.title}
              </h3>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-slate-800">
                    <Compass className="h-3.5 w-3.5 text-[#2B5B84]" /> Why It Matters
                  </div>
                  <p className="text-slate-600">{selectedChallenge.whyItMatters}</p>
                </div>

                <div className="rounded-xl bg-amber-50/75 p-3">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-amber-900">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-700" /> Unresolved Bottleneck
                  </div>
                  <p className="text-amber-950/85">{selectedChallenge.currentGap}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-slate-900">
                    <Target className="h-3.5 w-3.5 text-[#2E7D5B]" /> Future Research Priorities
                  </div>
                  <ul className="list-disc space-y-1 pl-4 text-slate-700">
                    {selectedChallenge.futureDirections.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-emerald-50/70 p-3">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-emerald-900">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> Benchmarks &amp; Unlocked Impact
                  </div>
                  <p className="text-emerald-950/85">
                    <strong>Metrics:</strong> {selectedChallenge.benchmarks}
                  </p>
                  <p className="mt-1 text-emerald-950/85">
                    <strong>Unlocked:</strong> {selectedChallenge.unlockedCapability}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedCoupling && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-mono text-xs font-bold text-amber-900">
                <Link2 className="h-3.5 w-3.5" /> Cross-Challenge Coupling #{selectedCoupling.id}
              </div>
              <h3 className="font-serif text-2xl font-semibold text-slate-900">
                {selectedCoupling.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-700">
                {selectedCoupling.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[selectedCoupling.from, selectedCoupling.to].map((cid, idx) => {
                  const ch = CHALLENGES.find((c) => c.id === cid)!;
                  return (
                    <button
                      key={cid}
                      onClick={() => setSelection({ kind: 'challenge', id: cid })}
                      style={{ backgroundColor: ch.bg, borderColor: ch.border }}
                      className="cursor-pointer rounded-xl border p-3 text-left transition hover:shadow-xs"
                    >
                      <div className="font-mono text-[10px] font-bold uppercase" style={{ color: ch.color }}>
                        {idx === 0 ? 'Source' : selectedCoupling.bidirectional ? 'Bidirectional Partner' : 'Target'} · Sec. {ch.id}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold text-slate-900">{ch.shortTitle}</div>
                      <div className="mt-1 text-[10.5px] font-medium text-slate-600 underline">
                        Inspect challenge →
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
