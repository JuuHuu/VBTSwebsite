import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Html,
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
  Edges,
  Line,
} from '@react-three/drei';
import * as THREE from 'three';
import type { ComponentId, OpticalCueId } from '../../data/opticalCues';

export type IndenterShape = 'sphere' | 'edge' | 'texture' | 'soft';

export interface SensorSimState {
  normalForce: number;    // 0..10 N
  shearX: number;         // -1..1 normalized
  shearY: number;         // -1..1 normalized
  twist: number;          // -1..1 normalized
  stiffnessKPa: number;   // 30..300 kPa
  padThickness: number;   // 1..6 mm
  indenter: IndenterShape;
  cue: OpticalCueId;
  explode: number;        // 0..1
  selectedComponent: ComponentId | null;
  darkBench: boolean;
  showRays: boolean;
}

interface TactileSensor3DProps {
  state: SensorSimState;
  onSelectComponent: (id: ComponentId) => void;
}

// Compute physical surface indentation depth & displacement analytically (shared with marker instancing)
export function evalSurfaceDisplacement(
  x: number,
  z: number,
  state: SensorSimState
): { dy: number; dx: number; dz: number; stress: number } {
  const { normalForce, shearX, shearY, twist, stiffnessKPa, indenter } = state;
  const compliance = 110 / Math.max(stiffnessKPa, 25);
  const depthScale = Math.min(0.42, (normalForce / 10) * 0.32 * Math.pow(compliance, 0.55));

  const cx = shearX * 0.35;
  const cz = shearY * 0.35;
  const rx = x - cx;
  const rz = z - cz;
  const r2 = rx * rx + rz * rz;
  const r = Math.sqrt(r2);

  let dy = 0;
  if (indenter === 'sphere') {
    const rad = 0.72;
    if (r < rad) {
      const t = 1 - (r * r) / (rad * rad);
      dy = -depthScale * Math.pow(t, 1.35);
    }
  } else if (indenter === 'edge') {
    const along = Math.abs(rx * 0.85 + rz * 0.52);
    const across = Math.abs(-rx * 0.52 + rz * 0.85);
    if (along < 0.85 && across < 0.42) {
      const ridge = Math.max(0, 1 - across / 0.42);
      const endFade = Math.max(0, 1 - Math.pow(along / 0.85, 4));
      dy = -depthScale * 1.12 * Math.pow(ridge, 1.15) * endFade;
    }
  } else if (indenter === 'texture') {
    const rad = 0.82;
    if (r < rad) {
      const env = Math.pow(1 - (r * r) / (rad * rad), 0.9);
      const ribs = 0.72 + 0.28 * Math.cos(rx * 22.0) * Math.cos(rz * 22.0);
      dy = -depthScale * 0.9 * env * ribs;
    }
  } else {
    const rad = 0.95;
    if (r < rad) {
      const t = 1 - (r * r) / (rad * rad);
      dy = -depthScale * 0.62 * Math.pow(t, 0.75);
    }
  }

  const env = Math.exp(-r2 * 2.1);
  const pushOut = (-dy * 0.45) * (r > 1e-4 ? 1 : 0);
  const dx = (r > 1e-4 ? (rx / r) * pushOut : 0) + shearX * 0.22 * env - twist * rz * 0.28 * env;
  const dz = (r > 1e-4 ? (rz / r) * pushOut : 0) + shearY * 0.22 * env + twist * rx * 0.28 * env;
  const stress = Math.min(1, Math.abs(dy) / 0.35 + Math.hypot(dx, dz) * 1.4);

  return { dy, dx, dz, stress };
}

function DeformableElastomer({
  state,
  yOffset,
  onSelect,
}: {
  state: SensorSimState;
  yOffset: number;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const markersRef = useRef<THREE.InstancedMesh>(null);
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempCol = useMemo(() => new THREE.Color(), []);

  const padH = 0.16 + (state.padThickness / 6) * 0.22;
  const isSelected = state.selectedComponent === 'elastomer';

  const baseGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(2.34, 2.34, 64, 64);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  const basePositions = useMemo(() => {
    const arr = baseGeo.attributes.position.array as Float32Array;
    return new Float32Array(arr);
  }, [baseGeo]);

  // 7x7 marker grid coordinates
  const markerCoords = useMemo(() => {
    const pts: [number, number][] = [];
    for (let ix = -3; ix <= 3; ix++) {
      for (let iz = -3; iz <= 3; iz++) {
        pts.push([ix * 0.31, iz * 0.31]);
      }
    }
    return pts;
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (mesh) {
      const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < pos.count; i++) {
        const bx = basePositions[i * 3];
        const bz = basePositions[i * 3 + 2];
        const { dy, dx, dz } = evalSurfaceDisplacement(bx, bz, state);
        arr[i * 3] = bx + dx * 0.35;
        arr[i * 3 + 1] = dy;
        arr[i * 3 + 2] = bz + dz * 0.35;
      }
      pos.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
    }

    if (markersRef.current) {
      markerCoords.forEach(([mx, mz], idx) => {
        const { dy, dx, dz, stress } = evalSurfaceDisplacement(mx, mz, state);
        tempObj.position.set(mx + dx, dy - padH * 0.34, mz + dz);
        const s = state.cue === 'marker' || state.cue === 'events' ? 1.05 : 0.72;
        tempObj.scale.set(s, s, s);
        tempObj.updateMatrix();
        markersRef.current!.setMatrixAt(idx, tempObj.matrix);

        if (state.cue === 'events') {
          tempCol.set(stress > 0.25 ? '#D97706' : '#38BDF8');
        } else if (stress > 0.45) {
          tempCol.set('#D97706');
        } else {
          tempCol.set('#1E3A5F');
        }
        markersRef.current!.setColorAt(idx, tempCol);
      });
      markersRef.current.instanceMatrix.needsUpdate = true;
      if (markersRef.current.instanceColor) {
        markersRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <group
      position={[0, yOffset, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Translucent silicone elastomer slab */}
      <RoundedBox
        args={[2.36, padH, 2.36]}
        radius={0.025}
        smoothness={3}
        position={[0, -padH / 2 - 0.015, 0]}
      >
        <meshPhysicalMaterial
          color={isSelected ? '#A8D4F0' : '#C6E2F4'}
          transparent
          opacity={state.cue === 'shading' ? 0.38 : 0.34}
          roughness={0.14}
          metalness={0.0}
          clearcoat={0.9}
          clearcoatRoughness={0.12}
          ior={1.42}
          depthWrite={false}
        />
        <Edges
          threshold={18}
          color={isSelected ? '#2B5B84' : '#7CAEC9'}
          transparent
          opacity={isSelected ? 0.7 : 0.32}
        />
      </RoundedBox>

      {/* Deforming upper contact membrane */}
      <mesh ref={meshRef} geometry={baseGeo} position={[0, 0.01, 0]} receiveShadow>
        <meshPhysicalMaterial
          color={
            state.cue === 'shading'
              ? isSelected
                ? '#CFDDE9'
                : '#DDE5EC'
              : isSelected
              ? '#9FD1EE'
              : '#B8DDF2'
          }
          roughness={state.cue === 'shading' ? 0.34 : 0.18}
          metalness={state.cue === 'shading' ? 0.14 : 0.02}
          clearcoat={state.cue === 'shading' ? 0.42 : 0.85}
          clearcoatRoughness={0.22}
          sheen={0.35}
          sheenColor="#FFFFFF"
          transparent={state.cue !== 'shading'}
          opacity={state.cue === 'shading' ? 0.96 : 0.58}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Embedded markers / internal pins */}
      <instancedMesh
        ref={markersRef}
        args={[undefined, undefined, markerCoords.length]}
        visible={state.cue !== 'shading'}
      >
        <sphereGeometry args={[0.031, 16, 16]} />
        <meshPhysicalMaterial roughness={0.28} metalness={0.12} clearcoat={0.5} />
      </instancedMesh>

      {/* Optical-grade rigid clear acrylic backing window */}
      <RoundedBox
        args={[2.44, 0.085, 2.44]}
        radius={0.018}
        smoothness={3}
        position={[0, -padH - 0.06, 0]}
      >
        <meshPhysicalMaterial
          color="#E7EEF5"
          transparent
          opacity={0.46}
          roughness={0.05}
          metalness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.06}
          ior={1.49}
          depthWrite={false}
        />
        <Edges
          threshold={18}
          color={isSelected ? '#2B5B84' : '#94A3B8'}
          transparent
          opacity={isSelected ? 0.7 : 0.42}
        />
      </RoundedBox>

      {/* Slim retaining gasket rim between acrylic and elastomer */}
      {[
        [0, -padH - 0.015, -1.19, 2.42, 0.025, 0.05],
        [0, -padH - 0.015, 1.19, 2.42, 0.025, 0.05],
        [-1.19, -padH - 0.015, 0, 0.05, 0.025, 2.34],
        [1.19, -padH - 0.015, 0, 0.05, 0.025, 2.34],
      ].map(([x, y, z, w, h, d], idx) => (
        <mesh key={idx} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#8FA3B8" roughness={0.4} metalness={0.45} />
        </mesh>
      ))}

      {state.explode > 0.25 && (
        <Html position={[1.58, 0.02, 0]} center distanceFactor={9.5}>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-[#7BA7CE] bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-[#1E3A5F] shadow-xs">
            1. Deformable Elastomer
          </div>
        </Html>
      )}
    </group>
  );
}

function IndenterMesh({ state, yBase }: { state: SensorSimState; yBase: number }) {
  const { normalForce, shearX, shearY, twist, stiffnessKPa, indenter, explode } = state;
  const compliance = 110 / Math.max(stiffnessKPa, 25);
  const pressDrop = Math.min(0.4, (normalForce / 10) * 0.3 * Math.pow(compliance, 0.55));
  const posX = shearX * 0.35;
  const posZ = shearY * 0.35;
  const liftY = yBase + 0.51 - pressDrop + explode * 0.55;

  return (
    <group position={[posX, liftY, posZ]} rotation={[0, -twist * 0.6, 0]}>
      {indenter === 'sphere' && (
        <group>
          {/* Satin ceramic / precision stainless calibration sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.48, 48, 48]} />
            <meshPhysicalMaterial
              color="#DDE4EC"
              metalness={0.28}
              roughness={0.18}
              clearcoat={0.85}
              clearcoatRoughness={0.12}
            />
          </mesh>
          {/* Precision probe collar & vertical loading stem */}
          <mesh position={[0, 0.49, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.16, 0.08, 32]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.55} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.42, 24]} />
            <meshStandardMaterial color="#B6C2CE" metalness={0.45} roughness={0.28} />
          </mesh>
        </group>
      )}

      {indenter === 'edge' && (
        <group>
          <mesh rotation={[0, Math.PI / 6, Math.PI]} position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.52, 0.05, 0.62, 4]} />
            <meshPhysicalMaterial
              color="#C8D3DF"
              metalness={0.4}
              roughness={0.22}
              clearcoat={0.6}
            />
            <Edges threshold={15} color="#64748B" transparent opacity={0.45} />
          </mesh>
          <mesh position={[0, 0.46, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.32, 24]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      )}

      {indenter === 'texture' && (
        <group position={[0, -0.22, 0]}>
          {/* Machined satin brass textured disk */}
          <mesh castShadow>
            <cylinderGeometry args={[0.58, 0.58, 0.24, 48]} />
            <meshPhysicalMaterial
              color="#C99652"
              metalness={0.55}
              roughness={0.26}
              clearcoat={0.45}
            />
            <Edges threshold={25} color="#8B5E26" transparent opacity={0.35} />
          </mesh>
          {/* Raised center rim */}
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.48, 0.52, 0.03, 40]} />
            <meshStandardMaterial color="#D8AA6A" metalness={0.5} roughness={0.24} />
          </mesh>
          {/* Micro-ribbed tactile grating underneath */}
          {[-0.36, -0.24, -0.12, 0, 0.12, 0.24, 0.36].map((off, i) => (
            <mesh key={i} position={[off, -0.135, 0]}>
              <boxGeometry args={[0.032, 0.032, 0.86]} />
              <meshStandardMaterial color="#B5803B" metalness={0.55} roughness={0.28} />
            </mesh>
          ))}
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.35, 24]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      )}

      {indenter === 'soft' && (
        <mesh scale={[1.12, 0.68 - pressDrop * 0.25, 1.12]} castShadow>
          <sphereGeometry args={[0.52, 48, 48]} />
          <meshPhysicalMaterial
            color="#E28E7E"
            roughness={0.56}
            metalness={0.02}
            sheen={0.55}
            sheenColor="#FFF1EE"
            clearcoat={0.18}
          />
        </mesh>
      )}
    </group>
  );
}

function IlluminationSystem({
  state,
  yOffset,
  onSelect,
}: {
  state: SensorSimState;
  yOffset: number;
  onSelect: () => void;
}) {
  const isSelected = state.selectedComponent === 'illumination';
  // Editorial refined photometric RGB + amber palette (or warm champagne white-light LEDs)
  const ledColors =
    state.cue === 'shading'
      ? ['#DC5A5A', '#3FA46A', '#4A8FE0', '#E09F3E']
      : ['#E5A94C', '#E5A94C', '#E5A94C', '#E5A94C'];

  const positions: [number, number, number, number][] = [
    [-1.13, 0, 0, 0],
    [1.13, 0, 0, Math.PI],
    [0, 0, -1.13, Math.PI / 2],
    [0, 0, 1.13, -Math.PI / 2],
  ];

  // Five discrete SMD emitters along each LED carrier bar
  const smdOffsets = [-0.28, -0.14, 0, 0.14, 0.28];

  return (
    <group
      position={[0, yOffset, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {positions.map(([px, py, pz, rotY], i) => {
        const col = ledColors[i];
        return (
          <group key={i} position={[px, py, pz]} rotation={[0, rotY, 0]}>
            {/* Anodized aluminum LED carrier bar */}
            <RoundedBox args={[0.1, 0.26, 0.84]} radius={0.018} smoothness={3}>
              <meshStandardMaterial
                color={isSelected ? '#4E6B8A' : '#3B4A5E'}
                roughness={0.36}
                metalness={0.45}
              />
              <Edges
                threshold={18}
                color={isSelected ? '#D97706' : '#64748B'}
                transparent
                opacity={isSelected ? 0.85 : 0.35}
              />
            </RoundedBox>

            {/* Recessed frosted optical diffuser window */}
            <RoundedBox
              args={[0.025, 0.18, 0.72]}
              radius={0.008}
              smoothness={2}
              position={[0.052, 0, 0]}
            >
              <meshPhysicalMaterial
                color="#F8FAFC"
                emissive={col}
                emissiveIntensity={isSelected ? 1.15 : 0.65}
                roughness={0.22}
                transparent
                opacity={0.86}
              />
            </RoundedBox>

            {/* 5 discrete micro-SMD LED diodes visible behind diffuser */}
            {smdOffsets.map((oz, k) => (
              <mesh key={k} position={[0.06, 0, oz]}>
                <boxGeometry args={[0.018, 0.055, 0.055]} />
                <meshStandardMaterial
                  color={col}
                  emissive={col}
                  emissiveIntensity={isSelected ? 2.4 : 1.5}
                  roughness={0.2}
                />
              </mesh>
            ))}

            {/* Gold electrical end pads */}
            {[-0.38, 0.38].map((oz, k) => (
              <mesh key={k} position={[0.048, 0, oz]}>
                <boxGeometry args={[0.015, 0.08, 0.035]} />
                <meshStandardMaterial color="#D4A754" metalness={0.75} roughness={0.25} />
              </mesh>
            ))}

            {/* Delicate inward-aimed optical rays strictly inside chamber toward elastomer */}
            {state.showRays && (
              <group>
                {/* Soft low-opacity triangular illumination fan pointing UP & INWARD */}
                {[-0.22, 0, 0.22].map((oz, k) => (
                  <Line
                    key={k}
                    points={[
                      [0.07, 0.03, oz],
                      [0.95, 0.44, oz * 0.55],
                    ]}
                    color={col}
                    lineWidth={1.15}
                    dashed
                    dashSize={0.06}
                    gapSize={0.045}
                    transparent
                    opacity={state.darkBench ? 0.62 : 0.46}
                  />
                ))}
                {/* Ultra-subtle soft volumetric glow sheet strictly inside housing */}
                <mesh position={[0.48, 0.22, 0]} rotation={[0, 0, 0.43]}>
                  <planeGeometry args={[0.88, 0.36]} />
                  <meshBasicMaterial
                    color={col}
                    transparent
                    opacity={state.darkBench ? 0.11 : 0.075}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {state.explode > 0.25 && (
        <Html position={[1.65, 0, 0]} center distanceFactor={9.5}>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-amber-500/80 bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-amber-800 shadow-xs">
            2. Illumination System
          </div>
        </Html>
      )}
    </group>
  );
}

function ImagingOptics({
  state,
  yOffset,
  onSelect,
}: {
  state: SensorSimState;
  yOffset: number;
  onSelect: () => void;
}) {
  const isSelected = state.selectedComponent === 'optics';
  const stereo = state.cue === 'multiview';
  const offsets = stereo ? [-0.52, 0.52] : [0];

  return (
    <group
      position={[0, yOffset, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Sleek machined bridge bar connecting stereo lenses */}
      {stereo && (
        <RoundedBox args={[1.38, 0.09, 0.38]} radius={0.02} smoothness={3} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#8A99AA" metalness={0.5} roughness={0.32} />
          <Edges threshold={18} color="#475569" transparent opacity={0.35} />
        </RoundedBox>
      )}

      {offsets.map((ox, i) => (
        <group key={i} position={[ox, 0, 0]}>
          {/* Lower threaded M12 mounting collar */}
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.12, 36]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.36} />
          </mesh>

          {/* Main precision satin gunmetal lens barrel */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.33, 0.29, 0.28, 40]} />
            <meshStandardMaterial
              color={isSelected ? '#3B6EA5' : '#4A596B'}
              metalness={0.55}
              roughness={0.28}
            />
          </mesh>

          {/* Machined focus/knurl accent rings */}
          {[-0.04, 0.04, 0.11].map((ry, k) => (
            <mesh key={k} position={[0, ry, 0]}>
              <torusGeometry args={[0.315 + k * 0.008, 0.012, 12, 40]} />
              <meshStandardMaterial color="#273240" metalness={0.65} roughness={0.32} />
            </mesh>
          ))}

          {/* Chamfered silver anodized retaining bezel ring */}
          <mesh position={[0, 0.175, 0]}>
            <cylinderGeometry args={[0.335, 0.335, 0.045, 40]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.62} roughness={0.22} />
          </mesh>

          {/* Dark internal aperture stop */}
          <mesh position={[0, 0.198, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.16, 0.29, 36]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} />
          </mesh>

          {/* Multi-coated convex optical crown glass element */}
          <mesh position={[0, 0.19, 0]}>
            <sphereGeometry args={[0.24, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.38]} />
            <meshPhysicalMaterial
              color="#7EC4F0"
              transparent
              opacity={0.82}
              roughness={0.04}
              metalness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.04}
              iridescence={0.65}
              iridescenceIOR={1.38}
              ior={1.52}
            />
          </mesh>

          {/* Clean architectural optical ray lines connecting elastomer -> lens -> sensor */}
          {state.showRays && (
            <group>
              {[
                [-0.62, -0.62],
                [0.62, -0.62],
                [-0.62, 0.62],
                [0.62, 0.62],
              ].map(([rx, rz], k) => {
                const spread = stereo ? 0.52 : 0.78;
                const rayCol = stereo ? (i === 0 ? '#3B82F6' : '#8B5CF6') : '#C97B36';
                return (
                  <group key={k}>
                    {/* Upper rays from elastomer surface converging into lens */}
                    <Line
                      points={[
                        [rx * spread, 1.05, rz * spread],
                        [rx * 0.22, 0.22, rz * 0.22],
                      ]}
                      color={rayCol}
                      lineWidth={1.1}
                      dashed
                      dashSize={0.055}
                      gapSize={0.04}
                      transparent
                      opacity={state.darkBench ? 0.55 : 0.44}
                    />
                    {/* Lower rays focusing from lens onto CMOS active die */}
                    <Line
                      points={[
                        [rx * 0.16, -0.2, rz * 0.16],
                        [rx * 0.2, -0.52, rz * 0.2],
                      ]}
                      color={rayCol}
                      lineWidth={1.0}
                      transparent
                      opacity={state.darkBench ? 0.5 : 0.38}
                    />
                  </group>
                );
              })}
            </group>
          )}
        </group>
      ))}

      {state.explode > 0.25 && (
        <Html position={[1.58, 0, 0]} center distanceFactor={9.5}>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-slate-400 bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-xs">
            3. Imaging Optics {stereo ? '(Stereo)' : ''}
          </div>
        </Html>
      )}
    </group>
  );
}

function ImageSensorBoard({
  state,
  yOffset,
  onSelect,
}: {
  state: SensorSimState;
  yOffset: number;
  onSelect: () => void;
}) {
  const isSelected = state.selectedComponent === 'sensor';
  const stereo = state.cue === 'multiview';
  const offsets = stereo ? [-0.52, 0.52] : [0];
  const pcbW = stereo ? 1.94 : 1.26;
  const pcbD = 1.26;

  return (
    <group
      position={[0, yOffset, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Chamfered matte editorial-navy PCB */}
      <RoundedBox args={[pcbW, 0.075, pcbD]} radius={0.022} smoothness={3} receiveShadow castShadow>
        <meshStandardMaterial
          color={isSelected ? '#274E78' : '#1E3A5F'}
          roughness={0.44}
          metalness={0.14}
        />
        <Edges
          threshold={18}
          color={isSelected ? '#60A5FA' : '#4A6B8F'}
          transparent
          opacity={isSelected ? 0.8 : 0.35}
        />
      </RoundedBox>

      {/* Four brass corner standoffs & mounting screws */}
      {[
        [-pcbW / 2 + 0.1, -pcbD / 2 + 0.1],
        [pcbW / 2 - 0.1, -pcbD / 2 + 0.1],
        [-pcbW / 2 + 0.1, pcbD / 2 - 0.1],
        [pcbW / 2 - 0.1, pcbD / 2 - 0.1],
      ].map(([sx, sz], idx) => (
        <group key={idx} position={[sx, 0, sz]}>
          <mesh position={[0, -0.07, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.08, 16]} />
            <meshStandardMaterial color="#C89D54" metalness={0.72} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.048, 0]}>
            <cylinderGeometry args={[0.042, 0.042, 0.022, 16]} />
            <meshStandardMaterial color="#DCE3EB" metalness={0.65} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Delicate SMD decoupling capacitors & resistors along PCB edge */}
      {[-0.36, -0.22, -0.08, 0.08, 0.22, 0.36].map((cx, idx) => (
        <mesh key={idx} position={[cx, 0.05, pcbD / 2 - 0.14]}>
          <boxGeometry args={[0.065, 0.028, 0.036]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#B5895A' : '#334155'}
            metalness={0.35}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Rear gold header + slim Kapton flex ribbon exiting to back */}
      <mesh position={[0, 0.055, -pcbD / 2 + 0.09]}>
        <boxGeometry args={[0.52, 0.045, 0.1]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.042, -pcbD / 2 - 0.16]}>
        <boxGeometry args={[0.42, 0.012, 0.38]} />
        <meshStandardMaterial color="#C07D42" metalness={0.25} roughness={0.38} />
      </mesh>

      {/* Ceramic QFN package(s) + iridescent silicon active pixel die */}
      {offsets.map((ox, i) => (
        <group key={i} position={[ox, 0.068, 0]}>
          <RoundedBox args={[0.58, 0.058, 0.58]} radius={0.014} smoothness={2}>
            <meshStandardMaterial color="#182232" roughness={0.32} metalness={0.22} />
            <Edges threshold={18} color="#475569" transparent opacity={0.4} />
          </RoundedBox>
          {/* Gold bonding bezel frame around silicon die */}
          <mesh position={[0, 0.031, 0]}>
            <boxGeometry args={[0.45, 0.008, 0.45]} />
            <meshStandardMaterial color="#D4A754" metalness={0.78} roughness={0.24} />
          </mesh>
          {/* Iridescent active CMOS / Event-DVS silicon die */}
          <mesh position={[0, 0.036, 0]}>
            <boxGeometry args={[0.39, 0.012, 0.39]} />
            <meshPhysicalMaterial
              color={state.cue === 'events' ? '#1795B3' : '#2C7AB8'}
              emissive={state.cue === 'events' ? '#0E7490' : '#1D4ED8'}
              emissiveIntensity={0.35}
              metalness={0.68}
              roughness={0.12}
              clearcoat={1}
              iridescence={0.85}
              iridescenceIOR={1.5}
            />
          </mesh>
        </group>
      ))}

      {state.explode > 0.25 && (
        <Html position={[1.58, 0, 0]} center distanceFactor={9.5}>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-[#2B5B84] bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-[#1E3A5F] shadow-xs">
            4. Image Sensor {state.cue === 'events' ? '(Event DVS)' : '(CMOS)'}
          </div>
        </Html>
      )}
    </group>
  );
}

function CutawayHousing({
  state,
  yOffset,
  onSelect,
}: {
  state: SensorSimState;
  yOffset: number;
  onSelect: () => void;
}) {
  const isSelected = state.selectedComponent === 'housing';
  const bodyColor = isSelected ? '#C5DCF0' : '#DDE2E8';
  const frameColor = isSelected ? '#9CC1E2' : '#C7D0DA';
  const edgeColor = isSelected ? '#2B5B84' : '#7B8A9C';
  const edgeOpacity = isSelected ? 0.65 : 0.28;

  return (
    <group
      position={[0, yOffset, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Chamfered machined aluminum base plinth */}
      <RoundedBox
        args={[2.76, 0.16, 2.76]}
        radius={0.035}
        smoothness={4}
        position={[0, -1.08, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color={bodyColor} roughness={0.38} metalness={0.28} />
        <Edges threshold={18} color={edgeColor} transparent opacity={edgeOpacity} />
      </RoundedBox>

      {/* Subtle recessed elastomer floor feet */}
      {[
        [-1.12, -1.12],
        [1.12, -1.12],
        [-1.12, 1.12],
        [1.12, 1.12],
      ].map(([fx, fz], idx) => (
        <mesh key={idx} position={[fx, -1.18, fz]}>
          <cylinderGeometry args={[0.12, 0.13, 0.04, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.75} />
        </mesh>
      ))}

      {/* Back wall (semi-translucent architectural cutaway) */}
      <RoundedBox
        args={[2.68, 2.12, 0.11]}
        radius={0.025}
        smoothness={3}
        position={[0, -0.01, -1.31]}
      >
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.42}
          metalness={0.22}
          transparent
          opacity={0.76}
        />
        <Edges threshold={18} color={edgeColor} transparent opacity={edgeOpacity} />
      </RoundedBox>

      {/* Four chamfered corner structural pillars */}
      {[
        [-1.29, -1.29],
        [1.29, -1.29],
        [-1.29, 1.29],
        [1.29, 1.29],
      ].map(([px, pz], idx) => (
        <RoundedBox
          key={idx}
          args={[0.17, 2.16, 0.17]}
          radius={0.028}
          smoothness={3}
          position={[px, 0, pz]}
          castShadow
        >
          <meshStandardMaterial color={frameColor} roughness={0.34} metalness={0.34} />
          <Edges threshold={18} color={edgeColor} transparent opacity={edgeOpacity} />
        </RoundedBox>
      ))}

      {/* Top machined bezel rails */}
      {[
        [0, 1.055, -1.29, 2.75, 0.105, 0.17],
        [0, 1.055, 1.29, 2.75, 0.105, 0.17],
        [-1.29, 1.055, 0, 0.17, 0.105, 2.42],
        [1.29, 1.055, 0, 0.17, 0.105, 2.42],
      ].map(([x, y, z, w, h, d], idx) => (
        <RoundedBox
          key={idx}
          args={[w, h, d]}
          radius={0.024}
          smoothness={3}
          position={[x, y, z]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={frameColor} roughness={0.32} metalness={0.34} />
          <Edges threshold={18} color={edgeColor} transparent opacity={edgeOpacity} />
        </RoundedBox>
      ))}

      {/* Four countersunk hex socket cap screws in top bezel corners */}
      {[
        [-1.29, -1.29],
        [1.29, -1.29],
        [-1.29, 1.29],
        [1.29, 1.29],
      ].map(([sx, sz], idx) => (
        <group key={idx} position={[sx, 1.11, sz]}>
          <mesh>
            <cylinderGeometry args={[0.044, 0.044, 0.014, 20]} />
            <meshStandardMaterial color="#8A99AA" metalness={0.68} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.006, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.008, 6]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SensorAssembly({ state, onSelectComponent }: TactileSensor3DProps) {
  const e = state.explode;
  const elastomerY = 1.05 + e * 0.72;
  const illumY = 0.44 + e * 0.25;
  const opticsY = -0.22 - e * 0.12;
  const sensorY = -0.82 - e * 0.55;
  const housingY = -0.02 - e * 0.35;

  return (
    <group position={[0, -0.14, 0]}>
      <IndenterMesh state={state} yBase={elastomerY} />
      <DeformableElastomer
        state={state}
        yOffset={elastomerY}
        onSelect={() => onSelectComponent('elastomer')}
      />
      <IlluminationSystem
        state={state}
        yOffset={illumY}
        onSelect={() => onSelectComponent('illumination')}
      />
      <ImagingOptics
        state={state}
        yOffset={opticsY}
        onSelect={() => onSelectComponent('optics')}
      />
      <ImageSensorBoard
        state={state}
        yOffset={sensorY}
        onSelect={() => onSelectComponent('sensor')}
      />
      <CutawayHousing
        state={state}
        yOffset={housingY}
        onSelect={() => onSelectComponent('housing')}
      />
    </group>
  );
}

export function TactileSensor3D({ state, onSelectComponent }: TactileSensor3DProps) {
  return (
    <div
      className={`relative h-[435px] w-full overflow-hidden rounded-xl border transition-colors ${
        state.darkBench
          ? 'border-slate-700 bg-[#0D1420]'
          : 'border-slate-200/90 bg-gradient-to-b from-[#FAF8F4] to-[#F1EEE7]'
      }`}
    >
      <Canvas
        camera={{ position: [4.2, 2.85, 4.65], fov: 31 }}
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: state.darkBench ? 1.02 : 1.08,
        }}
      >
        <color attach="background" args={[state.darkBench ? '#0D1420' : '#F6F4EF']} />

        {/* Soft calibrated studio lighting matching warm editorial page */}
        <hemisphereLight
          args={[
            state.darkBench ? '#C8DCF0' : '#FFFDF9',
            state.darkBench ? '#162032' : '#E6E1D7',
            state.darkBench ? 0.55 : 0.95,
          ]}
        />
        <directionalLight
          position={[4.5, 8.5, 5.5]}
          intensity={state.darkBench ? 1.15 : 1.05}
          color="#FFFDF8"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0004}
        />
        <directionalLight
          position={[-5, 4, -4]}
          intensity={state.darkBench ? 0.48 : 0.55}
          color="#D6EAFA"
        />
        <directionalLight
          position={[5, 2.5, -5]}
          intensity={state.darkBench ? 0.35 : 0.38}
          color="#FDEBD0"
        />

        {/* Procedural offline-safe softbox studio environment */}
        <Environment resolution={256}>
          <Lightformer
            form="rect"
            intensity={state.darkBench ? 1.25 : 2.6}
            position={[0, 7, 1.5]}
            scale={[10, 6, 1]}
            rotation={[Math.PI / 2, 0, 0]}
            color="#FFFDF9"
          />
          <Lightformer
            form="ring"
            intensity={state.darkBench ? 0.9 : 1.4}
            position={[0, 5.5, 0]}
            scale={4}
            rotation={[Math.PI / 2, 0, 0]}
            color="#FFFFFF"
          />
          <Lightformer
            form="rect"
            intensity={state.darkBench ? 0.85 : 1.4}
            position={[-6.5, 2.5, 3]}
            scale={[6, 4.5, 1]}
            rotation={[0, Math.PI / 2, 0]}
            color="#DCEEFF"
          />
          <Lightformer
            form="rect"
            intensity={state.darkBench ? 0.65 : 1.15}
            position={[6.5, 2.5, -2.5]}
            scale={[6, 4.5, 1]}
            rotation={[0, -Math.PI / 2, 0]}
            color="#F9E7C9"
          />
          {/* Soft floor bounce so aluminum undersides stay clean and bright */}
          <Lightformer
            form="rect"
            intensity={state.darkBench ? 0.25 : 0.95}
            position={[0, -4, 0]}
            scale={[12, 12, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
            color={state.darkBench ? '#1E293B' : '#EFECE6'}
          />
        </Environment>

        <SensorAssembly state={state} onSelectComponent={onSelectComponent} />

        <ContactShadows
          position={[0, -1.42 - state.explode * 0.35, 0]}
          opacity={state.darkBench ? 0.42 : 0.22}
          scale={7.5}
          blur={2.8}
          far={4}
          color={state.darkBench ? '#020617' : '#3B4856'}
        />

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          minDistance={3.4}
          maxDistance={9.0}
          maxPolarAngle={Math.PI * 0.62}
        />
      </Canvas>

      {/* Subtle editorial overlay hint */}
      <div
        className={`pointer-events-none absolute bottom-3 left-3 rounded-lg border px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm ${
          state.darkBench
            ? 'border-slate-700/80 bg-slate-900/75 text-slate-300'
            : 'border-slate-200/80 bg-white/85 text-slate-600 shadow-2xs'
        }`}
      >
        Drag to orbit · Scroll to zoom · Click any layer to inspect
      </div>
    </div>
  );
}
