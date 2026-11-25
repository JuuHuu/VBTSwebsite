// Section 3, Fig. 3, and Table 3 hardware design goals, physical levers, and coupled trade-offs.

export type GoalBadge = 'Mi' | 'Co' | 'Sp' | 'Fo' | 'Te' | 'Mu';

export interface TradeoffScores {
  compactness: number;        // 0..100
  coverage: number;           // 0..100
  spatialDetail: number;      // 0..100
  forceCapability: number;    // 0..100
  temporalBandwidth: number;  // 0..100
  calibrationEase: number;    // 0..100 (higher = simpler calibration)
}

export interface HardwareLever {
  id: string;
  goalId: GoalBadge;
  name: string;
  fig3Label: string;
  modifiedParts: string[];
  mechanism: string;
  calibrationImpact: string;
  tradeoffNote: string;
  representatives: string[];
  scores: TradeoffScores;
}

export interface HardwareGoalInfo {
  id: GoalBadge;
  name: string;
  section: string;
  color: string;
  bgColor: string;
  borderColor: string;
  tagline: string;
  coreBottleneck: string;
  levers: HardwareLever[];
}

export const GOAL_BADGE_META: Record<
  GoalBadge,
  { name: string; short: string; color: string; bg: string; border: string }
> = {
  Mi: { name: 'Miniaturization', short: 'Mi', color: '#2B5B84', bg: '#E8F1F8', border: '#2B5B84' },
  Co: { name: 'Large-area Coverage', short: 'Co', color: '#2E7D5B', bg: '#E6F4ED', border: '#2E7D5B' },
  Sp: { name: 'Spatial Resolution', short: 'Sp', color: '#8E3A59', bg: '#F8EBF0', border: '#8E3A59' },
  Fo: { name: 'Force Measurement', short: 'Fo', color: '#9A6B26', bg: '#FBF3E4', border: '#9A6B26' },
  Te: { name: 'Temporal Performance', short: 'Te', color: '#6E4E37', bg: '#F4ECE6', border: '#6E4E37' },
  Mu: { name: 'Multimodal Sensing', short: 'Mu', color: '#63488E', bg: '#F0EBF8', border: '#63488E' },
};

export const BASELINE_SCORES: TradeoffScores = {
  compactness: 50,
  coverage: 45,
  spatialDetail: 65,
  forceCapability: 55,
  temporalBandwidth: 50,
  calibrationEase: 75,
};

export const HARDWARE_GOALS: HardwareGoalInfo[] = [
  {
    id: 'Mi',
    name: 'Miniaturization',
    section: 'Sec. 3.1',
    color: '#2B5B84',
    bgColor: '#EEF5FB',
    borderColor: '#7BA7CE',
    tagline: 'Shrink sensor thickness and distal footprint to fit robotic fingertips and slender probes.',
    coreBottleneck: 'Conventional cameras require a minimum axial working distance between lens and elastomer to focus and illuminate the pad evenly.',
    levers: [
      {
        id: 'folded_optics',
        goalId: 'Mi',
        name: 'Folded Optical Paths',
        fig3Label: 'Folded optical paths',
        modifiedParts: ['Angled mirror', 'Side-mounted lens & CMOS', 'Slim finger housing'],
        mechanism: 'Redirects the optical axis along the finger length via mirrors so working distance fits inside a thin finger profile.',
        calibrationImpact: 'Requires mirror alignment verification and perspective/foreshortening correction across the tilted sensing plane.',
        tradeoffNote: 'Enables slim parallel-jaw fingers while constraining internal LED placement and introducing tilt foreshortening.',
        representatives: ['GelSlim (2018)', 'GelSight Wedge (2021)'],
        scores: { compactness: 86, coverage: 50, spatialDetail: 78, forceCapability: 58, temporalBandwidth: 52, calibrationEase: 58 },
      },
      {
        id: 'specialized_optics',
        goalId: 'Mi',
        name: 'Specialized Optical Elements',
        fig3Label: 'Specialized optics',
        modifiedParts: ['Microlens array (MLA) or coded mask', 'Ultra-thin housing'],
        mechanism: 'Replaces a bulky single lens with a flat microlens array or lensless coded amplitude mask to collapse axial thickness.',
        calibrationImpact: 'Shifts complexity into mask-specific PSF calibration and computational image reconstruction.',
        tradeoffNote: 'Drastically cuts sensor thickness at the cost of optical decoding latency and mask-dependent image fidelity.',
        representatives: ['MLA Sensor (2022)', 'ThinTact (2025)'],
        scores: { compactness: 92, coverage: 55, spatialDetail: 62, forceCapability: 55, temporalBandwidth: 45, calibrationEase: 35 },
      },
      {
        id: 'remote_imaging',
        goalId: 'Mi',
        name: 'Remote Imaging (Fiber Bundles)',
        fig3Label: 'Remote imaging',
        modifiedParts: ['Coherent imaging fiber bundle', 'Remote camera box', 'Ultra-small distal tip'],
        mechanism: 'Relays optical patterns from an 8-mm or sub-2-mm distal tip through flexible optical fibers to a remote camera.',
        calibrationImpact: 'Requires fiber-bundle core registration, flat-field attenuation compensation, and tip-swap recalibration.',
        tradeoffNote: 'Removes electronics from the distal tip, but finite fiber cores, honeycomb artifacts, and bend radii limit routing and sharpness.',
        representatives: ['DIGIT Pinki (2025)', 'MISTac (2026)', '1.7-mm Optical Probe (2026)'],
        scores: { compactness: 96, coverage: 32, spatialDetail: 52, forceCapability: 60, temporalBandwidth: 55, calibrationEase: 48 },
      },
      {
        id: 'compact_assemblies',
        goalId: 'Mi',
        name: 'Compact Sensor Assemblies',
        fig3Label: 'Compact assemblies',
        modifiedParts: ['Co-packaged miniature housing', 'Shaped light guide', 'Short-throw lens'],
        mechanism: 'Co-designs housing, shaped light guides, and short-working-distance optics around a miniature fingertip or replaceable pad.',
        calibrationImpact: 'Stronger wide-angle lens distortion and close-range illumination falloff require careful per-unit calibration.',
        tradeoffNote: 'Clean self-contained integration for multi-fingered hands, while tight geometry limits field of view and lighting uniformity.',
        representatives: ['DIGIT (2020)', 'GelSlim 3.0 (2022)', 'Minsight (2023)', 'MiniTac (2024)'],
        scores: { compactness: 84, coverage: 52, spatialDetail: 72, forceCapability: 62, temporalBandwidth: 56, calibrationEase: 68 },
      },
    ],
  },
  {
    id: 'Co',
    name: 'Large-area Coverage',
    section: 'Sec. 3.2',
    color: '#2E7D5B',
    bgColor: '#EDF7F2',
    borderColor: '#7DB89B',
    tagline: 'Sense contact over curved fingertips, full palms, robotic links, or large inspection surfaces.',
    coreBottleneck: 'Spreading fixed pixels over a large or curved surface dilutes local resolution and introduces grazing-angle foreshortening and refraction.',
    levers: [
      {
        id: 'expanding_view',
        goalId: 'Co',
        name: 'Expanding the Camera View',
        fig3Label: 'Expanding the camera view',
        modifiedParts: ['Fisheye / wide-angle optics or multi-camera array', 'Curved shell & base LEDs'],
        mechanism: 'Achieves instantaneous full-surface coverage using mirrors, wide-angle/fisheye lenses, or multiple distributed cameras.',
        calibrationImpact: 'Demands curved-interface refraction calibration, multi-camera extrinsics, and spatially varying lighting maps.',
        tradeoffNote: 'Captures simultaneous contacts across curved shells, trading off edge spatial resolution, wiring bulk, and calibration complexity.',
        representatives: ['OmniTact (2020)', 'GelSight Svelte (2023)', 'GelSight360 (2023)', 'GelStereo Palm (2023)', 'RainbowSight (2024)', 'ViART (2024)', 'ProTac (2025)'],
        scores: { compactness: 42, coverage: 92, spatialDetail: 56, forceCapability: 64, temporalBandwidth: 52, calibrationEase: 40 },
      },
      {
        id: 'moving_optics',
        goalId: 'Co',
        name: 'Moving the Imaging System',
        fig3Label: 'Moving the imaging system',
        modifiedParts: ['Actuated rotating camera / optical module', 'Stationary extended elastomer'],
        mechanism: 'Sequentially rotates or translates a camera beneath a fixed sensing surface to maintain high local magnification over a wider area.',
        calibrationImpact: 'Requires rotation-center estimation, per-frame viewpoint alignment, and image stitching into a common frame.',
        tradeoffNote: 'Preserves local resolution over extended surfaces, but actuation and sequential scanning add latency and miss simultaneous off-view contacts.',
        representatives: ['GelFinger (2023)', 'Rotational Pinhole VBTS (2026)'],
        scores: { compactness: 48, coverage: 80, spatialDetail: 78, forceCapability: 55, temporalBandwidth: 30, calibrationEase: 45 },
      },
      {
        id: 'moving_surface',
        goalId: 'Co',
        name: 'Moving Sensing Surfaces',
        fig3Label: 'Moving sensing surfaces',
        modifiedParts: ['Rolling silicone belt or cylindrical roller', 'Fixed internal optics & lighting'],
        mechanism: 'Continuously rolls a silicone belt or wheel over large workpieces, extending inspected area over time rather than per frame.',
        calibrationImpact: 'Requires accurate inter-frame odometry/registration and speed-dependent compensation for belt slip and preload.',
        tradeoffNote: 'Inspects arbitrarily large surfaces continuously, but is suited to rolling scanning rather than static grasping and suffers registration drift.',
        representatives: ['GelBelt (2025)', 'Event-Based Tactile Roller (2026)'],
        scores: { compactness: 36, coverage: 96, spatialDetail: 74, forceCapability: 50, temporalBandwidth: 65, calibrationEase: 44 },
      },
    ],
  },
  {
    id: 'Sp',
    name: 'Spatial Resolution',
    section: 'Sec. 3.3',
    color: '#8E3A59',
    bgColor: '#FAF0F4',
    borderColor: '#C889A1',
    tagline: 'Distinguish micron-scale surface textures and achieve sub-millimeter contact localization.',
    coreBottleneck: 'Elastomer thickness mechanically low-pass filters fine textures, while discrete markers trade spatial sampling against shading occlusion.',
    levers: [
      {
        id: 'reflective_surfaces',
        goalId: 'Sp',
        name: 'Reflective Surfaces & Directional Lighting',
        fig3Label: 'Reflective surfaces',
        modifiedParts: ['Thin matte reflective coating', 'Multi-directional RGB or point LEDs'],
        mechanism: 'Converts micron-scale surface slopes into pixel-level shading variations while blocking ambient color and object appearance.',
        calibrationImpact: 'Requires sphere-indentation brightness-to-orientation lookup tables or calibrated point-light reflectance models.',
        tradeoffNote: 'Delivers unmatched micro-texture fidelity, but opaque coatings wear under abrasion and block external see-through vision.',
        representatives: ['GelSight (2017)', 'GelPoLight (2025)', 'PBR-Designed VBTS (2025)', '3D Cal (2026)'],
        scores: { compactness: 58, coverage: 52, spatialDetail: 95, forceCapability: 60, temporalBandwidth: 50, calibrationEase: 54 },
      },
      {
        id: 'visible_features',
        goalId: 'Sp',
        name: 'Visible Features (Pins, Dense/Coded & UV Markers)',
        fig3Label: 'Visible features',
        modifiedParts: ['Internal biomimetic pins', 'Dense color patterns / coded grids', 'UV-switchable fluorescent markers'],
        mechanism: 'Encodes deformation into trackable primitives; pooling coupled marker motion yields sub-millimeter hyperacuity exceeding pin spacing.',
        calibrationImpact: 'Requires pattern tracking, correspondence disambiguation under shear, or alternating UV/white mode calibration.',
        tradeoffNote: 'Direct shear/localization readout and robust tracking, while dense markers obscure shading detail unless switched optically (UVtac).',
        representatives: ['TacTip (2018)', 'DelTact (2022)', 'UVtac (2022)', 'MagicTac (2024)', 'Coded-Marker VBTS (2024)'],
        scores: { compactness: 62, coverage: 60, spatialDetail: 82, forceCapability: 76, temporalBandwidth: 64, calibrationEase: 66 },
      },
    ],
  },
  {
    id: 'Fo',
    name: 'Force Measurement Performance',
    section: 'Sec. 3.4',
    color: '#9A6B26',
    bgColor: '#FCF6EA',
    borderColor: '#D4AF72',
    tagline: 'Measure normal, shear, and torsional loads sensitively and accurately across wide operating ranges.',
    coreBottleneck: 'Soft elastomers maximize light-force sensitivity but saturate early; local deformation couples force to unknown object geometry.',
    levers: [
      {
        id: 'elastomer_design',
        goalId: 'Fo',
        name: 'Elastomer & Microstructure Design',
        fig3Label: 'Elastomer design',
        modifiedParts: ['Dual-stiffness multilayer gel', 'Locally thinned skin', 'Air bubbles / micro-cups / laser trenches'],
        mechanism: 'Combines soft outer layers with harder cores or micro-cavities to amplify light-contact optical response while preventing early bottoming out.',
        calibrationImpact: 'Nonlinear stiffness and preload-dependent shear response require multi-load testing-machine calibration.',
        tradeoffNote: 'Expands dynamic force range and millinewton sensitivity, but introduces nonlinear hysteresis and complex fabrication.',
        representatives: ['Insight (2022)', 'Subblescope (2024)', 'Micro-Suction-Cup VBTS (2024)', 'ML-VBTS (2025)', 'Micro-VBTS (2026)'],
        scores: { compactness: 62, coverage: 50, spatialDetail: 62, forceCapability: 92, temporalBandwidth: 42, calibrationEase: 48 },
      },
      {
        id: 'marker_arrangements',
        goalId: 'Fo',
        name: 'Marker Arrangements',
        fig3Label: 'Marker arrangements',
        modifiedParts: ['Dual-depth marker layers', 'Random/concentric marker distributions', 'Optimized sparse layouts'],
        mechanism: 'Positions markers at distinct depths or rings to separate normal indentation from tangential traction fields cleanly.',
        calibrationImpact: 'Requires mapping marker displacement vectors to reference loads across positions, directions, or FEM ground truth.',
        tradeoffNote: 'Improves 3D traction observability and speeds up tracking when sparse, trading off local geometric detail.',
        representatives: ['GelForce (2004, 2010)', 'Random-Marker VBTS (2019)', 'HiVTac (2022)', 'Concentric-Ring VBTS (2026)'],
        scores: { compactness: 64, coverage: 55, spatialDetail: 66, forceCapability: 86, temporalBandwidth: 74, calibrationEase: 60 },
      },
      {
        id: 'optical_arrangements',
        goalId: 'Fo',
        name: 'Multi-View Camera & Optical Arrangements',
        fig3Label: 'Optical arrangements',
        modifiedParts: ['Stereo cameras', 'Virtual-view mirrors', 'Compound-eye microlenses'],
        mechanism: 'Observes elastomer markers from multiple viewpoints to triangulate out-of-plane indentation directly without monocular ambiguity.',
        calibrationImpact: 'Requires stereo/mirror geometric calibration, lens distortion correction, and mechanical membrane parameter fitting.',
        tradeoffNote: 'Directly resolves 3D deformation for bidirectional and distributed forces, adding camera volume and calibration overhead.',
        representatives: ['Tac3D (2022)', 'BiTac (2023)', 'CompdVision (2024)'],
        scores: { compactness: 48, coverage: 62, spatialDetail: 74, forceCapability: 88, temporalBandwidth: 52, calibrationEase: 44 },
      },
      {
        id: 'structural_design',
        goalId: 'Fo',
        name: 'Compliant Structural Design',
        fig3Label: 'Structural design',
        modifiedParts: ['Spring suspension or compliant ring', 'Internal structural skeleton', 'Rigid optical viewing plate'],
        mechanism: 'Channels total contact loads through calibrated elastic supports whose rigid-body motion isolates net 3- to 6-axis wrenches from object shape.',
        calibrationImpact: 'Decouples net force--torque calibration (against reference loads) from local surface-shape calibration.',
        tradeoffNote: 'Clean shape-independent net force/torque accuracy, but structural displacement does not directly increase spatial pressure resolution.',
        representatives: ['Visiflex (2021)', 'L3F-TOUCH (2023)', 'Minsight (2023)', 'FingerEye (2026)', 'LightTact (2026)'],
        scores: { compactness: 52, coverage: 54, spatialDetail: 68, forceCapability: 94, temporalBandwidth: 60, calibrationEase: 66 },
      },
    ],
  },
  {
    id: 'Te',
    name: 'Temporal Performance',
    section: 'Sec. 3.5',
    color: '#6E4E37',
    bgColor: '#F7F1EC',
    borderColor: '#BA9B84',
    tagline: 'Capture millisecond-scale slip, impact, and vibration transients with minimal end-to-end latency.',
    coreBottleneck: 'Latency cascades across three stages: elastomer viscoelastic recovery, optical acquisition rate, and computational inference time.',
    levers: [
      {
        id: 'surface_recovery',
        goalId: 'Te',
        name: 'Fast-Recovering Surface Design',
        fig3Label: 'Sensing-surface design',
        modifiedParts: ['Low-hysteresis firmer silicone', 'Thin elastomer pad', 'Minimal sparse markers'],
        mechanism: 'Formulates fast-rebounding silicone and minimal trackable features to shorten both mechanical recovery and image-tracking latency.',
        calibrationImpact: 'Requires balancing dynamic stiffness calibration against smaller displacements under light loads.',
        tradeoffNote: 'Eliminates viscoelastic lag during rapid sliding/tapping, at the expense of gentle-contact sensitivity.',
        representatives: ['HiVTac (2022)', 'GelPoLight (2025)', 'PolyTouch silicone pad (2025)', 'TacShade 2.0 (2026)'],
        scores: { compactness: 65, coverage: 50, spatialDetail: 58, forceCapability: 64, temporalBandwidth: 84, calibrationEase: 72 },
      },
      {
        id: 'high_speed_frame',
        goalId: 'Te',
        name: 'High-Speed & Compact Frame Imaging',
        fig3Label: 'High-speed frame imaging',
        modifiedParts: ['120–600+ fps camera', 'Monochrome sensor & lighting', 'High-intensity LEDs'],
        mechanism: 'Reduces exposure and readout delay while minimizing motion blur and image bandwidth (e.g., monochrome capture).',
        calibrationImpact: 'Standard spatial/intensity calibration, but short exposures demand brighter, thermally stable illumination.',
        tradeoffNote: 'Preserves full static + dynamic frame observability, while raising power, heat, lighting, and data-transfer demands.',
        representatives: ['High-Speed TacTip (2018)', 'HSVTac (2023)', '601-fps Palpation VBTS (2024)', 'R-Tac (2025)'],
        scores: { compactness: 50, coverage: 50, spatialDetail: 72, forceCapability: 70, temporalBandwidth: 88, calibrationEase: 68 },
      },
      {
        id: 'event_imaging',
        goalId: 'Te',
        name: 'Event-Based Neuromorphic Imaging',
        fig3Label: 'Event-based imaging',
        modifiedParts: ['Asynchronous DVS event camera', 'High-contrast pins or markers'],
        mechanism: 'Outputs asynchronous brightness-change events at microsecond resolution, eliminating frame latency and static-contact data redundancy.',
        calibrationImpact: 'Requires per-pixel contrast-threshold characterization and asynchronous event-graph or drift-compensated tracking.',
        tradeoffNote: 'Unmatched microsecond slip/vibration bandwidth, but produces no events during static sustained holds once deformation settles.',
        representatives: ['NeuroTac (2020)', 'Evetac (2024)', 'Event-Based Skin (2026)', 'Event-Based Roller (2026)'],
        scores: { compactness: 52, coverage: 58, spatialDetail: 62, forceCapability: 66, temporalBandwidth: 98, calibrationEase: 42 },
      },
    ],
  },
  {
    id: 'Mu',
    name: 'Multimodal Sensing',
    section: 'Sec. 3.6',
    color: '#63488E',
    bgColor: '#F3EFFA',
    borderColor: '#A48EC9',
    tagline: 'Acquire pre-contact vision, proximity, temperature, acoustic vibrations, or electrical cues alongside touch.',
    coreBottleneck: 'Combining modalities in one fingertip introduces optical clutter, spatial registration overhead, and cross-rate synchronization demands.',
    levers: [
      {
        id: 'tactile_visual',
        goalId: 'Mu',
        name: 'Integrated Tactile & Visual Sensing',
        fig3Label: 'Tactile & visual',
        modifiedParts: ['Transparent elastomer or cover', 'Ring/fluorescent markers', 'Switchable UV LEDs or polarizers'],
        mechanism: 'Lets cameras see external objects before contact and deformation during contact—either continuously or via active optical switching.',
        calibrationImpact: 'Requires separate external-vision camera calibration and tactile deformation/force calibration.',
        tradeoffNote: 'Continuous transparent skins admit ambient background clutter; active UV/polarizer switching isolates modes at the cost of switching delay.',
        representatives: ['FingerVision (2017)', 'See-Through-Your-Skin (2021)', 'SpecTac (2022)', 'Vi2TaP (2025)', 'TacThru (2026)', 'FingerEye (2026)'],
        scores: { compactness: 60, coverage: 62, spatialDetail: 64, forceCapability: 68, temporalBandwidth: 56, calibrationEase: 52 },
      },
      {
        id: 'multispectral',
        goalId: 'Mu',
        name: 'Multispectral Imaging',
        fig3Label: 'Multispectral',
        modifiedParts: ['Visible + NIR + Thermal + UV channels', 'Optical dichroic filters', 'Thermochromic patches'],
        mechanism: 'Separates external vision, contact deformation, and surface temperature across non-overlapping optical wavelength bands simultaneously.',
        calibrationImpact: 'Requires cross-camera chromatic/spatial registration and thermal or color-reference calibration.',
        tradeoffNote: 'Simultaneous interference-free multimodal perception, increasing optical complexity, packaging bulk, and system cost.',
        representatives: ['M3Tac (2024)', 'OmniSense v2 (2025)', 'SuperTac (2026)'],
        scores: { compactness: 36, coverage: 56, spatialDetail: 76, forceCapability: 70, temporalBandwidth: 54, calibrationEase: 34 },
      },
      {
        id: 'additional_sensors',
        goalId: 'Mu',
        name: 'Additional Non-Optical Components',
        fig3Label: 'Additional sensors',
        modifiedParts: ['Contact microphone', 'Accelerometer / IMU', 'Piezoresistive / triboelectric layer'],
        mechanism: 'Embeds high-bandwidth acoustic, inertial, or electrical pressure transducers to capture kHz micro-vibrations and impacts beyond camera frame rates.',
        calibrationImpact: 'Requires independent transducer calibration and precise cross-rate timestamp synchronization with camera frames.',
        tradeoffNote: 'Captures kHz vibrations and direct contact onset cleanly, while added wiring/components must avoid blocking optics or stiffening the pad.',
        representatives: ['Vibrotactile TacTip (2022)', 'VibTac (2025)', 'PolyTouch (2025)', 'PiezoSight (2025)'],
        scores: { compactness: 48, coverage: 54, spatialDetail: 72, forceCapability: 78, temporalBandwidth: 88, calibrationEase: 46 },
      },
    ],
  },
];

export interface ConflictRule {
  leverA: string;
  leverB: string;
  title: string;
  explanation: string;
}

export const COUPLED_CONFLICTS: ConflictRule[] = [
  {
    leverA: 'elastomer_design',
    leverB: 'event_imaging',
    title: 'Mechanical Recovery vs. Microsecond Camera Speed',
    explanation: 'A very soft or microstructured elastomer exhibits slower viscoelastic recovery, creating a mechanical bandwidth ceiling even when paired with a microsecond event camera.',
  },
  {
    leverA: 'folded_optics',
    leverB: 'tactile_visual',
    title: 'Folded Mirror Geometry vs. Unobstructed External Vision',
    explanation: 'Folding the optical path flattens the finger, but tilted viewing angles and narrow cavities restrict external pre-contact field of view and increase glare.',
  },
  {
    leverA: 'reflective_surfaces',
    leverB: 'tactile_visual',
    title: 'Opaque Reflective Coating vs. See-Through Vision',
    explanation: 'High-contrast matte reflective coatings maximize photometric surface-shading detail by blocking ambient light, which directly conflicts with transparent external vision unless semitransparent or switchable.',
  },
  {
    leverA: 'expanding_view',
    leverB: 'reflective_surfaces',
    title: 'Wide Curved Coverage vs. Uniform Photometric Shading',
    explanation: 'Wide-angle views over curved shells suffer pixel dilution, grazing-angle foreshortening, and spatially nonuniform illumination, complicating photometric normal calibration.',
  },
  {
    leverA: 'remote_imaging',
    leverB: 'reflective_surfaces',
    title: 'Fiber-Bundle Sampling vs. Micron-Scale Texture',
    explanation: 'Coherent imaging fiber bundles shrink the distal tip to millimeters, but finite fiber-core counts and honeycomb sampling limit fine photometric texture reconstruction.',
  },
];

export interface AdvisorScenario {
  id: string;
  title: string;
  description: string;
  recommendedLevers: string[];
  recommendedSensorIds: string[];
  caveat: string;
}

export const ADVISOR_SCENARIOS: AdvisorScenario[] = [
  {
    id: 'dexterous_fingertip',
    title: 'Compact Anthropomorphic Dexterous Hand',
    description: 'Tight finger footprint, multi-finger integration, local shape and moderate shear sensing.',
    recommendedLevers: ['compact_assemblies', 'folded_optics'],
    recommendedSensorIds: ['digit_2020', 'gelsight_wedge_2021', 'minsight_2023', 'gelstereo_biotip_2024'],
    caveat: 'Expect stronger close-range lens distortion and tighter illumination geometry; replaceable gel pads help manage wear.',
  },
  {
    id: 'slip_delicate',
    title: 'Fragile Grasping & Millisecond Slip Arrest',
    description: 'High sensitivity to gentle loads combined with rapid incipient slip and vibration detection.',
    recommendedLevers: ['event_imaging', 'surface_recovery', 'additional_sensors'],
    recommendedSensorIds: ['evetac_2024', 'hivtac_2022', 'polytouch_2025', 'vibtac_2025'],
    caveat: 'Balance silicone compliance against viscoelastic rebound time; event cameras need drift handling under static holds.',
  },
  {
    id: 'precontact_clutter',
    title: 'Pre-Contact Approach + Contact Manipulation',
    description: 'See object pose before touching under external camera occlusion, then track contact forces.',
    recommendedLevers: ['tactile_visual', 'structural_design'],
    recommendedSensorIds: ['fingervision_2017', 'spectac_2022', 'tacthru_2026', 'fingereye_2026'],
    caveat: 'Continuous transparent skins require robustness against background clutter; switchable modes trade effective frame rate.',
  },
  {
    id: 'micro_texture_3d',
    title: 'High-Resolution 3D Geometry & Surface Inspection',
    description: 'Reconstruct fine edges, micro-textures, or extended surfaces with sub-millimeter acuity.',
    recommendedLevers: ['reflective_surfaces', 'moving_surface', 'expanding_view'],
    recommendedSensorIds: ['gelsight_2017', 'gelslim_3_0_2022', 'gelpolight_2025', 'gelbelt_2025'],
    caveat: 'Requires controlled reflectance calibration (e.g., 3D Cal) and periodic recalibration as thin coatings abrade.',
  },
  {
    id: 'surgical_probe',
    title: 'Minimally Invasive / Confined-Space Palpation',
    description: 'Sub-10 mm distal diameter, electrical isolation at the tip, and high force sensitivity.',
    recommendedLevers: ['remote_imaging', 'elastomer_design'],
    recommendedSensorIds: ['minitac_2024', 'digit_pinki_2025', 'compdvision_2024', 'lighttact_2026'],
    caveat: 'Account for imaging-fiber bend radius, light attenuation, and honeycomb core-sampling artifacts.',
  },
];
