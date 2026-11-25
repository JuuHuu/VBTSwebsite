// Section 2.1, Fig. 2, and Table 1 metadata from the IJRR survey.

export type ComponentId = 'elastomer' | 'illumination' | 'optics' | 'sensor' | 'housing';

export interface SensorComponentInfo {
  id: ComponentId;
  name: string;
  shortName: string;
  color: string;
  role: string;
  designChoices: string[];
  tradeoffs: string;
  relatedSection: string;
}

export const SENSOR_COMPONENTS: SensorComponentInfo[] = [
  {
    id: 'elastomer',
    name: 'Deformable Elastomer & Interface',
    shortName: 'Elastomer',
    color: '#6BB3DF',
    role: 'Receives external contact loads and converts local geometry, texture, and shear into observable surface deformation or internal marker motion.',
    designChoices: [
      'Matte or metallic reflective coating for photometric surface shading',
      'Embedded markers, pins, dense color patterns, or multilayer grids',
      'Fluorescent UV-switchable markers or transparent see-through skins',
      'Multilayer compliance (soft outer skin + firmer inner backing) or microstructures',
    ],
    tradeoffs: 'Thicker, softer elastomers improve light-force sensitivity and compliance, but mechanically low-pass filter fine surface textures and exhibit slower viscoelastic recovery.',
    relatedSection: 'Sec. 2.1, 3.3, 3.4, 3.5',
  },
  {
    id: 'illumination',
    name: 'Illumination System',
    shortName: 'Illumination',
    color: '#EAB308',
    role: 'Lights the deformed elastomer or internal features with controlled direction, spectrum, or intensity so subtle surface slopes and displacements become visually distinct.',
    designChoices: [
      'Directional RGB LEDs (photometric stereo shading)',
      'Collimated light guides or base-mounted LEDs for curved shells',
      'Programmable UV + white LEDs for marker/markerless switching',
      'Near-infrared (NIR) and multispectral illumination bands',
    ],
    tradeoffs: 'Directional RGB lighting reveals micron-scale shading but demands uniform placement without occluding the camera view or causing specular glare.',
    relatedSection: 'Sec. 2.1, 3.1, 3.3, 3.6',
  },
  {
    id: 'optics',
    name: 'Imaging Optics',
    shortName: 'Imaging Optics',
    color: '#64748B',
    role: 'Shapes the optical path and focuses light from the deformed sensing surface onto the image sensor, governing working distance, field of view, and depth cues.',
    designChoices: [
      'Conventional compact pinholes and wide-angle / fisheye lenses',
      'Folded mirror paths for slim robotic fingers (GelSlim, GelSight Wedge)',
      'Microlens arrays (MLA) or coded masks for lensless thin imaging (ThinTact)',
      'Coherent fiber-optic bundles for remote imaging (DIGIT Pinki, MISTac)',
    ],
    tradeoffs: 'Shortening the optical working distance enables thinner fingertips, but intensifies lens distortion, foreshortening, or mask-specific computational calibration.',
    relatedSection: 'Sec. 2.1, 3.1, 3.2, 3.4',
  },
  {
    id: 'sensor',
    name: 'Image Sensor(s)',
    shortName: 'Image Sensor',
    color: '#2B5B84',
    role: 'Converts focused optical responses into digital frames or asynchronous brightness-change events, setting pixel resolution, dynamic range, and temporal bandwidth.',
    designChoices: [
      'Standard compact RGB CMOS cameras (30–60 fps)',
      'High-speed frame cameras (120–600+ fps) or monochrome sensors',
      'Asynchronous neuromorphic event cameras (microsecond latency)',
      'Multi-camera stereo arrays or multispectral/thermal camera pairs',
    ],
    tradeoffs: 'High frame rates shorten acquisition delay but require stronger illumination and higher bandwidth; event cameras arrest rapid slip but produce no events under static sustained holds.',
    relatedSection: 'Sec. 2.1, 3.2, 3.5, 3.6',
  },
  {
    id: 'housing',
    name: 'Housing & Support Structure',
    shortName: 'Housing',
    color: '#94A3B8',
    role: 'Maintains rigid optical alignment, shields ambient stray light, provides mechanical backing for the elastomer, or introduces calibrated compliance for net force measurement.',
    designChoices: [
      'Rigid acrylic backing window supporting the elastomer',
      'Modular mechanically keyed replaceable gel cartridges',
      'Spring-suspended mounts or compliant rings (L3F-TOUCH, Visiflex, FingerEye)',
      'Internal structural skeletons for all-around curved fingertips (Minsight)',
    ],
    tradeoffs: 'Rigid backing stabilizes optics but stiffens the elastomer relative to ideal half-space mechanics; compliant mounts decouple net 6-axis loads at the expense of distributed pressure fields.',
    relatedSection: 'Sec. 2.1, 2.3, 3.4',
  },
];

export type OpticalCueId = 'marker' | 'shading' | 'multiview' | 'events';

export interface OpticalCueInfo {
  id: OpticalCueId;
  name: string;
  shortName: string;
  summary: string;
  howItWorks: string;
  extractable: string[];
  calibration: string[];
  representatives: string[];
  keyLimitation: string;
}

export const OPTICAL_CUES: OpticalCueInfo[] = [
  {
    id: 'marker',
    name: 'Marker Displacement',
    shortName: 'Markers',
    summary: 'Track motion of discrete dots, pins, or printed patterns relative to an unloaded reference frame.',
    howItWorks: 'As normal, shear, and torsional forces deform the elastomer, markers embedded on or inside the gel shift in 2D/3D. Displacement fields directly expose tangential shear, torsion, and partial slip.',
    extractable: ['Deformation field', 'Contact position', 'Normal & shear force', 'Contact torque', 'Incipient & gross slip'],
    calibration: ['Spatial pixel-to-mm calibration', 'Force & torque load-displacement calibration'],
    representatives: ['GelForce (2004)', 'TacTip (2018)', 'FingerVision (2017)', 'GelSight markers (2015)'],
    keyLimitation: 'Discrete spatial sampling can miss micron-scale textures, and dense markers can occlude surface shading or become hard to track under large shear.',
  },
  {
    id: 'shading',
    name: 'Surface Shading',
    shortName: 'Shading',
    summary: 'Infer pixel-dense 3D surface normals and fine texture from directional RGB reflectance changes.',
    howItWorks: 'Directional LEDs illuminate a thin matte reflective coating. Local surface tilts alter pixel RGB intensity, which maps via calibrated reflectance tables to surface gradients (gx, gy) integrated via Poisson reconstruction.',
    extractable: ['Pixel-dense surface orientation', 'Fine 3D contact geometry', 'Micro-scale texture', 'Contact force (via calibration)'],
    calibration: ['Brightness-to-orientation (sphere indentation) calibration', 'Force-from-shading calibration'],
    representatives: ['GelSight (2017)', 'DIGIT (2020)', 'GelSlim 3.0 (2022)', 'UTact (2026)'],
    keyLimitation: 'Sensitive to illumination nonuniformity, specular highlights, and coating wear; recovers deformed elastomer shape rather than directly measuring tangential shear.',
  },
  {
    id: 'multiview',
    name: 'Multiple Viewpoints',
    shortName: 'Multi-View',
    summary: 'Triangulate 3D surface shape and internal deformation directly from stereo cameras or virtual mirror views.',
    howItWorks: 'Two or more real or mirror-generated viewpoints observe the deformed membrane or markers from distinct angles. Matching corresponding features across views recovers true 3D coordinates directly.',
    extractable: ['3D surface shape', '3D deformation field', 'Contact position', 'Contact force', 'Contact torque'],
    calibration: ['Multi-camera intrinsic/extrinsic calibration', 'Curved-interface refraction calibration', 'Force & torque calibration'],
    representatives: ['GelStereo BioTip (2024)', 'GelStereo Palm (2023)', 'Tac3D (2022)', 'BiTac (2023)'],
    keyLimitation: 'Requires stereo baseline or mirror space, careful refraction modeling through curved transparent elastomers, and reliable cross-view feature matching.',
  },
  {
    id: 'events',
    name: 'Brightness-Change Events',
    shortName: 'Events',
    summary: 'Record asynchronous per-pixel ON/OFF intensity spikes at microsecond resolution during dynamic contact.',
    howItWorks: 'A neuromorphic event camera fires asynchronous polarity events (+ / -) whenever local log-brightness changes exceed a threshold, capturing rapid pin/marker motion, vibrations, and slip with minimal data redundancy.',
    extractable: ['High-speed feature motion', 'Contact position & angle', 'Dynamic force', 'Rapid slip & vibration', 'Dynamic texture'],
    calibration: ['Spatial event-to-sensor mapping', 'Per-pixel contrast-threshold & force calibration'],
    representatives: ['NeuroTac (2020)', 'Evetac (2024)', 'TactiGraph (2023)', 'Event-based Roller (2026)'],
    keyLimitation: 'Generates few or no events during sustained static holds once deformation stabilizes, requiring temporal integration or drift compensation for static force estimation.',
  },
];

export const WORKING_STEPS = [
  {
    step: 1,
    title: 'Contact Deformation',
    desc: 'Applied normal, shear, and torsional loads indent and stretch the compliant elastomer according to contact mechanics.',
  },
  {
    step: 2,
    title: 'Optical Response',
    desc: 'Under controlled illumination, deformation alters surface shading, marker positions, multi-view disparity, or local brightness.',
  },
  {
    step: 3,
    title: 'Image Acquisition',
    desc: 'Imaging optics focus the optical response onto one or more frame-based or event-based image sensors.',
  },
  {
    step: 4,
    title: 'Tactile Estimation',
    desc: 'Calibrated analytical models or learned networks invert tactile observations into 3D geometry, force fields, texture, or slip.',
  },
];
