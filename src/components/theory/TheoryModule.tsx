import { useState } from 'react';
import { Layers, Sun, Moon, Sparkles, Sliders, RotateCcw } from 'lucide-react';
import {
  SENSOR_COMPONENTS,
  OPTICAL_CUES,
  WORKING_STEPS,
  type ComponentId,
  type OpticalCueId,
} from '../../data/opticalCues';
import { TactileSensor3D, type IndenterShape, type SensorSimState } from './TactileSensor3D';
import { SimulatedCameraCanvas } from './SimulatedCameraCanvas';
import { ContactMechanicsLab } from './ContactMechanicsLab';

const INITIAL_STATE: SensorSimState = {
  normalForce: 5.0,
  shearX: 0.25,
  shearY: 0.0,
  twist: 0.0,
  stiffnessKPa: 110,
  padThickness: 3.0,
  indenter: 'sphere',
  cue: 'shading',
  explode: 0.0,
  selectedComponent: 'elastomer',
  darkBench: false,
};

export function TheoryModule() {
  const [sim, setSim] = useState<SensorSimState>(INITIAL_STATE);

  const activeCue = OPTICAL_CUES.find((c) => c.id === sim.cue)!;
  const activeComponent = SENSOR_COMPONENTS.find((c) => c.id === sim.selectedComponent) ?? SENSOR_COMPONENTS[0];

  const update = <K extends keyof SensorSimState>(key: K, value: SensorSimState[K]) => {
    setSim((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section id="theory" className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F1F8] px-3 py-1 text-xs font-semibold text-[#2B5B84]">
            Section 2 · Fig. 2 &amp; Tables 1–2
          </span>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
            Interactive Tactile Sight Theory Workbench
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Explore how a vision-based tactile sensor turns physical contact into optical observations: explode the 3D architecture, press or slide virtual objects across four optical transduction modes, and test why idealized contact mechanics break down in real sensors.
          </p>
        </div>
        <button
          onClick={() => setSim(INITIAL_STATE)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Sandbox
        </button>
      </div>

      {/* 4-Step Working Principle Strip (Fig. 2b) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {WORKING_STEPS.map((s) => (
          <div key={s.step} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2E7D5B] text-xs font-bold text-white">
              {s.step}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">{s.title}</div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main 3D Workbench + Live Camera + Controls */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: 3D Interactive Viewport + Component Inspector */}
        <div className="space-y-4 lg:col-span-7">
          {/* Top toolbar above 3D canvas */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xs">
            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-[#2B5B84]" />
              <span className="text-xs font-semibold text-slate-800">Explode View</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={sim.explode}
                onChange={(e) => update('explode', +e.target.value)}
                className="w-28 sm:w-36"
              />
              <span className="w-8 font-mono text-xs text-slate-600">{Math.round(sim.explode * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update('darkBench', !sim.darkBench)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                {sim.darkBench ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {sim.darkBench ? 'Light Studio' : 'Dark Bench'}
              </button>
            </div>
          </div>

          <TactileSensor3D
            state={sim}
            onSelectComponent={(id: ComponentId) => update('selectedComponent', id)}
          />

          {/* Component Selector Pills + Detail Card (Fig. 2a) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {SENSOR_COMPONENTS.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => update('selectedComponent', comp.id)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    activeComponent.id === comp.id
                      ? 'bg-[#1E3A5F] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {comp.shortName}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-900">{activeComponent.name}</h4>
              <span className="font-mono text-[11px] text-[#2B5B84]">{activeComponent.relatedSection}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{activeComponent.role}</p>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <div className="text-[11px] font-semibold text-slate-700">Common Hardware Realizations</div>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-600">
                  {activeComponent.designChoices.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-amber-50/70 p-2.5">
                <div className="text-[11px] font-semibold text-amber-900">Key Physical Trade-Off</div>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-950/80">{activeComponent.tradeoffs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Optical Cue Switcher + Simulated Camera + Contact Controls */}
        <div className="space-y-4 lg:col-span-5">
          {/* 4-Cue Optical Switcher (Fig. 2c) */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Sparkles className="h-3.5 w-3.5 text-[#63488E]" />
              Optical Cue Mode (Fig. 2c &amp; Table 1)
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {OPTICAL_CUES.map((cue) => (
                <button
                  key={cue.id}
                  onClick={() => update('cue', cue.id as OpticalCueId)}
                  className={`cursor-pointer rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                    sim.cue === cue.id
                      ? 'bg-[#63488E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cue.shortName}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{activeCue.howItWorks}</p>
          </div>

          {/* Live Dual Simulated Camera Output */}
          <SimulatedCameraCanvas state={sim} />

          {/* Contact & Elastomer Controls */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Sliders className="h-3.5 w-3.5 text-[#2B5B84]" />
                Interactive Contact Controls
              </span>
              <div className="flex gap-1">
                {(['sphere', 'edge', 'texture', 'soft'] as IndenterShape[]).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => update('indenter', shape)}
                    className={`cursor-pointer rounded px-2 py-0.5 text-[11px] font-medium capitalize transition ${
                      sim.indenter === shape
                        ? 'bg-[#2B5B84] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <label>
                <div className="mb-0.5 flex justify-between">
                  <span className="text-slate-700">Normal Force Fn</span>
                  <span className="font-mono font-medium">{sim.normalForce.toFixed(1)} N</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.1}
                  value={sim.normalForce}
                  onChange={(e) => update('normalForce', +e.target.value)}
                  className="w-full"
                />
              </label>
              <label>
                <div className="mb-0.5 flex justify-between">
                  <span className="text-slate-700">Elastomer Stiffness</span>
                  <span className="font-mono font-medium">{sim.stiffnessKPa} kPa</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={300}
                  step={5}
                  value={sim.stiffnessKPa}
                  onChange={(e) => update('stiffnessKPa', +e.target.value)}
                  className="w-full"
                />
              </label>
              <label>
                <div className="mb-0.5 flex justify-between">
                  <span className="text-slate-700">Shear X (Ft,x)</span>
                  <span className="font-mono font-medium">{sim.shearX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={sim.shearX}
                  onChange={(e) => update('shearX', +e.target.value)}
                  className="w-full"
                />
              </label>
              <label>
                <div className="mb-0.5 flex justify-between">
                  <span className="text-slate-700">Twist Torque</span>
                  <span className="font-mono font-medium">{sim.twist.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={sim.twist}
                  onChange={(e) => update('twist', +e.target.value)}
                  className="w-full"
                />
              </label>
            </div>

            {/* Dynamic Table 1 Metadata for Active Optical Cue */}
            <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3 text-[11px]">
              <div>
                <span className="font-semibold text-slate-800">Extractable Cues: </span>
                <span className="text-slate-600">{activeCue.extractable.join(' · ')}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Calibration Needed: </span>
                <span className="text-slate-600">{activeCue.calibration.join('; ')}</span>
              </div>
              <div className="rounded-md bg-rose-50/70 px-2.5 py-1.5 text-rose-900">
                <strong>Limitation:</strong> {activeCue.keyLimitation}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2.2 & 2.3 Contact Mechanics Interactive Lab */}
      <ContactMechanicsLab />
    </section>
  );
}
