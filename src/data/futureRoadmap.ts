// Section 5 & Fig. 6 integrated future directions roadmap data.
// Aligned with IJRR manuscript Section 5 order (5.1-5.5) and Fig. 6 connector-insertion loop.

export type ChallengeId = '5.1' | '5.2' | '5.3' | '5.4' | '5.5';

export interface ChallengeNode {
  id: ChallengeId;
  title: string;
  shortTitle: string;
  loopRole: 'Hardware & Health' | 'Reasoning & Grounding' | 'Interface Abstraction' | 'Local Control' | 'Data & Metadata';
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
  secondaryFrom?: ChallengeId;
  shortLabel: string;
  title: string;
  description: string;
}

export const CHALLENGES: ChallengeNode[] = [
  {
    id: '5.1',
    title: 'Sensor Reliability and Durability',
    shortTitle: 'Reliability & Durability',
    loopRole: 'Hardware & Health',
    color: '#2E6692',
    bg: '#EEF5FA',
    border: '#7BA8C9',
    whyItMatters:
      'Unlike remote cameras, VBTS elastomers directly endure cyclic indentation, high shear, sharp-edge tearing, and abrasive sliding. Surface wear, reflective-coating delamination, optical hazing, marker distortion, and viscoelastic creep silently invalidate calibration.',
    currentGap:
      'Protective skins and replaceable cartridges (e.g., PolyTouch) introduce mounting tolerances and optical shifts requiring recalibration, while self-healing liquid crystalline gels must still match conventional elastomers in optical clarity, low hysteresis, and rapid rebound.',
    futureDirections: [
      'Co-design abrasion-resistant coatings, low-hysteresis elastomers, and mechanically keyed replaceable cartridges that preserve optical registration across swaps',
      'Embed wear-aware online self-monitoring to detect coating degradation, illumination drift, or stiffness changes and trigger lightweight in-situ recalibration',
      'Standardize endurance benchmarks tracking mechanical response, optical cue fidelity, and force/shape accuracy across thousands of shear, impact, replacement, and healing cycles',
    ],
    benchmarks:
      'Mechanical response, optical cue fidelity, and force/shape accuracy over thousands of shear, impact, pad-swap, and healing cycles.',
    unlockedCapability:
      'Continuous, unattended VBTS operation in industrial assembly, logistics, and household robotics without silent calibration drift.',
  },
  {
    id: '5.2',
    title: 'Multimodal Alignment',
    shortTitle: 'Multimodal Alignment',
    loopRole: 'Reasoning & Grounding',
    color: '#3B7A57',
    bg: '#EEF7F1',
    border: '#82B597',
    whyItMatters:
      'Embodied reasoning and dexterous manipulation must link millimeter-scale occluded contact patches with global external vision, proprioception, language instructions, and motor actions across mismatched spatial, temporal, and semantic scales.',
    currentGap:
      'Compressing tactile images into coarse language-aligned embeddings (e.g., TVL, UniTacVLA) often washes out fine geometric gradients and force cues needed for contact-rich control, and multimodal policies can over-rely on external vision when touch is active only during brief contact phases.',
    futureDirections: [
      'Develop dual-granularity, physically grounded alignment architectures synchronizing tactile streams with robot kinematics while retaining quantitative force, shear, geometry, and slip alongside task semantics',
      'Enforce training objectives that explicitly require tactile grounding rather than allowing external vision to dominate',
      'Adopt controlled diagnostic tests—such as blocked camera views or visually identical objects with distinct friction, texture, or compliance',
    ],
    benchmarks:
      'Task reasoning and closed-loop control under visual occlusion and visually identical look-alike objects differing in friction, texture, or compliance.',
    unlockedCapability:
      'Connecting high-level semantic instructions (e.g., aligning a connector or handling fragile/slippery objects) directly to precise physical execution under visual occlusion.',
  },
  {
    id: '5.3',
    title: 'Cross-Sensor Generalization',
    shortTitle: 'Cross-Sensor Generalization',
    loopRole: 'Interface Abstraction',
    color: '#764F8E',
    bg: '#F5EFF9',
    border: '#B191C4',
    whyItMatters:
      'Although Regime IV (Section 4.4) introduced early shared encoders, image translation, and marker-based force transfer, real robotic hands combine flat, domed, and curved sensing interfaces while routine deployment introduces wear-induced drift and cartridge swaps.',
    currentGap:
      'Most existing methods validate transfer only on offline perception probes or narrow source–target pairs (e.g., Touch2Touch, GenForce). Matching raw image appearance or semantic embeddings leaves closed-loop policies fragile whenever interface curvature, elastomer compliance, or optics change.',
    futureDirections: [
      'Move from device-bound pixel features to canonical, physics-grounded intermediate states—calibrated 3D surface deformations, contact-patch geometry, and normalized traction fields—isolating multimodal models and controllers from sensor-specific optics',
      'Condition canonical mappers on compact sensor metadata (geometry, elastomer material, calibration from Section 5.5) paired with brief self-supervised exploratory touches for automated post-swap adaptation',
      'Establish closed-loop hardware-migration benchmarks measuring manipulation success, force-control fidelity, and adaptation effort across replacement cartridges, unseen fingertip curvatures, and hybrid sensor suites',
    ],
    benchmarks:
      'Closed-loop manipulation success, force-control fidelity, and adaptation budget when migrating the same embodied policy across replacement cartridges and unseen sensor morphologies.',
    unlockedCapability:
      'Decoupling tactile intelligence from individual sensor assemblies so pretrained perception models and manipulation policies persist seamlessly across pad swaps, hardware upgrades, and diverse robot hands.',
  },
  {
    id: '5.4',
    title: 'Reactive Tactile Feedback',
    shortTitle: 'Reactive Tactile Feedback',
    loopRole: 'Local Control',
    color: '#8E5B43',
    bg: '#FAF2EE',
    border: '#C99B84',
    whyItMatters:
      'In fragile grasping, precision connector insertion, and in-hand reorientation, incipient slip, misalignment jamming, and force overshoot unfold within tens of milliseconds—tactile feedback works only if it modulates actions before failure or damage.',
    currentGap:
      'Latency accumulates across viscoelastic recovery, camera exposure/readout, feature extraction, and slow action-chunking or VLA inference. Even in slow–fast systems (e.g., RDP, T-Rex), deciding when local contact cues should trigger immediate overrides without destabilizing task plans remains open.',
    futureDirections: [
      'Co-design fast-recovering elastomers and high-frame-rate or event-based imaging with lightweight low-latency tactile encoders',
      'Build event-triggered reactive local controllers—optionally coupled with human operators via haptic interfaces—that correct misalignment, limit contact forces, and gate overrides smoothly into task-level plans',
      'Evaluate closed-loop benchmarks on end-to-end sensing-to-actuation delay, peak force overshoot, incipient-slip arrest rate, and disturbance recovery',
    ],
    benchmarks:
      'End-to-end sensing-to-actuation delay (ms), peak contact-force overshoot, incipient-slip arrest rate, and real-time disturbance recovery.',
    unlockedCapability:
      'Reflex-like dexterity that corrects misalignment, limits contact force, arrests slip before dropping objects, and recovers smoothly from unexpected perturbations.',
  },
  {
    id: '5.5',
    title: 'Scalable Tactile Data',
    shortTitle: 'Scalable Tactile Data',
    loopRole: 'Data & Metadata',
    color: '#2A7B88',
    bg: '#ECF6F8',
    border: '#7CB6BF',
    whyItMatters:
      'General-purpose tactile intelligence needs diverse datasets across objects, contact geometries, and manipulation tasks, yet physical collection is slow, wear-prone, and fragmented across incompatible sensors, lighting setups, and counting units.',
    currentGap:
      'Raw tactile corpora (even large multi-sensor efforts like T3 and Sparsh) rarely bundle standardized sensor geometry, elastomer stiffness, camera calibration, or force scales; naive pooling over-represents redundant static frames and conflates counting units.',
    futureDirections: [
      'Establish open tactile data schemas pairing real and simulated contact sequences with standardized sensor metadata (geometry, material, calibration), sampling rates, and explicit counting units',
      'Build reusable curation pipelines for cross-dataset normalization, automated contact-event filtering, cross-modal auto-annotation, and physics-consistent simulation or generative augmentation',
      'Record closed-loop outcomes, failures, and recoveries and evaluate datasets by non-redundant contact diversity and downstream sample efficiency',
    ],
    benchmarks:
      'Non-redundant contact diversity and downstream sample efficiency rather than raw frame volume alone.',
    unlockedCapability:
      'Multi-institution, metadata-rich tactile corpora enabling foundation-scale pretraining, reduced per-task collection, and reproducible scaling laws.',
  },
];

export const ROADMAP_COUPLINGS: RoadmapCoupling[] = [
  {
    id: 1,
    from: '5.1',
    to: '5.3',
    shortLabel: 'Adapt to interface changes',
    title: 'Flow 1 · Adapt to Interface Changes (5.1 → 5.3)',
    description:
      'When wear-aware sensing detects pad degradation or triggers a cartridge swap (5.1), cross-sensor generalization (5.3) absorbs residual geometric and mechanical shifts so downstream models continue operating without full retraining.',
  },
  {
    id: 2,
    from: '5.1',
    secondaryFrom: '5.3',
    to: '5.2',
    shortLabel: 'Consistent physical cues',
    title: 'Flow 2 · Consistent Physical Cues (5.1 & 5.3 → 5.2)',
    description:
      'In-situ recalibration (5.1) and shared physical-state mappers across flat, domed, and curved interfaces (5.3) deliver metrically consistent deformation, force, and torque cues into multimodal alignment (5.2).',
  },
  {
    id: 3,
    from: '5.4',
    to: '5.2',
    shortLabel: 'Contact states & alignment',
    title: 'Flow 3 · Contact States & Tactile-Guided Alignment (5.4 → Robot & 5.2)',
    description:
      'Reactive local control (5.4)—optionally assisted by a human operator through a haptic interface—drives tactile-guided connector alignment and force limiting under visual occlusion, while returning updated contact states to multimodal alignment (5.2).',
  },
  {
    id: 4,
    from: '5.4',
    to: '5.5',
    shortLabel: 'Outcomes, failure & recovery',
    title: 'Flow 4 · Outcomes, Failure, and Recovery Logging (5.4 → 5.5)',
    description:
      'Closed-loop real executions and simulated rollouts record contact sequences—including misalignments, failures, and recoveries—alongside sensor metadata (geometry, material, calibration) to build scalable tactile data (5.5).',
  },
  {
    id: 5,
    from: '5.5',
    to: '5.3',
    shortLabel: 'Metadata & contact data',
    title: 'Flow 5 · Metadata & Contact Sequences for Transfer (5.5 → 5.3)',
    description:
      'Standardized real and simulated contact sequences paired with explicit hardware metadata (5.5) train and condition canonical cross-sensor state mappers (5.3) across diverse elastomer geometries and optical designs.',
  },
];
