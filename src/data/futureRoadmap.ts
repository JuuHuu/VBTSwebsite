// Section 5 & Fig. 6 integrated future directions roadmap data.

export type ChallengeId = '5.1' | '5.2' | '5.3' | '5.4' | '5.5';

export interface ChallengeNode {
  id: ChallengeId;
  title: string;
  shortTitle: string;
  loopRole: 'Online' | 'Offline';
  color: string;
  bg: string;
  border: string;
  whyItMatters: string;
  currentGap: string;
  futureDirections: string[];
  benchmarks: string;
  unlockedCapability: string;
}

export interface RoadmapCoupling {
  id: number;
  from: ChallengeId;
  to: ChallengeId;
  bidirectional?: boolean;
  shortLabel: string;
  title: string;
  description: string;
}

export const CHALLENGES: ChallengeNode[] = [
  {
    id: '5.1',
    title: 'Sensor Reliability and Durability',
    shortTitle: 'Durability & Self-Monitoring',
    loopRole: 'Online',
    color: '#7E4A96',
    bg: '#F3EAF8',
    border: '#B187C4',
    whyItMatters: 'Unlike remote cameras, VBTS elastomers directly endure cyclic indentation, sharp edges, high shear, and abrasion. Wear, delamination, hazing, and creep silently invalidate calibration.',
    currentGap: 'Replaceable pads (e.g., PolyTouch) introduce mounting and optical shifts requiring recalibration; self-healing gels still lag in clarity, low hysteresis, and rapid rebound.',
    futureDirections: [
      'Co-design abrasion-resistant coatings, low-hysteresis elastomers, and mechanically keyed replaceable pads',
      'Embed online self-monitoring for wear, illumination drift, and stiffness shift triggering lightweight in-situ recalibration',
      'Standardize endurance protocols across thousands of shear, impact, swap, and healing cycles',
    ],
    benchmarks: 'Mechanical hysteresis, optical cue fidelity, and force/shape error over thousands of wear & pad-swap cycles.',
    unlockedCapability: 'Continuous, unattended VBTS operation in industrial assembly, logistics, and household robotics.',
  },
  {
    id: '5.2',
    title: 'Scalable Tactile Data',
    shortTitle: 'Scalable Metadata-Rich Data',
    loopRole: 'Offline',
    color: '#2B7A9E',
    bg: '#E8F4FA',
    border: '#7AB8D4',
    whyItMatters: 'General-purpose tactile intelligence requires diverse contact corpora, yet physical collection is slow, wear-prone, and fragmented across incompatible sensors and counting units.',
    currentGap: 'Raw tactile images rarely bundle sensor geometry, elastomer stiffness, calibration, or physical force scale; naive pooling over-represents redundant static frames.',
    futureDirections: [
      'Establish open tactile data schemas bundling streams with hardware descriptors, calibration, wear state, and explicit counting units',
      'Build automated contact-event filtering, cross-modal auto-annotation, and physics-consistent augmentation pipelines',
      'Log real deployment failures and recoveries to avoid success bias in offline corpora',
    ],
    benchmarks: 'Non-redundant contact diversity and downstream sample efficiency rather than raw frame volume alone.',
    unlockedCapability: 'Foundation-scale multi-institution tactile pretraining and reproducible scaling laws.',
  },
  {
    id: '5.3',
    title: 'Multimodal Alignment',
    shortTitle: 'Multimodal Alignment (Slow)',
    loopRole: 'Online',
    color: '#C25B45',
    bg: '#FDF0EC',
    border: '#DE8F7C',
    whyItMatters: 'Embodied reasoning must link millimeter-scale occluded contact patches with global scene vision, proprioception, language instructions, and actions across mismatched spatial and temporal scales.',
    currentGap: 'Compressing tactile frames into coarse language-aligned tokens washes out fine geometric gradients and force cues, while policies often fall back on visual shortcuts.',
    futureDirections: [
      'Develop dual-granularity architectures retaining quantitative physical contact states alongside semantic features',
      'Enforce explicit tactile grounding objectives so vision cannot dominate during brief contact phases',
      'Evaluate with controlled visual-occlusion and visually identical look-alike object diagnostics',
    ],
    benchmarks: 'Performance under full contact occlusion and visually identical objects differing in friction, texture, or compliance.',
    unlockedCapability: 'Direct grounding of high-level verbal goals (e.g., fragile/slippery handling) into physically faithful execution.',
  },
  {
    id: '5.4',
    title: 'Reactive Tactile Feedback',
    shortTitle: 'Reactive Feedback (Fast)',
    loopRole: 'Online',
    color: '#B84A39',
    bg: '#FBEAE6',
    border: '#D97B6A',
    whyItMatters: 'Incipient slip, edge collisions, and force overshoots unfold within tens of milliseconds—touch only prevents grasp failure if it modulates actions before the object drops or breaks.',
    currentGap: 'Latency accumulates across viscoelastic rebound, camera readout, encoding, and slow action-chunking VLAs; gating rapid local overrides safely without destabilizing plans remains open.',
    futureDirections: [
      'Co-design fast-recovering elastomers and high-rate/event imaging with lightweight low-latency tactile encoders',
      'Develop event-triggered slow-fast controllers that adaptively gate millisecond local corrections into higher-level plans',
      'Measure reflex latency and disturbance recovery explicitly beyond binary task success',
    ],
    benchmarks: 'End-to-end sensing-to-actuation delay (ms), peak force overshoot, incipient-slip arrest rate, and disturbance recovery.',
    unlockedCapability: 'Reflex-like robotic dexterity arresting slip and regulating delicate forces in real time.',
  },
  {
    id: '5.5',
    title: 'Cross-Sensor Generalization',
    shortTitle: 'Cross-Sensor Generalization',
    loopRole: 'Online',
    color: '#4E8242',
    bg: '#ECF6E8',
    border: '#89B87A',
    whyItMatters: 'VBTS models remain locked to specific sensor units because curvature, elastomer stiffness, markers, and optics shift simultaneously across manufacturing tolerances and sensor designs.',
    currentGap: 'Visual image translation (e.g., Touch2Touch) does not guarantee physically accurate force or depth transfer when underlying elastomer mechanics or curvature change.',
    futureDirections: [
      'Combine physics-informed intermediates (calibrated normals, 3D displacement fields, dimensionless descriptors) with metadata-conditioned few-shot adaptation',
      'Separate standardized evaluation protocols into unit-to-unit vs. cross-design vs. cross-transducer transfer tiers',
      'Report exact target calibration budgets, adapted modules, and physical error metrics',
    ],
    benchmarks: 'Held-out unit-to-unit and cross-design physical error versus target adaptation data budget.',
    unlockedCapability: 'Plug-and-play deployment of pretrained tactile software across new robot hands and replacement pads.',
  },
];

export const ROADMAP_COUPLINGS: RoadmapCoupling[] = [
  {
    id: 1,
    from: '5.1',
    to: '5.5',
    shortLabel: 'Pad swap & drift → adaptation',
    title: 'Link 1 · Wear & Pad Swaps Trigger Cross-Sensor Adaptation',
    description: 'When online durability monitoring detects coating wear, illumination drift, or a replaced elastomer pad, it passes updated health metadata to cross-sensor generalization for lightweight few-shot recalibration.',
  },
  {
    id: 2,
    from: '5.1',
    to: '5.3',
    bidirectional: true,
    shortLabel: 'Health flags ↔ load history',
    title: 'Link 2 · Sensor Health Flags & Cumulative Contact Load History',
    description: 'Durability monitoring sends calibration confidence and wear-aware force limits to embodied control, while the controller feeds back cumulative shear and peak load history to predict elastomer fatigue.',
  },
  {
    id: 3,
    from: '5.2',
    to: '5.5',
    shortLabel: 'Multi-sensor pretraining',
    title: 'Link 3 · Metadata-Rich Corpora Enable Cross-Sensor Pretraining',
    description: 'Standardized offline datasets with explicit hardware descriptors and counting units train shared physics-informed representations that generalize across heterogeneous VBTS units.',
  },
  {
    id: 4,
    from: '5.5',
    to: '5.4',
    shortLabel: 'Shared physics features',
    title: 'Link 4 · Hardware-Agnostic Features Feed Slow & Fast Control',
    description: 'Cross-sensor encoders convert raw tactile frames and proprioception from any VBTS unit into calibrated physical contact representations usable by both semantic planners (5.3) and reactive reflexes (5.4).',
  },
  {
    id: 5,
    from: '5.3',
    to: '5.4',
    bidirectional: true,
    shortLabel: 'Goals & bounds ↔ slip events',
    title: 'Link 5 · Slow–Fast Coordination Between Alignment & Reflexes',
    description: 'Slow multimodal alignment translates language and vision into task goals and safe force bounds; fast reactive feedback arrests incipient slip in milliseconds and reports contact/slip events back up.',
  },
  {
    id: 6,
    from: '5.4',
    to: '5.2',
    shortLabel: 'Deployment logs & failures',
    title: 'Link 6 · Closed-Loop Deployment Logs Enrich Offline Data',
    description: 'Real-world executions—explicitly capturing slip arrests, contact failures, recoveries, and sensor wear states—feed back into offline corpora and benchmarks to eliminate success bias.',
  },
];
