import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows, Environment, Lightformer } from '@react-three/drei';
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
  // Soft elastomer indents deeper; scaled nicely to 3D scene units (pad is 2.4 x 2.4 units)
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
    // Sharp ridge / wedge indentation
    const along = Math.abs(rx * 0.85 + rz * 0.52);
    const across = Math.abs(-rx * 0.52 + rz * 0.85);
    if (along < 0.85 && across < 0.42) {
      const ridge = Math.max(0, 1 - across / 0.42);
      const endFade = Math.max(0, 1 - Math.pow(along / 0.85, 4));
      dy = -depthScale * 1.12 * Math.pow(ridge, 1.15) * endFade;
    }
  } else if (indenter === 'texture') {
    // Coin / woven fabric micro-ribs inside circular patch
    const rad = 0.82;
    if (r < rad) {
      const env = Math.pow(1 - (r * r) / (rad * rad), 0.9);
      const ribs = 0.72 + 0.28 * Math.cos(rx * 22.0) * Math.cos(rz * 22.0);
      dy = -depthScale * 0.9 * env * ribs;
    }
  } else {
    // Soft deformable object flattens wider and shallower
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
    // High-res deformable top sheet
    const g = new THREE.PlaneGeometry(2.36, 2.36, 48, 48);
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
        tempObj.position.set(mx + dx, dy - padH * 0.35, mz + dz);
        const s = state.cue === 'marker' || state.cue === 'events' ? 1.15 : 0.72;
        tempObj.scale.set(s, s, s);
        tempObj.updateMatrix();
        markersRef.current!.setMatrixAt(idx, tempObj.matrix);

        if (state.cue === 'events') {
          tempCol.set(stress > 0.25 ? '#F59E0B' : '#38BDF8');
        } else if (stress > 0.45) {
          tempCol.set('#E07A2F');
        } else {
          tempCol.set('#1E293B');
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
      {/* Clear elastomer slab volume */}
      <mesh position={[0, -padH / 2 - 0.02, 0]}>
        <boxGeometry args={[2.38, padH, 2.38]} />
        <meshPhysicalMaterial
          color={isSelected ? '#60A5FA' : '#8EC5E8'}
          transparent
          opacity={state.cue === 'shading' ? 0.52 : 0.4}
          roughness={0.18}
          transmission={0.35}
          thickness={0.4}
        />
      </mesh>

      {/* Deforming upper contact surface */}
      <mesh ref={meshRef} geometry={baseGeo} position={[0, 0.01, 0]}>
        <meshStandardMaterial
          color={
            state.cue === 'shading'
              ? '#CBD5E1'
              : isSelected
              ? '#38BDF8'
              : '#7CC2E8'
          }
          roughness={state.cue === 'shading' ? 0.42 : 0.22}
          metalness={state.cue === 'shading' ? 0.28 : 0.05}
          transparent={state.cue !== 'shading'}
          opacity={state.cue === 'shading' ? 0.94 : 0.72}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Embedded markers / internal pins (InstancedMesh for single draw call) */}
      <instancedMesh
        ref={markersRef}
        args={[undefined, undefined, markerCoords.length]}
        visible={state.cue !== 'shading'}
      >
        <sphereGeometry args={[0.036, 12, 12]} />
        <meshStandardMaterial roughness={0.35} />
      </instancedMesh>

      {/* Rigid clear acrylic backing window underneath elastomer */}
      <mesh position={[0, -padH - 0.06, 0]}>
        <boxGeometry args={[2.44, 0.08, 2.44]} />
        <meshPhysicalMaterial
          color="#E2E8F0"
          transparent
          opacity={0.42}
          roughness={0.08}
        />
      </mesh>

      {state.explode > 0.25 && (
        <Html position={[1.55, 0, 0]} center distanceFactor={9}>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-[#6BB3DF] bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-[#1E3A5F] shadow-sm">
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
  const liftY = yBase + 0.52 - pressDrop + explode * 0.55;

  return (
    <group position={[posX, liftY, posZ]} rotation={[0, -twist * 0.6, 0]}>
      {indenter === 'sphere' && (
        <mesh castShadow>
          <sphereGeometry args={[0.52, 32, 32]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.65} roughness={0.22} />
        </mesh>
      )}
      {indenter === 'edge' && (
        <mesh rotation={[0, Math.PI / 6, Math.PI]} position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.06, 0.65, 4]} />
          <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.28} />
        </mesh>
      )}
      {indenter === 'texture' && (
        <group position={[0, -0.25, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.62, 0.62, 0.28, 32]} />
            <meshStandardMaterial color="#B45309" metalness={0.55} roughness={0.32} />
          </mesh>
          {[-0.35, -0.18, 0, 0.18, 0.35].map((off, i) => (
            <mesh key={i} position={[off, -0.15, 0]}>
              <boxGeometry args={[0.04, 0.04, 0.85]} />
              <meshStandardMaterial color="#D97706" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}
      {indenter === 'soft' && (
        <mesh scale={[1.15, 0.68 - pressDrop * 0.25, 1.15]} castShadow>
          <sphereGeometry args={[0.56, 32, 32]} />
          <meshStandardMaterial color="#F472B6" roughness={0.65} metalness={0.05} />
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
      ? ['#EF4444', '#22C55E', '#3B82F6', '#F59E0B']
      : ['#FBBF24', '#FBBF24', '#FBBF24', '#FBBF24'];

  const positions: [number, number, number, number][] = [
    [-1.12, 0, 0, 0],
    [1.12, 0, 0, Math.PI],
    [0, 0, -1.12, Math.PI / 2],
    [0, 0, 1.12, -Math.PI / 2],
  ];

  return (
    <group
      position={[0, yOffset, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {positions.map(([px, py, pz, rotY], i) => (
        <group key={i} position={[px, py, pz]} rotation={[0, rotY, 0]}>
          <mesh>
            <boxGeometry args={[0.14, 0.34, 0.72]} />
            <meshStandardMaterial
              color={isSelected ? '#F59E0B' : '#334155'}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <boxGeometry args={[0.04, 0.24, 0.56]} />
            <meshStandardMaterial
              color={ledColors[i]}
              emissive={ledColors[i]}
              emissiveIntensity={isSelected ? 2.4 : 1.4}
            />
          </mesh>
          {state.showRays && (
            <mesh position={[0.52, 0.22, 0]} rotation={[0, 0, -1.18]}>
              <coneGeometry args={[0.38, 0.95, 16, 1, true]} />
              <meshBasicMaterial
                color={ledColors[i]}
                transparent
                opacity={state.darkBench ? 0.2 : 0.14}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      ))}
      {state.explode > 0.25 && (
        <Html position={[1.65, 0, 0]} center distanceFactor={9}>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-amber-500 bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-amber-800 shadow-sm">
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
      {offsets.map((ox, i) => (
        <group key={i} position={[ox, 0, 0]}>
          {/* Lens barrel */}
          <mesh>
            <cylinderGeometry args={[0.34, 0.3, 0.36, 32]} />
            <meshStandardMaterial
              color={isSelected ? '#3B82F6' : '#475569'}
              metalness={0.6}
              roughness={0.28}
            />
          </mesh>
          {/* Optical glass element */}
          <mesh position={[0, 0.19, 0]}>
            <sphereGeometry args={[0.26, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            <meshPhysicalMaterial
              color="#93C5FD"
              transparent
              opacity={0.78}
              roughness={0.06}
              metalness={0.1}
            />
          </mesh>
          {/* Optical viewing cone up to elastomer */}
          {state.showRays && (
            <mesh position={[0, 0.72, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[stereo ? 0.65 : 0.92, 1.15, 24, 1, true]} />
              <meshBasicMaterial
                color={stereo ? (i === 0 ? '#38BDF8' : '#A855F7') : '#F97316'}
                transparent
                opacity={state.darkBench ? 0.14 : 0.09}
                wireframe
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      ))}
      {state.explode > 0.25 && (
        <Html position={[1.55, 0, 0]} center distanceFactor={9}>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-slate-500 bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm">
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

  return (
    <group
      position={[0, yOffset, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Green/slate PCB */}
      <mesh>
        <boxGeometry args={[stereo ? 1.85 : 1.15, 0.09, 1.15]} />
        <meshStandardMaterial
          color={isSelected ? '#2563EB' : '#1E3A5F'}
          roughness={0.45}
          metalness={0.2}
        />
      </mesh>
      {offsets.map((ox, i) => (
        <group key={i} position={[ox, 0.07, 0]}>
          {/* Ceramic package */}
          <mesh>
            <boxGeometry args={[0.56, 0.06, 0.56]} />
            <meshStandardMaterial color="#0F172A" roughness={0.3} />
          </mesh>
          {/* Active pixel die */}
          <mesh position={[0, 0.035, 0]}>
            <boxGeometry args={[0.38, 0.015, 0.38]} />
            <meshStandardMaterial
              color={state.cue === 'events' ? '#06B6D4' : '#38BDF8'}
              emissive={state.cue === 'events' ? '#0891B2' : '#0284C7'}
              emissiveIntensity={0.6}
              metalness={0.75}
              roughness={0.15}
            />
          </mesh>
        </group>
      ))}
      {state.explode > 0.25 && (
        <Html position={[1.55, 0, 0]} center distanceFactor={9}>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-[#2B5B84] bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-[#1E3A5F] shadow-sm">
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
  const wallColor = isSelected ? '#93C5FD' : '#CBD5E1';
  const trimColor = isSelected ? '#3B82F6' : '#94A3B8';

  return (
    <group
      position={[0, yOffset, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Base plate */}
      <mesh position={[0, -1.08, 0]} receiveShadow>
        <boxGeometry args={[2.76, 0.16, 2.76]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.25} />
      </mesh>
      {/* Back wall (open front for cutaway clarity) */}
      <mesh position={[0, 0, -1.3]}>
        <boxGeometry args={[2.76, 2.15, 0.14]} />
        <meshStandardMaterial color={wallColor} roughness={0.55} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      {/* Four vertical corner pillars */}
      {[
        [-1.28, -1.28],
        [1.28, -1.28],
        [-1.28, 1.28],
        [1.28, 1.28],
      ].map(([px, pz], idx) => (
        <mesh key={idx} position={[px, 0, pz]}>
          <boxGeometry args={[0.18, 2.15, 0.18]} />
          <meshStandardMaterial color={trimColor} roughness={0.4} metalness={0.35} />
        </mesh>
      ))}
      {/* Top frame bezel */}
      {[
        [0, 1.06, -1.28, 2.74, 0.1, 0.18],
        [0, 1.06, 1.28, 2.74, 0.1, 0.18],
        [-1.28, 1.06, 0, 0.18, 0.1, 2.38],
        [1.28, 1.06, 0, 0.18, 0.1, 2.38],
      ].map(([x, y, z, w, h, d], idx) => (
        <mesh key={idx} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={trimColor} roughness={0.38} metalness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function SensorAssembly({ state, onSelectComponent }: TactileSensor3DProps) {
  const e = state.explode;
  const elastomerY = 1.05 + e * 0.72;
  const illumY = 0.42 + e * 0.25;
  const opticsY = -0.22 - e * 0.12;
  const sensorY = -0.82 - e * 0.55;
  const housingY = -0.02 - e * 0.35;

  return (
    <group position={[0, -0.15, 0]}>
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
      className={`relative h-[420px] w-full overflow-hidden rounded-xl border transition-colors ${
        state.darkBench
          ? 'border-slate-700 bg-[#0F172A]'
          : 'border-slate-200 bg-gradient-to-b from-[#F4F7FA] to-[#E8EEF5]'
      }`}
    >
      <Canvas camera={{ position: [3.6, 2.7, 4.1], fov: 38 }} shadows dpr={[1, 2]}>
        <color attach="background" args={[state.darkBench ? '#0F172A' : '#F3F6FA']} />
        <ambientLight intensity={state.darkBench ? 0.55 : 0.85} />
        <directionalLight position={[5, 8, 6]} intensity={1.25} castShadow />
        <directionalLight position={[-4, 3, -5]} intensity={0.45} color="#BAE6FD" />
        <Environment resolution={256}>
          <Lightformer
            form="rect"
            intensity={state.darkBench ? 1.4 : 2.2}
            position={[0, 6, 2]}
            scale={[10, 5, 1]}
            rotation={[Math.PI / 2, 0, 0]}
            color="#FFFFFF"
          />
          <Lightformer
            form="rect"
            intensity={state.darkBench ? 0.9 : 1.3}
            position={[-6, 2, 3]}
            scale={[6, 4, 1]}
            rotation={[0, Math.PI / 2, 0]}
            color="#BAE6FD"
          />
          <Lightformer
            form="rect"
            intensity={state.darkBench ? 0.7 : 1.0}
            position={[6, 2, -3]}
            scale={[6, 4, 1]}
            rotation={[0, -Math.PI / 2, 0]}
            color="#FDE68A"
          />
        </Environment>

        <SensorAssembly state={state} onSelectComponent={onSelectComponent} />

        <ContactShadows
          position={[0, -1.65 - state.explode * 0.35, 0]}
          opacity={state.darkBench ? 0.45 : 0.25}
          scale={8}
          blur={2.4}
        />
        <OrbitControls
          enablePan={false}
          minDistance={3.0}
          maxDistance={8.5}
          maxPolarAngle={Math.PI * 0.62}
        />
      </Canvas>

      {/* Overlay hint */}
      <div
        className={`pointer-events-none absolute bottom-3 left-3 rounded-lg px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm ${
          state.darkBench
            ? 'bg-slate-900/75 text-slate-300'
            : 'bg-white/85 text-slate-600 shadow-xs'
        }`}
      >
        Drag to orbit · Scroll to zoom · Click any layer to inspect
      </div>
    </div>
  );
}
