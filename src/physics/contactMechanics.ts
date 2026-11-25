// Contact mechanics and tactile reconstruction models from Section 2.2 & 2.3 of the IJRR survey.

export interface HertzResult {
  effectiveModulusKPa: number; // E* in kPa
  indentationMm: number;       // delta in mm
  contactRadiusMm: number;     // a in mm
  peakPressureKPa: number;     // p0 in kPa
  idealCurve: { delta: number; force: number }[];
  finitePadCurve: { delta: number; force: number }[];
}

/**
 * Hertz contact mechanics (Eqs. 1-2) with optional finite-thickness rigid-backing stiffening (Sec. 2.3).
 * E1, E2 in kPa; R in mm; Fn in N; padThicknessMm in mm.
 */
export function computeHertz(
  forceN: number,
  radiusMm: number,
  e1KPa: number,
  nu1: number,
  e2KPa: number,
  nu2: number,
  padThicknessMm: number
): HertzResult {
  const invEStar = (1 - nu1 * nu1) / Math.max(e1KPa, 1) + (1 - nu2 * nu2) / Math.max(e2KPa, 1);
  const eStarKPa = 1 / invEStar; // kPa = 1e-3 N/mm^2
  const eStarNPerMm2 = eStarKPa * 1e-3;

  // F_n = (4/3) E* sqrt(R) delta^(3/2)
  const coeff = (4 / 3) * eStarNPerMm2 * Math.sqrt(radiusMm);
  const delta = Math.pow(Math.max(forceN, 0) / Math.max(coeff, 1e-9), 2 / 3);
  const a = Math.sqrt(radiusMm * delta);
  const p0KPa = a > 1e-4 ? ((3 * forceN) / (2 * Math.PI * a * a)) * 1e3 : 0;

  const maxDelta = Math.max(delta * 1.45, 2.5);
  const idealCurve: { delta: number; force: number }[] = [];
  const finitePadCurve: { delta: number; force: number }[] = [];

  for (let i = 0; i <= 40; i++) {
    const d = (i / 40) * maxDelta;
    const fIdeal = coeff * Math.pow(d, 1.5);
    // Rigid-backing finite-thickness correction (empirical Chadwick/Dimitriadis stiffening factor)
    const chi = Math.sqrt(radiusMm * d) / Math.max(padThicknessMm, 0.5);
    const stiffen = 1 + 1.133 * chi + 1.283 * chi * chi + 0.769 * Math.pow(chi, 3);
    idealCurve.push({ delta: d, force: fIdeal });
    finitePadCurve.push({ delta: d, force: fIdeal * stiffen });
  }

  return {
    effectiveModulusKPa: eStarKPa,
    indentationMm: delta,
    contactRadiusMm: a,
    peakPressureKPa: p0KPa,
    idealCurve,
    finitePadCurve,
  };
}

export interface ViscoPoint {
  t: number;
  strain: number;
  stressIdeal: number;
  stressVisco: number;
  reboundResidual: number;
}

/**
 * Boltzmann linear viscoelasticity (Eq. 3): sigma(t) = int_0^t E_rel(t - t') eps_dot(t') dt'
 * Standard Linear Solid (Prony) kernel: E_rel(s) = E_inf + E_1 * exp(-s / tau_rel)
 */
export function computeViscoelastic(
  pressRate: number,    // 1..5 (higher = faster ramp)
  holdDuration: number, // 0.5..4.0 s
  tauRel: number,       // relaxation time constant 0.2..3.0 s
  viscoFraction: number // 0..0.75 (0 = purely elastic)
): ViscoPoint[] {
  const tRamp = 1.2 / Math.max(pressRate, 0.2);
  const tHoldEnd = tRamp + holdDuration;
  const tReleaseEnd = tHoldEnd + tRamp;
  const tTotal = tReleaseEnd + 2.5;
  const steps = 120;
  const dt = tTotal / steps;

  const E0 = 100; // kPa nominal instantaneous modulus
  const Einf = E0 * (1 - viscoFraction);
  const E1 = E0 * viscoFraction;

  const times: number[] = [];
  const strains: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    times.push(t);
    let eps = 0;
    if (t < tRamp) {
      eps = 0.25 * (t / tRamp);
    } else if (t < tHoldEnd) {
      eps = 0.25;
    } else if (t < tReleaseEnd) {
      eps = 0.25 * (1 - (t - tHoldEnd) / tRamp);
    } else {
      eps = 0;
    }
    strains.push(eps);
  }

  const pts: ViscoPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = times[i];
    let sigma = 0;
    for (let j = 1; j <= i; j++) {
      const deps = strains[j] - strains[j - 1];
      const dtLag = t - times[j];
      const kernel = Einf + E1 * Math.exp(-dtLag / Math.max(tauRel, 0.05));
      sigma += kernel * deps;
    }
    const stressIdeal = E0 * strains[i];
    // Lingering viscoelastic recovery deformation after release
    let rebound = strains[i];
    if (t > tReleaseEnd) {
      rebound = 0.25 * viscoFraction * 0.45 * Math.exp(-(t - tReleaseEnd) / Math.max(tauRel, 0.1));
    }
    pts.push({
      t,
      strain: strains[i],
      stressIdeal,
      stressVisco: Math.max(sigma, 0),
      reboundResidual: rebound,
    });
  }
  return pts;
}

export interface PartialSlipResult {
  stickRatio: number; // c / a
  isGrossSlip: boolean;
  shearRatio: number; // Ft / (mu * Fn)
  profile: { rNorm: number; tractionNorm: number; hertzPressureNorm: number }[];
}

/**
 * Cattaneo-Mindlin partial slip (Eqs. 7-8).
 */
export function computePartialSlip(
  fnN: number,
  ftN: number,
  mu: number
): PartialSlipResult {
  const maxFt = Math.max(mu * fnN, 1e-6);
  const ratio = ftN / maxFt;
  const isGrossSlip = ratio >= 1.0;
  const cOverA = isGrossSlip ? 0 : Math.pow(Math.max(1 - ratio, 0), 1 / 3);

  const profile: { rNorm: number; tractionNorm: number; hertzPressureNorm: number }[] = [];
  for (let i = 0; i <= 60; i++) {
    const r = i / 60; // r / a in [0, 1]
    const pNorm = Math.sqrt(Math.max(1 - r * r, 0));
    let tauNorm = pNorm;
    if (r <= cOverA && cOverA > 1e-4) {
      const inner = Math.sqrt(Math.max(1 - (r * r) / (cOverA * cOverA), 0));
      tauNorm = Math.max(pNorm - cOverA * inner, 0);
    }
    profile.push({ rNorm: r, tractionNorm: tauNorm, hertzPressureNorm: pNorm });
  }

  return {
    stickRatio: cOverA,
    isGrossSlip,
    shearRatio: ratio,
    profile,
  };
}

export interface BoussinesqResult {
  x: number[];
  truePressure: number[];
  displacement: number[];
  noisyDisplacement: number[];
  naiveInverse: number[];
  regularizedInverse: number[];
}

/**
 * 1D cross-section of Boussinesq smoothing (Eq. 4) and ill-posed inversion amplification (Sec. 2.3).
 */
export function computeBoussinesq(
  twoPeaks: boolean,
  noiseLevel: number, // 0..0.06
  regularization: number // 0.01..0.5
): BoussinesqResult {
  const N = 48;
  const x: number[] = [];
  const p: number[] = [];
  for (let i = 0; i < N; i++) {
    const xi = -1 + (2 * i) / (N - 1);
    x.push(xi);
    if (twoPeaks) {
      const p1 = Math.exp(-Math.pow((xi + 0.32) / 0.14, 2));
      const p2 = 0.85 * Math.exp(-Math.pow((xi - 0.32) / 0.14, 2));
      p.push(p1 + p2);
    } else {
      p.push(Math.exp(-Math.pow(xi / 0.25, 2)));
    }
  }

  // Softened Boussinesq kernel 1 / sqrt((x-xi)^2 + eps^2)
  const eps = 0.12;
  const dx = 2 / (N - 1);
  const w: number[] = new Array(N).fill(0);
  for (let i = 0; i < N; i++) {
    let sum = 0;
    for (let j = 0; j < N; j++) {
      sum += (p[j] * dx) / Math.sqrt((x[i] - x[j]) ** 2 + eps * eps);
    }
    w[i] = sum * 0.22;
  }

  // Deterministic pseudo-random measurement noise so slider changes smoothly
  const wNoisy = w.map((val, i) => {
    const n = Math.sin(i * 12.9898 + 1.23) * 43758.5453;
    const rand = (n - Math.floor(n)) * 2 - 1;
    return val + noiseLevel * rand;
  });

  // Discrete Fourier deconvolution to illustrate ill-posed high-frequency noise blow-up
  const kGrid = Array.from({ length: N }, (_, k) => (k <= N / 2 ? k : k - N));
  const dft = (arr: number[]) =>
    kGrid.map((k) => {
      let re = 0,
        im = 0;
      for (let n = 0; n < N; n++) {
        const ang = (-2 * Math.PI * k * n) / N;
        re += arr[n] * Math.cos(ang);
        im += arr[n] * Math.sin(ang);
      }
      return { re, im };
    });

  // Kernel centered at index 0
  const ker = Array.from({ length: N }, (_, j) => {
    const d = j <= N / 2 ? j * dx : (j - N) * dx;
    return (0.22 * dx) / Math.sqrt(d * d + eps * eps);
  });
  const K = dft(ker);
  const W = dft(wNoisy);

  const invertWithLambda = (lam: number) => {
    const Phat = K.map((kv, idx) => {
      const mag2 = kv.re * kv.re + kv.im * kv.im + lam;
      return {
        re: (W[idx].re * kv.re + W[idx].im * kv.im) / mag2,
        im: (W[idx].im * kv.re - W[idx].re * kv.im) / mag2,
      };
    });
    return Array.from({ length: N }, (_, n) => {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        const ang = (2 * Math.PI * kGrid[k] * n) / N;
        sum += Phat[k].re * Math.cos(ang) - Phat[k].im * Math.sin(ang);
      }
      return sum / N;
    });
  };

  return {
    x,
    truePressure: p,
    displacement: w,
    noisyDisplacement: wNoisy,
    naiveInverse: invertWithLambda(0.0008),
    regularizedInverse: invertWithLambda(regularization * 0.08),
  };
}

export interface Vector2D {
  x: number;
  y: number;
  ux: number;
  uy: number;
}

/**
 * Helmholtz-Hodge decomposition (Eq. 6): u_parallel = grad(phi) + grad^perp(psi) + h
 */
export function computeHelmholtzHodge(
  normalPush: number, // drives curl-free radial expansion grad(phi)
  twistTorque: number, // drives rotational swirl grad^perp(psi)
  shearX: number, // drives harmonic translation h
  shearY: number
): {
  total: Vector2D[];
  curlFree: Vector2D[];
  rotational: Vector2D[];
  harmonic: Vector2D[];
} {
  const total: Vector2D[] = [];
  const curlFree: Vector2D[] = [];
  const rotational: Vector2D[] = [];
  const harmonic: Vector2D[] = [];
  const grid = 7;

  for (let iy = 0; iy < grid; iy++) {
    for (let ix = 0; ix < grid; ix++) {
      const x = -0.85 + (1.7 * ix) / (grid - 1);
      const y = -0.85 + (1.7 * iy) / (grid - 1);
      const r2 = x * x + y * y;
      const env = Math.exp(-r2 * 1.45);

      // Curl-free outward radial expansion under normal compression
      const cfx = normalPush * x * env * 0.9;
      const cfy = normalPush * y * env * 0.9;

      // Divergence-free rotational field under torsional torque
      const rtx = -twistTorque * y * env * 0.9;
      const rty = twistTorque * x * env * 0.9;

      // Harmonic uniform shear field
      const hx = shearX * 0.42;
      const hy = shearY * 0.42;

      curlFree.push({ x, y, ux: cfx, uy: cfy });
      rotational.push({ x, y, ux: rtx, uy: rty });
      harmonic.push({ x, y, ux: hx, uy: hy });
      total.push({ x, y, ux: cfx + rtx + hx, uy: cfy + rty + hy });
    }
  }
  return { total, curlFree, rotational, harmonic };
}
