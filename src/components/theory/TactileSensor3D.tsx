import { useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
  Edges,
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
}

interface TactileSensor3DProps {
  state: SensorSimState;
  onSelectComponent: (id: ComponentId) => void;
}

interface CalloutMeta {
  id: ComponentId;
  num: number;
  label: string;
  accent: string;
  badgeBg: string;
}

interface CalloutRefs {
  paths: Record<ComponentId, SVGPathElement | null>;
  dots: Record<ComponentId, SVGCircleElement | null>;
  halos: Record<ComponentId, SVGCircleElement | null>;
  labels: Record<ComponentId, HTMLButtonElement | null>;
}

// Compute shared exploded vertical offsets for both 3D geometry and screen-right callout anchors
function computeLayerOffsets(explode: number) {
  return {
    assemblyY: -0.2 - explode * 0.14,
    elastomerY: 1.05 + explode * 0.62,
    illumY: 0.42 + explode * 0.2,
    opticsY: -0.22 - explode * 0.1,
    sensorY: -0.82 - explode * 0.44,
    housingY: -0.02 - explode * 0.28,
  };
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
    </group>
  );
}

function IndenterMesh({ state, yBase }: { state: SensorSimState; yBase: number }) {
  const { normalForce, shearX, shearY, twist, stiffnessKPa, indenter, explode } = state;
  const compliance = 110 / Math.max(stiffnessKPa, 25);
  const pressDrop = Math.min(0.4, (normalForce / 10) * 0.3 * Math.pow(compliance, 0.55));
  const posX = shearX * 0.35;
  const posZ = shearY * 0.35;
  const liftY = yBase + 0.5 - pressDrop + explode * 0.42;

  return (
    <group position={[posX, liftY, posZ]} rotation={[0, -twist * 0.6, 0]}>
      {indenter === 'sphere' && (
        <group>
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
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.48, 0.52, 0.03, 40]} />
            <meshStandardMaterial color="#D8AA6A" metalness={0.5} roughness={0.24} />
          </mesh>
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

            {/* 5 discrete micro-SMD LED diodes */}
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
          </group>
        );
      })}
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
      {stereo && (
        <RoundedBox args={[1.38, 0.09, 0.38]} radius={0.02} smoothness={3} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#8A99AA" metalness={0.5} roughness={0.32} />
          <Edges threshold={18} color="#475569" transparent opacity={0.35} />
        </RoundedBox>
      )}

      {offsets.map((ox, i) => (
        <group key={i} position={[ox, 0, 0]}>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.12, 36]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.36} />
          </mesh>

          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.33, 0.29, 0.28, 40]} />
            <meshStandardMaterial
              color={isSelected ? '#3B6EA5' : '#4A596B'}
              metalness={0.55}
              roughness={0.28}
            />
          </mesh>

          {[-0.04, 0.04, 0.11].map((ry, k) => (
            <mesh key={k} position={[0, ry, 0]}>
              <torusGeometry args={[0.315 + k * 0.008, 0.012, 12, 40]} />
              <meshStandardMaterial color="#273240" metalness={0.65} roughness={0.32} />
            </mesh>
          ))}

          <mesh position={[0, 0.175, 0]}>
            <cylinderGeometry args={[0.335, 0.335, 0.045, 40]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.62} roughness={0.22} />
          </mesh>

          <mesh position={[0, 0.198, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.16, 0.29, 36]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} />
          </mesh>

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
        </group>
      ))}
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

      <mesh position={[0, 0.055, -pcbD / 2 + 0.09]}>
        <boxGeometry args={[0.52, 0.045, 0.1]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.042, -pcbD / 2 - 0.16]}>
        <boxGeometry args={[0.42, 0.012, 0.38]} />
        <meshStandardMaterial color="#C07D42" metalness={0.25} roughness={0.38} />
      </mesh>

      {offsets.map((ox, i) => (
        <group key={i} position={[ox, 0.068, 0]}>
          <RoundedBox args={[0.58, 0.058, 0.58]} radius={0.014} smoothness={2}>
            <meshStandardMaterial color="#182232" roughness={0.32} metalness={0.22} />
            <Edges threshold={18} color="#475569" transparent opacity={0.4} />
          </RoundedBox>
          <mesh position={[0, 0.031, 0]}>
            <boxGeometry args={[0.45, 0.008, 0.45]} />
            <meshStandardMaterial color="#D4A754" metalness={0.78} roughness={0.24} />
          </mesh>
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

// Projects 3D part anchors into 2D screen space at 60fps and updates screen-right leader lines & pills directly
function ScreenRightCalloutProjector({
  state,
  calloutRefs,
}: {
  state: SensorSimState;
  calloutRefs: MutableRefObject<CalloutRefs>;
}) {
  const { camera, size } = useThree();
  const camRight = useMemo(() => new THREE.Vector3(), []);
  const projVec = useMemo(() => new THREE.Vector3(), []);
  const lastShiftRef = useRef('');

  useFrame(() => {
    // Camera-invariant screen-space left shift when exploded so right-hand callout rail stays clear at any orbit angle
    const targetShiftPx = state.explode > 0.12 ? Math.round(size.width * 0.115) : 0;
    const shiftKey = `${targetShiftPx}x${size.width}x${size.height}`;
    if (
      camera instanceof THREE.PerspectiveCamera &&
      lastShiftRef.current !== shiftKey
    ) {
      lastShiftRef.current = shiftKey;
      if (targetShiftPx > 0) {
        camera.setViewOffset(size.width, size.height, targetShiftPx, 0, size.width, size.height);
      } else {
        camera.clearViewOffset();
      }
      camera.updateProjectionMatrix();
    }

    if (state.explode <= 0.12) return;

    const { assemblyY, elastomerY, illumY, opticsY, sensorY, housingY } = computeLayerOffsets(
      state.explode
    );
    const padH = 0.16 + (state.padThickness / 6) * 0.22;
    const stereo = state.cue === 'multiview';

    // Camera-right unit vector projected onto the horizontal XZ plane so anchor points always attach
    // to whichever side of each 3D part faces the right edge of the screen
    camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
    camRight.y = 0;
    if (camRight.lengthSq() < 1e-4) camRight.set(1, 0, 0);
    camRight.normalize();

    // Pick whichever LED bar is closest to screen-right
    const ledPositions: [number, number][] = [
      [-1.13, 0],
      [1.13, 0],
      [0, -1.13],
      [0, 1.13],
    ];
    let bestLed = ledPositions[1];
    let bestDot = -Infinity;
    for (const lp of ledPositions) {
      const d = lp[0] * camRight.x + lp[1] * camRight.z;
      if (d > bestDot) {
        bestDot = d;
        bestLed = lp;
      }
    }

    // Pick whichever stereo lens is closest to screen-right
    const lensCenterX = stereo ? (camRight.x >= 0 ? 0.52 : -0.52) : 0;

    // Physical 3D world-space anchor points for each component
    const anchors: Record<ComponentId, [number, number, number]> = {
      elastomer: [
        camRight.x * 1.16,
        assemblyY + elastomerY - padH * 0.45,
        camRight.z * 1.16,
      ],
      illumination: [bestLed[0], assemblyY + illumY, bestLed[1]],
      optics: [
        lensCenterX + camRight.x * 0.34,
        assemblyY + opticsY + 0.04,
        camRight.z * 0.34,
      ],
      sensor: [
        camRight.x * (stereo ? 0.96 : 0.62),
        assemblyY + sensorY + 0.04,
        camRight.z * 0.62,
      ],
      housing: [
        camRight.x * 1.32,
        assemblyY + housingY - 1.06,
        camRight.z * 1.32,
      ],
    };

    const ids: ComponentId[] = ['elastomer', 'illumination', 'optics', 'sensor', 'housing'];
    const projected = ids.map((id) => {
      const [wx, wy, wz] = anchors[id];
      projVec.set(wx, wy, wz).project(camera);
      const ax = (projVec.x * 0.5 + 0.5) * size.width;
      const ay = (-projVec.y * 0.5 + 0.5) * size.height;
      return { id, ax, ay, ly: ay };
    });

    // Sort by projected screen Y so leader lines never cross regardless of viewpoint
    projected.sort((a, b) => a.ay - b.ay);

    // Enforce clean vertical spacing on the right rail within viewport margins
    const minTop = 28;
    const maxBottom = size.height - 46;
    const minGap = 40;
    for (let i = 0; i < projected.length; i++) {
      projected[i].ly = Math.max(minTop, Math.min(maxBottom, projected[i].ay));
      if (i > 0 && projected[i].ly - projected[i - 1].ly < minGap) {
        projected[i].ly = projected[i - 1].ly + minGap;
      }
    }
    if (projected[projected.length - 1].ly > maxBottom) {
      projected[projected.length - 1].ly = maxBottom;
      for (let i = projected.length - 2; i >= 0; i--) {
        if (projected[i + 1].ly - projected[i].ly < minGap) {
          projected[i].ly = projected[i + 1].ly - minGap;
        }
      }
    }

    const rightMargin = 14;
    for (const item of projected) {
      const labelEl = calloutRefs.current.labels[item.id];
      const pathEl = calloutRefs.current.paths[item.id];
      const dotEl = calloutRefs.current.dots[item.id];
      const haloEl = calloutRefs.current.halos[item.id];

      const labelWidth = labelEl ? labelEl.offsetWidth : 168;
      const labelLeftX = size.width - rightMargin - labelWidth;

      if (labelEl) {
        labelEl.style.transform = `translate3d(0, ${(item.ly - labelEl.offsetHeight / 2).toFixed(1)}px, 0)`;
      }

      if (dotEl) {
        dotEl.setAttribute('cx', item.ax.toFixed(1));
        dotEl.setAttribute('cy', item.ay.toFixed(1));
      }
      if (haloEl) {
        haloEl.setAttribute('cx', item.ax.toFixed(1));
        haloEl.setAttribute('cy', item.ay.toFixed(1));
      }

      if (pathEl) {
        // Crisp CAD elbow leader line: anchor -> angled knee -> horizontal landing into label left edge
        const dy = Math.abs(item.ly - item.ay);
        const kneeRoom = Math.max(14, Math.min(34, dy * 0.45 + 14));
        const kneeX = Math.max(item.ax + 10, Math.min(labelLeftX - 12, labelLeftX - kneeRoom));
        const d =
          item.ax < labelLeftX - 12
            ? `M ${item.ax.toFixed(1)} ${item.ay.toFixed(1)} L ${kneeX.toFixed(1)} ${item.ly.toFixed(1)} L ${labelLeftX.toFixed(1)} ${item.ly.toFixed(1)}`
            : `M ${item.ax.toFixed(1)} ${item.ay.toFixed(1)} L ${labelLeftX.toFixed(1)} ${item.ly.toFixed(1)}`;
        pathEl.setAttribute('d', d);
      }
    }
  });

  return null;
}

function SensorAssembly({ state, onSelectComponent }: TactileSensor3DProps) {
  const { assemblyY, elastomerY, illumY, opticsY, sensorY, housingY } = computeLayerOffsets(
    state.explode
  );

  return (
    <group position={[0, assemblyY, 0]}>
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
  const calloutRefs = useRef<CalloutRefs>({
    paths: { elastomer: null, illumination: null, optics: null, sensor: null, housing: null },
    dots: { elastomer: null, illumination: null, optics: null, sensor: null, housing: null },
    halos: { elastomer: null, illumination: null, optics: null, sensor: null, housing: null },
    labels: { elastomer: null, illumination: null, optics: null, sensor: null, housing: null },
  });

  const showCallouts = state.explode > 0.12;
  const stereo = state.cue === 'multiview';

  const callouts: CalloutMeta[] = [
    {
      id: 'elastomer',
      num: 1,
      label: 'Deformable Elastomer',
      accent: '#2B5B84',
      badgeBg: '#E6F1FA',
    },
    {
      id: 'illumination',
      num: 2,
      label: 'Illumination System',
      accent: '#B45309',
      badgeBg: '#FEF3C7',
    },
    {
      id: 'optics',
      num: 3,
      label: stereo ? 'Imaging Optics (Stereo)' : 'Imaging Optics',
      accent: '#475569',
      badgeBg: '#F1F5F9',
    },
    {
      id: 'sensor',
      num: 4,
      label: state.cue === 'events' ? 'Image Sensor (DVS)' : 'Image Sensor (CMOS)',
      accent: '#1E3A5F',
      badgeBg: '#E8EFF8',
    },
    {
      id: 'housing',
      num: 5,
      label: 'Cutaway Housing',
      accent: '#64748B',
      badgeBg: '#F1F5F9',
    },
  ];

  return (
    <div
      className={`relative h-[435px] w-full overflow-hidden rounded-xl border transition-colors ${
        state.darkBench
          ? 'border-slate-700 bg-[#0D1420]'
          : 'border-slate-200/90 bg-gradient-to-b from-[#FAF8F4] to-[#F1EEE7]'
      }`}
    >
      <Canvas
        camera={{ position: [4.65, 3.05, 5.1], fov: 31 }}
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
        <ScreenRightCalloutProjector state={state} calloutRefs={calloutRefs} />

        <ContactShadows
          position={[0, -1.48 - state.explode * 0.42, 0]}
          opacity={state.darkBench ? 0.42 : 0.22}
          scale={7.8}
          blur={2.8}
          far={4.5}
          color={state.darkBench ? '#020617' : '#3B4856'}
        />

        <OrbitControls
          target={[0, -0.06, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          minDistance={3.8}
          maxDistance={9.8}
          maxPolarAngle={Math.PI * 0.62}
        />
      </Canvas>

      {/* Camera-invariant screen-right architectural leader lines & clickable labels (Explode View) */}
      {showCallouts && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 h-full w-full">
            {callouts.map((c) => {
              const isSelected = state.selectedComponent === c.id;
              const strokeCol = isSelected
                ? c.accent
                : state.darkBench
                ? '#94A3B8'
                : '#64748B';
              return (
                <g key={c.id}>
                  <path
                    ref={(el) => {
                      calloutRefs.current.paths[c.id] = el;
                    }}
                    fill="none"
                    stroke={strokeCol}
                    strokeWidth={isSelected ? 1.8 : 1.15}
                    strokeOpacity={isSelected ? 0.95 : 0.65}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    ref={(el) => {
                      calloutRefs.current.halos[c.id] = el;
                    }}
                    r={isSelected ? 6 : 4.5}
                    fill={state.darkBench ? '#0D1420' : '#FFFFFF'}
                    fillOpacity={0.85}
                  />
                  <circle
                    ref={(el) => {
                      calloutRefs.current.dots[c.id] = el;
                    }}
                    r={isSelected ? 3.5 : 2.6}
                    fill={isSelected ? c.accent : strokeCol}
                  />
                </g>
              );
            })}
          </svg>

          {callouts.map((c) => {
            const isSelected = state.selectedComponent === c.id;
            return (
              <button
                key={c.id}
                ref={(el) => {
                  calloutRefs.current.labels[c.id] = el;
                }}
                type="button"
                onClick={() => onSelectComponent(c.id)}
                style={{
                  borderColor: isSelected ? c.accent : undefined,
                }}
                className={`pointer-events-auto absolute right-[14px] top-0 flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-2 py-1 text-[11px] font-semibold shadow-xs backdrop-blur-md transition-colors ${
                  state.darkBench
                    ? isSelected
                      ? 'bg-slate-900/95 text-white'
                      : 'border-slate-700/90 bg-slate-900/85 text-slate-200 hover:border-slate-500'
                    : isSelected
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'border-slate-200/90 bg-white/92 text-slate-700 hover:border-slate-400'
                }`}
              >
                <span
                  style={{
                    backgroundColor: isSelected ? c.accent : c.badgeBg,
                    color: isSelected ? '#FFFFFF' : c.accent,
                  }}
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold"
                >
                  {c.num}
                </span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      )}

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
