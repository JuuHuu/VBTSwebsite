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
    return (
      selectedCoupling?.from === id ||
      selectedCoupling?.secondaryFrom === id ||
      selectedCoupling?.to === id
    );
  };

  const isCouplingHighlighted = (num: number) => {
    if (selection.kind === 'coupling') return selection.id === num;
    const c = ROADMAP_COUPLINGS.find((x) => x.id === num);
    return c
      ? c.from === selection.id ||
          c.secondaryFrom === selection.id ||
          c.to === selection.id
      : false;
  };

  return (
    <section id="roadmap" className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1EBE4] px-3 py-1 text-xs font-semibold text-[#6E4E37]">
          Section 5 · Fig. 6 · Open Challenges &amp; Future Directions
        </span>
        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
          Closed-Loop Future Directions Roadmap
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Mirroring Fig. 6 of the manuscript, the five open challenges connect in a contact-rich connector alignment and insertion loop under visual occlusion. Click any challenge panel (5.1–5.5) or numbered flow (1–5) to inspect its bottleneck, priorities, and role.
        </p>
      </div>

      {/* Interactive Loop Diagram + Detail Inspector */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Interactive SVG mirroring Fig. 6 */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:col-span-7">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">
              Fig. 6 · Connector Alignment &amp; Insertion Loop Under Visual Occlusion
            </span>
            <span className="text-[11px] text-slate-500">Click panels (5.1–5.5) or flows (1–5)</span>
          </div>

          <svg viewBox="0 0 720 472" className="w-full min-w-[560px]">
            <defs>
              <marker id="arrBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
              </marker>
              <marker id="arrHi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
              </marker>
            </defs>

            {/* ==================== Sec. 5.1 Reliability & Durability (Top-Left) ==================== */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'challenge', id: '5.1' })}>
              <rect
                x={12} y={10} width={226} height={138} rx={10}
                fill="#EEF5FA"
                stroke={isChallengeHighlighted('5.1') ? '#2E6692' : '#94B8D4'}
                strokeWidth={isChallengeHighlighted('5.1') ? 2.6 : 1.4}
              />
              <rect x={20} y={17} width={52} height={17} rx={8.5} fill="#2E6692" />
              <text x={46} y={29} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">Sec. 5.1</text>
              <text x={78} y={29} fontSize={11} fontWeight={700} fill="#1E293B">Reliability &amp; durability</text>

              {/* Worn pad box */}
              <rect x={22} y={42} width={88} height={74} rx={6} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={1} />
              <text x={66} y={55} textAnchor="middle" fontSize={9.2} fontWeight={700} fill="#1E293B">Worn pad</text>
              <text x={66} y={66} textAnchor="middle" fontSize={8.2} fill="#64748B">degraded cues</text>
              {/* Worn elastomer mini icon */}
              <rect x={36} y={73} width={60} height={24} rx={4} fill="#CBD5E1" stroke="#64748B" strokeWidth={0.9} />
              <path d="M44 80 L52 86 L49 91 M68 78 L75 84 M80 82 L88 89" stroke="#475569" strokeWidth={1} fill="none" />
              <text x={66} y={110} textAnchor="middle" fontSize={8} fill="#334155">Wear-aware sensing</text>

              {/* Small arrow between pads */}
              <path d="M113 84 L123 84" stroke="#475569" strokeWidth={1.3} markerEnd="url(#arrBlue)" />

              {/* Replacement cartridge box */}
              <rect x={127} y={42} width={101} height={74} rx={6} fill="#FFFFFF" stroke="#2E6692" strokeWidth={1} />
              <text x={177} y={55} textAnchor="middle" fontSize={9.2} fontWeight={700} fill="#1E293B">New cartridge</text>
              <text x={177} y={66} textAnchor="middle" fontSize={8.2} fill="#2E6692">recalibrated</text>
              {/* Clean elastomer + monitor mini icon */}
              <rect x={135} y={74} width={44} height={22} rx={4} fill="#DBEAFE" stroke="#2E6692" strokeWidth={0.9} />
              <circle cx={144} cy={81} r={1.3} fill="#1E3A5F" />
              <circle cx={157} cy={81} r={1.3} fill="#1E3A5F" />
              <circle cx={170} cy={81} r={1.3} fill="#1E3A5F" />
              <circle cx={144} cy={90} r={1.3} fill="#1E3A5F" />
              <circle cx={157} cy={90} r={1.3} fill="#1E3A5F" />
              <circle cx={170} cy={90} r={1.3} fill="#1E3A5F" />
              <rect x={185} y={74} width={35} height={22} rx={3} fill="#1E293B" />
              <path d="M189 86 L195 86 L199 79 L204 91 L208 85 L216 85" stroke="#4ADE80" strokeWidth={1.3} fill="none" />
              <text x={177} y={110} textAnchor="middle" fontSize={8} fill="#334155">In-situ recalibration</text>

              <text x={125} y={136} textAnchor="middle" fontSize={8.8} fill="#334155">
                Keyed swaps · Endurance monitoring
              </text>
            </g>

            {/* ==================== Sec. 5.2 Multimodal Alignment (Top-Right) ==================== */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'challenge', id: '5.2' })}>
              <rect
                x={318} y={10} width={312} height={138} rx={10}
                fill="#EEF7F1"
                stroke={isChallengeHighlighted('5.2') ? '#3B7A57' : '#8FC2A4'}
                strokeWidth={isChallengeHighlighted('5.2') ? 2.6 : 1.4}
              />
              <rect x={326} y={17} width={52} height={17} rx={8.5} fill="#3B7A57" />
              <text x={352} y={29} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">Sec. 5.2</text>
              <text x={384} y={29} fontSize={11} fontWeight={700} fill="#1E293B">Multimodal alignment</text>

              {/* 4 input modality chips */}
              {[
                { y: 44, label: 'Vision', fill: '#E2E8F0' },
                { y: 69, label: 'Touch', fill: '#EDE9FE' },
                { y: 94, label: 'Language', fill: '#F1F5F9' },
                { y: 119, label: 'Robot state', fill: '#E2E8F0' },
              ].map((m) => (
                <g key={m.label}>
                  <rect x={330} y={m.y} width={96} height={20} rx={5} fill={m.fill} stroke="#64748B" strokeWidth={0.9} />
                  <text x={378} y={m.y + 13} textAnchor="middle" fontSize={9.2} fontWeight={600} fill="#1E293B">
                    {m.label}
                  </text>
                </g>
              ))}

              {/* Merge bracket into 2 outputs */}
              <path d="M432 54 L446 54 L446 129 L432 129 M446 91 L460 91 M460 66 L460 116 M460 66 L474 66 M460 116 L474 116" stroke="#3B7A57" strokeWidth={1.6} fill="none" />

              {/* Output 1: Physical cues */}
              <rect x={478} y={42} width={140} height={46} rx={7} fill="#FFFFFF" stroke="#3B7A57" strokeWidth={1} />
              <text x={548} y={56} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#1E293B">Physical cues (F, T)</text>
              <text x={548} y={69} textAnchor="middle" fontSize={8.2} fill="#475569">3D deformation, shear,</text>
              <text x={548} y={80} textAnchor="middle" fontSize={8.2} fill="#475569">local geometry &amp; slip</text>

              {/* Output 2: Task meaning */}
              <rect x={478} y={94} width={140} height={46} rx={7} fill="#FFFFFF" stroke="#3B7A57" strokeWidth={1} />
              <text x={548} y={108} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#1E293B">Task meaning</text>
              <text x={548} y={121} textAnchor="middle" fontSize={8.2} fill="#475569">Plug → socket alignment</text>
              <text x={548} y={132} textAnchor="middle" fontSize={8.2} fill="#475569">&amp; tactile grounding</text>
            </g>

            {/* ==================== Sec. 5.3 Cross-Sensor Generalization (Middle-Left) ==================== */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'challenge', id: '5.3' })}>
              <rect
                x={12} y={190} width={226} height={154} rx={10}
                fill="#F5EFF9"
                stroke={isChallengeHighlighted('5.3') ? '#764F8E' : '#BAA0CC'}
                strokeWidth={isChallengeHighlighted('5.3') ? 2.6 : 1.4}
              />
              <rect x={20} y={197} width={52} height={17} rx={8.5} fill="#764F8E" />
              <text x={46} y={209} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">Sec. 5.3</text>
              <text x={78} y={209} fontSize={10.5} fontWeight={700} fill="#1E293B">Cross-sensor generalization</text>

              <text x={125} y={228} textAnchor="middle" fontSize={8.8} fontWeight={600} fill="#475569">
                Different interfaces (flat · domed · curved)
              </text>

              {/* 3 interface mini shapes */}
              <rect x={26} y={236} width={54} height={24} rx={4} fill="#E0F2FE" stroke="#475569" strokeWidth={1} />
              <text x={53} y={251} textAnchor="middle" fontSize={8} fill="#334155">Flat pad</text>

              <path d="M92 260 L92 246 Q125 228 158 246 L158 260 Z" fill="#E0F2FE" stroke="#475569" strokeWidth={1} />
              <text x={125} y={254} textAnchor="middle" fontSize={8} fill="#334155">Domed</text>

              <path d="M168 258 Q196 238 224 246 L224 260 Q196 252 168 260 Z" fill="#E0F2FE" stroke="#475569" strokeWidth={1} />
              <text x={196} y={255} textAnchor="middle" fontSize={7.8} fill="#334155">Curved</text>

              {/* Down arrow to Shared Physical State */}
              <path d="M125 264 L125 280" stroke="#764F8E" strokeWidth={1.6} markerEnd="url(#arrBlue)" />

              <rect x={28} y={284} width={194} height={50} rx={7} fill="#FFFFFF" stroke="#764F8E" strokeWidth={1} />
              <text x={125} y={299} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#1E293B">
                Shared physical state
              </text>
              <text x={125} y={313} textAnchor="middle" fontSize={8.2} fill="#475569">
                Canonical 3D deformation &amp; traction maps
              </text>
              <text x={125} y={325} textAnchor="middle" fontSize={8.2} fill="#475569">
                Metadata-conditioned post-swap adaptation
              </text>
            </g>

            {/* ==================== Center Scenario: Connector Insertion Under Blocked View ==================== */}
            <g>
              <rect x={252} y={176} width={212} height={172} rx={10} fill="#FAFAF9" stroke="#CBD5E1" strokeWidth={1.1} strokeDasharray="4 3" />
              {/* Speech bubble */}
              <rect x={262} y={184} width={128} height={26} rx={10} fill="#FFFFFF" stroke="#64748B" strokeWidth={1} />
              <text x={326} y={196} textAnchor="middle" fontSize={8.5} fontWeight={600} fill="#1E293B">
                “Align &amp; insert
              </text>
              <text x={326} y={206} textAnchor="middle" fontSize={8.5} fontWeight={600} fill="#1E293B">
                the connector”
              </text>

              {/* Blocked camera icon */}
              <rect x={412} y={188} width={20} height={13} rx={2} fill="#94A3B8" stroke="#334155" strokeWidth={1} />
              <polygon points="412,201 398,258 452,258 432,201" fill="#E2E8F0" opacity={0.55} />
              <text x={428} y={219} textAnchor="middle" fontSize={7.8} fontWeight={700} fill="#475569">Blocked</text>
              <text x={428} y={229} textAnchor="middle" fontSize={7.8} fontWeight={700} fill="#475569">view</text>

              {/* Simplified Robot Arm + VBTS Gripper */}
              <rect x={262} y={316} width={44} height={18} rx={3} fill="#94A3B8" stroke="#334155" strokeWidth={1} />
              <line x1={284} y1={316} x2={312} y2={252} stroke="#64748B" strokeWidth={10} strokeLinecap="round" />
              <line x1={312} y1={252} x2={364} y2={244} stroke="#64748B" strokeWidth={9} strokeLinecap="round" />
              <circle cx={312} cy={252} r={7} fill="#CBD5E1" stroke="#334155" strokeWidth={1.2} />
              <circle cx={364} cy={244} r={6} fill="#CBD5E1" stroke="#334155" strokeWidth={1.2} />

              {/* Gripper with blue VBTS pads holding connector */}
              <rect x={352} y={252} width={24} height={12} rx={2} fill="#CBD5E1" stroke="#334155" strokeWidth={1} />
              <rect x={347} y={264} width={9} height={24} rx={3} fill="#BAE6FD" stroke="#0369A1" strokeWidth={1.1} />
              <rect x={372} y={264} width={9} height={24} rx={3} fill="#BAE6FD" stroke="#0369A1" strokeWidth={1.1} />
              {/* Connector plug */}
              <rect x={358} y={278} width={12} height={11} rx={1.5} fill="#FEF3C7" stroke="#92400E" strokeWidth={1} />
              <line x1={361} y1={289} x2={361} y2={295} stroke="#92400E" strokeWidth={1.3} />
              <line x1={367} y1={289} x2={367} y2={295} stroke="#92400E" strokeWidth={1.3} />
              {/* Down arrow */}
              <path d="M364 298 L364 312" stroke="#1E293B" strokeWidth={1.3} markerEnd="url(#arrBlue)" />
              {/* Socket base */}
              <rect x={338} y={316} width={54} height={18} rx={3} fill="#CBD5E1" stroke="#334155" strokeWidth={1} />
              <rect x={356} y={316} width={18} height={8} fill="#64748B" />

              <text x={358} y={343} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#1E3A5F">
                Tactile-guided alignment
              </text>
            </g>

            {/* ==================== Sec. 5.4 Reactive Tactile Feedback (Middle-Right) ==================== */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'challenge', id: '5.4' })}>
              <rect
                x={480} y={162} width={228} height={218} rx={10}
                fill="#FAF2EE"
                stroke={isChallengeHighlighted('5.4') ? '#8E5B43' : '#CFA58F'}
                strokeWidth={isChallengeHighlighted('5.4') ? 2.6 : 1.4}
              />
              <rect x={488} y={169} width={52} height={17} rx={8.5} fill="#8E5B43" />
              <text x={514} y={181} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">Sec. 5.4</text>
              <text x={546} y={181} fontSize={10.8} fontWeight={700} fill="#1E293B">Reactive tactile feedback</text>

              {/* 3-step insertion strip */}
              {[
                { x: 488, title: '(1) Misalign', sub: 'edge contact' },
                { x: 562, title: '(2) Correct', sub: 'limit force F' },
                { x: 636, title: '(3) Seated', sub: 'verified fit' },
              ].map((st, idx) => (
                <g key={st.title}>
                  <rect x={st.x} y={194} width={64} height={44} rx={6} fill="#FFFFFF" stroke="#C99B84" strokeWidth={1} />
                  <text x={st.x + 32} y={211} textAnchor="middle" fontSize={8.6} fontWeight={700} fill="#1E293B">{st.title}</text>
                  <text x={st.x + 32} y={226} textAnchor="middle" fontSize={7.8} fill="#64748B">{st.sub}</text>
                  {idx < 2 && (
                    <path d={`M${st.x + 65} 216 L${st.x + 73} 216`} stroke="#8E5B43" strokeWidth={1.3} markerEnd="url(#arrBlue)" />
                  )}
                </g>
              ))}

              <rect x={492} y={246} width={204} height={22} rx={5} fill="#FFFFFF" stroke="#CFA58F" strokeWidth={0.9} />
              <text x={594} y={260} textAnchor="middle" fontSize={8.6} fontWeight={600} fill="#7C2D12">
                Correct alignment &amp; limit contact force
              </text>

              {/* Local controller + Human operator / haptic interface */}
              <rect x={490} y={282} width={104} height={84} rx={7} fill="#FFFFFF" stroke="#94A3B8" strokeWidth={1} />
              <text x={542} y={298} textAnchor="middle" fontSize={8.8} fontWeight={700} fill="#1E293B">Human + Haptic</text>
              <text x={542} y={311} textAnchor="middle" fontSize={7.8} fill="#64748B">(optional shared ctrl)</text>
              <text x={542} y={331} textAnchor="middle" fontSize={8} fill="#8E5B43">Motion cmds →</text>
              <text x={542} y={346} textAnchor="middle" fontSize={8} fill="#2E6692">← Haptic feedback</text>

              <rect x={606} y={282} width={92} height={84} rx={7} fill="#FFFFFF" stroke="#8E5B43" strokeWidth={1.1} />
              <text x={652} y={304} textAnchor="middle" fontSize={9.2} fontWeight={700} fill="#1E293B">Local</text>
              <text x={652} y={317} textAnchor="middle" fontSize={9.2} fontWeight={700} fill="#1E293B">controller</text>
              <text x={652} y={336} textAnchor="middle" fontSize={7.8} fill="#64748B">Millisecond</text>
              <text x={652} y={348} textAnchor="middle" fontSize={7.8} fill="#64748B">local correction</text>
              <path d="M652 282 L652 270" stroke="#8E5B43" strokeWidth={1.4} markerEnd="url(#arrBlue)" />
            </g>

            {/* ==================== Sec. 5.5 Scalable Tactile Data (Bottom) ==================== */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'challenge', id: '5.5' })}>
              <rect
                x={124} y={366} width={346} height={96} rx={10}
                fill="#ECF6F8"
                stroke={isChallengeHighlighted('5.5') ? '#2A7B88' : '#85BAC3'}
                strokeWidth={isChallengeHighlighted('5.5') ? 2.6 : 1.4}
              />
              <rect x={132} y={373} width={52} height={17} rx={8.5} fill="#2A7B88" />
              <text x={158} y={385} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">Sec. 5.5</text>
              <text x={190} y={385} fontSize={11} fontWeight={700} fill="#1E293B">Scalable tactile data</text>

              {/* Real contacts & Simulation */}
              <rect x={134} y={397} width={86} height={24} rx={5} fill="#FFFFFF" stroke="#2A7B88" strokeWidth={0.9} />
              <text x={177} y={412} textAnchor="middle" fontSize={8.5} fontWeight={600} fill="#1E293B">Real contacts</text>

              <rect x={134} y={427} width={86} height={24} rx={5} fill="#FFFFFF" stroke="#2A7B88" strokeWidth={0.9} strokeDasharray="3 2" />
              <text x={177} y={442} textAnchor="middle" fontSize={8.5} fontWeight={600} fill="#1E293B">Simulation</text>

              {/* Contact sequences */}
              <rect x={232} y={397} width={118} height={54} rx={6} fill="#FFFFFF" stroke="#64748B" strokeWidth={0.9} />
              <text x={291} y={413} textAnchor="middle" fontSize={8.8} fontWeight={700} fill="#1E293B">Contact sequences</text>
              <text x={291} y={427} textAnchor="middle" fontSize={7.8} fill="#475569">Non-redundant contacts</text>
              <text x={291} y={440} textAnchor="middle" fontSize={7.8} fill="#475569">&amp; explicit counting units</text>

              {/* Sensor metadata */}
              <rect x={360} y={397} width={100} height={54} rx={6} fill="#FFFFFF" stroke="#2A7B88" strokeWidth={1} />
              <text x={410} y={411} textAnchor="middle" fontSize={8.6} fontWeight={700} fill="#1E293B">Sensor metadata</text>
              <text x={410} y={424} textAnchor="middle" fontSize={7.8} fill="#334155">· Geometry</text>
              <text x={410} y={435} textAnchor="middle" fontSize={7.8} fill="#334155">· Material</text>
              <text x={410} y={446} textAnchor="middle" fontSize={7.8} fill="#334155">· Calibration</text>
            </g>

            {/* ==================== Numbered Flows (1)-(5) matching Fig. 6 ==================== */}
            {/* Flow 1: 5.1 -> 5.3 (Adapt to interface changes) */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 1 })}>
              <line
                x1={125} y1={148} x2={125} y2={188}
                stroke={isCouplingHighlighted(1) ? '#D97706' : '#764F8E'}
                strokeWidth={isCouplingHighlighted(1) ? 2.6 : 1.8}
                markerEnd={isCouplingHighlighted(1) ? 'url(#arrHi)' : 'url(#arrBlue)'}
              />
              <circle cx={42} cy={168} r={9} fill={isCouplingHighlighted(1) ? '#D97706' : '#1E3A5F'} />
              <text x={42} y={171.5} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">1</text>
              <text x={55} y={171} fontSize={8.5} fontWeight={600} fill="#334155">Adapt to interface</text>
            </g>

            {/* Flow 2: 5.1 & 5.3 -> 5.2 (Consistent physical cues) */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 2 })}>
              <path
                d="M238 82 L314 82 M238 228 Q266 228 266 155 Q266 82 292 82"
                fill="none"
                stroke={isCouplingHighlighted(2) ? '#D97706' : '#764F8E'}
                strokeWidth={isCouplingHighlighted(2) ? 2.6 : 1.8}
                markerEnd={isCouplingHighlighted(2) ? 'url(#arrHi)' : 'url(#arrBlue)'}
              />
              <rect x={242} y={40} width={72} height={30} rx={6} fill="#FFFFFF" stroke={isCouplingHighlighted(2) ? '#D97706' : '#94A3B8'} strokeWidth={1.1} />
              <text x={278} y={53} textAnchor="middle" fontSize={8.2} fontWeight={700} fill="#1E293B">Consistent</text>
              <text x={278} y={64} textAnchor="middle" fontSize={8.2} fontWeight={700} fill="#1E293B">physical cues</text>
              <circle cx={278} cy={82} r={9} fill={isCouplingHighlighted(2) ? '#D97706' : '#1E3A5F'} />
              <text x={278} y={85.5} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">2</text>
            </g>

            {/* Flow 3: 5.4 -> 5.2 (Contact states) & 5.4 -> Center Robot */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 3 })}>
              <path
                d="M668 162 L668 82 L634 82"
                fill="none"
                stroke={isCouplingHighlighted(3) ? '#D97706' : '#8E5B43'}
                strokeWidth={isCouplingHighlighted(3) ? 2.6 : 1.8}
                markerEnd={isCouplingHighlighted(3) ? 'url(#arrHi)' : 'url(#arrBlue)'}
              />
              <line
                x1={480} y1={264} x2={466} y2={264}
                stroke={isCouplingHighlighted(3) ? '#D97706' : '#8E5B43'}
                strokeWidth={isCouplingHighlighted(3) ? 2.6 : 2}
                markerEnd={isCouplingHighlighted(3) ? 'url(#arrHi)' : 'url(#arrBlue)'}
              />
              <rect x={636} y={46} width={76} height={22} rx={6} fill="#FFFFFF" stroke={isCouplingHighlighted(3) ? '#D97706' : '#C99B84'} strokeWidth={1.1} />
              <text x={674} y={60} textAnchor="middle" fontSize={8.2} fontWeight={700} fill="#1E293B">Contact states</text>
              <circle cx={668} cy={122} r={9} fill={isCouplingHighlighted(3) ? '#D97706' : '#1E3A5F'} />
              <text x={668} y={125.5} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">3</text>
            </g>

            {/* Flow 4: 5.4 -> 5.5 (Outcomes, failure & recovery) */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 4 })}>
              <path
                d="M604 380 L604 422 L474 422"
                fill="none"
                stroke={isCouplingHighlighted(4) ? '#D97706' : '#2A7B88'}
                strokeWidth={isCouplingHighlighted(4) ? 2.6 : 1.8}
                markerEnd={isCouplingHighlighted(4) ? 'url(#arrHi)' : 'url(#arrBlue)'}
              />
              <rect x={492} y={404} width={116} height={30} rx={6} fill="#FFFFFF" stroke={isCouplingHighlighted(4) ? '#D97706' : '#85BAC3'} strokeWidth={1.1} />
              <text x={550} y={417} textAnchor="middle" fontSize={8.2} fontWeight={700} fill="#1E293B">Outcomes, failure</text>
              <text x={550} y={428} textAnchor="middle" fontSize={8.2} fontWeight={700} fill="#1E293B">&amp; recovery</text>
              <circle cx={630} cy={418} r={9} fill={isCouplingHighlighted(4) ? '#D97706' : '#1E3A5F'} />
              <text x={630} y={421.5} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">4</text>
            </g>

            {/* Flow 5: 5.5 -> 5.3 (Metadata, contact data) */}
            <g className="cursor-pointer" onClick={() => setSelection({ kind: 'coupling', id: 5 })}>
              <path
                d="M124 416 L60 416 L60 348"
                fill="none"
                stroke={isCouplingHighlighted(5) ? '#D97706' : '#764F8E'}
                strokeWidth={isCouplingHighlighted(5) ? 2.6 : 1.8}
                markerEnd={isCouplingHighlighted(5) ? 'url(#arrHi)' : 'url(#arrBlue)'}
              />
              <rect x={14} y={370} width={92} height={28} rx={6} fill="#FFFFFF" stroke={isCouplingHighlighted(5) ? '#D97706' : '#BAA0CC'} strokeWidth={1.1} />
              <text x={60} y={382} textAnchor="middle" fontSize={8.2} fontWeight={700} fill="#1E293B">Metadata &amp;</text>
              <text x={60} y={393} textAnchor="middle" fontSize={8.2} fontWeight={700} fill="#1E293B">contact data</text>
              <circle cx={96} cy={416} r={9} fill={isCouplingHighlighted(5) ? '#D97706' : '#1E3A5F'} />
              <text x={96} y={419.5} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#FFF">5</text>
            </g>
          </svg>

          {/* Quick pills for challenges & flows */}
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
            <div className="flex flex-wrap gap-1.5">
              {CHALLENGES.map((ch) => {
                const active = selection.kind === 'challenge' && selection.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelection({ kind: 'challenge', id: ch.id })}
                    style={
                      active
                        ? { backgroundColor: ch.color, color: '#FFFFFF' }
                        : { backgroundColor: ch.bg, color: ch.color }
                    }
                    className="cursor-pointer rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold transition hover:opacity-90"
                  >
                    Sec. {ch.id} · {ch.shortTitle}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-1.5">
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
                <Link2 className="h-3.5 w-3.5" /> System Loop Flow #{selectedCoupling.id}
              </div>
              <h3 className="font-serif text-2xl font-semibold text-slate-900">
                {selectedCoupling.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-700">
                {selectedCoupling.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { cid: selectedCoupling.from, role: 'Source' },
                  ...(selectedCoupling.secondaryFrom
                    ? [{ cid: selectedCoupling.secondaryFrom, role: 'Co-Source' }]
                    : []),
                  { cid: selectedCoupling.to, role: 'Target' },
                ].map(({ cid, role }) => {
                  const ch = CHALLENGES.find((c) => c.id === cid)!;
                  return (
                    <button
                      key={`${role}-${cid}`}
                      onClick={() => setSelection({ kind: 'challenge', id: cid })}
                      style={{ backgroundColor: ch.bg, borderColor: ch.border }}
                      className="cursor-pointer rounded-xl border p-3 text-left transition hover:shadow-xs"
                    >
                      <div className="font-mono text-[10px] font-bold uppercase" style={{ color: ch.color }}>
                        {role} · Sec. {ch.id}
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
