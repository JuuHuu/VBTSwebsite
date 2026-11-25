import { useState } from 'react';
import { BookOpen, Box, Cpu, Grid, Database, Compass, Copy, Check, ArrowDown } from 'lucide-react';
import { TheoryModule } from './components/theory/TheoryModule';
import { CodesignModule } from './components/codesign/CodesignModule';
import { TaxonomyModule } from './components/taxonomy/TaxonomyModule';
import { DataRegimesModule } from './components/regimes/DataRegimesModule';
import { RoadmapModule } from './components/roadmap/RoadmapModule';

const SURVEY_BIBTEX = `@article{zhou2026vbts,
  title   = {Vision-Based Tactile Intelligence for Robotics: Hardware Design, Data Regimes, and Embodied Manipulation},
  author  = {Zhou, Peng and Hu, Jun and Chen, Sihan and Zhang, Zeqing and Ma, Haofei and Lu, Zhenyu and Liu, Sichao and Wang, Xueqian and Zheng, Pai and Li, Xiang and Luo, Shan and Pan, Jia and Navarro-Alarcon, David and Yang, Chenguang and Wang, Michael Yu},
  journal = {The International Journal of Robotics Research},
  year    = {2026}
}`;

export function App() {
  const [compareIds, setCompareIds] = useState<string[]>([
    'gelsight_2017',
    'tactip_2018',
    'digit_2020',
    'fingervision_2017',
  ]);
  const [copiedBib, setCopiedBib] = useState(false);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  };

  const handleSelectSensorsFromAdvisor = (ids: string[]) => {
    setCompareIds(ids.slice(0, 4));
    const el = document.getElementById('compare-panel');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const copyBibtex = async () => {
    try {
      await navigator.clipboard.writeText(SURVEY_BIBTEX);
      setCopiedBib(true);
      setTimeout(() => setCopiedBib(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2937]">
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#FAF9F6]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A5F] text-white shadow-xs">
              <Box className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900">Tactile Sight Explorer</div>
              <div className="text-[10px] font-medium text-slate-500">IJRR Survey Interactive Companion</div>
            </div>
          </a>

          <nav className="hidden items-center gap-0.5 lg:flex">
            <a href="#theory" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/60">
              <Box className="h-3.5 w-3.5 text-[#2B5B84]" /> 1. Theory (3D)
            </a>
            <a href="#codesign" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/60">
              <Cpu className="h-3.5 w-3.5 text-[#2E7D5B]" /> 2. Co-Design
            </a>
            <a href="#taxonomy" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/60">
              <Grid className="h-3.5 w-3.5 text-[#63488E]" /> 3. Taxonomy
              {compareIds.length > 0 && (
                <span className="ml-0.5 rounded-full bg-[#1E3A5F] px-1.5 py-0.5 font-mono text-[10px] text-white">
                  {compareIds.length}
                </span>
              )}
            </a>
            <a href="#regimes" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/60">
              <Database className="h-3.5 w-3.5 text-[#8E3A59]" /> 4. Data &amp; Learning
            </a>
            <a href="#roadmap" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/60">
              <Compass className="h-3.5 w-3.5 text-[#6E4E37]" /> 5. Future Loop
            </a>
          </nav>

          <button
            onClick={copyBibtex}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {copiedBib ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedBib ? 'BibTeX Copied' : 'Cite Survey'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="border-b border-slate-200 bg-gradient-to-b from-white to-[#FAF9F6]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2B5B84]/25 bg-[#EEF5FB] px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
              <BookOpen className="h-3.5 w-3.5" />
              Interactive Survey Companion · The International Journal of Robotics Research
            </div>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
              Vision-Based Tactile Intelligence for Robotics:
              <span className="block text-[#2B5B84]">Hardware Design, Data Regimes, &amp; Embodied Manipulation</span>
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
              A complete interactive companion to our survey: manipulate a 3D vision-based tactile sensor (VBTS) across four optical cues, test contact-mechanics failure modes, explore 6-goal hardware trade-offs and 61 categorized sensors, inspect unit-audited data budgets across Regimes I–V, and trace the unified future-directions loop.
            </p>
            <p className="mt-2.5 text-xs text-slate-500">
              Peng Zhou, Jun Hu, Sihan Chen, Zeqing Zhang, Haofei Ma, Zhenyu Lu, Sichao Liu, Xueqian Wang, Pai Zheng, Xiang Li, Shan Luo, Jia Pan, David Navarro-Alarcon, Chenguang Yang, and Michael Yu Wang
            </p>

            {/* Quick-jump 5-module cards */}
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              <a href="#theory" className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-[#2B5B84] hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#E8F1F8] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#2B5B84]">Sec. 2 · Fig. 2</span>
                  <ArrowDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2B5B84]" />
                </div>
                <div className="mt-1.5 text-xs font-semibold text-slate-900">3D Tactile Theory</div>
                <p className="mt-0.5 text-[11px] text-slate-600">Exploded 3D sensor, 4 optical cues, &amp; 6 mechanics labs.</p>
              </a>

              <a href="#codesign" className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-[#2E7D5B] hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#EDF7F2] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#2E7D5B]">Sec. 3 · Fig. 3</span>
                  <ArrowDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2E7D5B]" />
                </div>
                <div className="mt-1.5 text-xs font-semibold text-slate-900">6-Goal Co-Design</div>
                <p className="mt-0.5 text-[11px] text-slate-600">Morphing schematics, trade-off radar, &amp; design advisor.</p>
              </a>

              <a href="#taxonomy" className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-[#63488E] hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#F0EBF8] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#63488E]">Sec. 3 · Fig. 4</span>
                  <ArrowDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#63488E]" />
                </div>
                <div className="mt-1.5 text-xs font-semibold text-slate-900">Sensor Taxonomy</div>
                <p className="mt-0.5 text-[11px] text-slate-600">61 sensors with thumbnails &amp; 4-way comparator.</p>
              </a>

              <a href="#regimes" className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-[#8E3A59] hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#FAF0F4] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#8E3A59]">Sec. 4 · Fig. 5</span>
                  <ArrowDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#8E3A59]" />
                </div>
                <div className="mt-1.5 text-xs font-semibold text-slate-900">Data &amp; Learning</div>
                <p className="mt-0.5 text-[11px] text-slate-600">Audited log budgets, simulators, transfer, &amp; VLAs.</p>
              </a>

              <a href="#roadmap" className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-[#6E4E37] hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#F1EBE4] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#6E4E37]">Sec. 5 · Loop</span>
                  <ArrowDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#6E4E37]" />
                </div>
                <div className="mt-1.5 text-xs font-semibold text-slate-900">Future Directions</div>
                <p className="mt-0.5 text-[11px] text-slate-600">Interactive online–offline loop linking 5 challenges.</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* All 5 Interactive Modules */}
      <main className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 lg:py-14">
        <TheoryModule />
        <CodesignModule onSelectSensorsForCompare={handleSelectSensorsFromAdvisor} />
        <TaxonomyModule
          compareIds={compareIds}
          onToggleCompare={toggleCompare}
          onSetCompareIds={setCompareIds}
        />
        <DataRegimesModule />
        <RoadmapModule />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4">
          Interactive Companion to <em>Vision-Based Tactile Intelligence for Robotics: Hardware Design, Data Regimes, and Embodied Manipulation</em> (IJRR).
        </div>
      </footer>
    </div>
  );
}

export default App;
