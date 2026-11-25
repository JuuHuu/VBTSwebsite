# VBTS Interactive Companion Website — Setup & Run Note

This note records the configuration and startup commands for the interactive companion website built for the IJRR survey on Vision-Based Tactile Sensors (VBTSs).

## Project Location & Runtime

- **Project directory:** `/home/juu/Documents/20260529-Review_submit/vbts_website`
- **Language:** English-only
- **Verified environment:** Node `v20.19.5`, npm `11.21.1`
- **Stack:** Vite 6 + React 19 + TypeScript 5.8 + Tailwind CSS v4 + Three.js (`@react-three/fiber` v9, `@react-three/drei` v10) + KaTeX + `lucide-react`
- **Build config:** `vite.config.ts` uses `base: './'` and outputs static assets to `dist/` (compatible with local preview or static hosting such as GitHub Pages).

## How to Start the Website

### Option A — Development server (live reload, recommended for editing)
```bash
cd /home/juu/Documents/20260529-Review_submit/vbts_website
npm run dev -- --host 127.0.0.1 --port 5173
```
Open in browser: `http://127.0.0.1:5173/` (use `--host 0.0.0.0` if accessing over LAN or port forwarding).

### Option B — Preview the compiled production bundle
```bash
cd /home/juu/Documents/20260529-Review_submit/vbts_website
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```
Open in browser: `http://127.0.0.1:4173/`

### Notes for Future Agents Starting the Server
1. **Dependencies are already installed** in `vbts_website/node_modules/`. Only run `npm install` if `package.json` changes (installing packages requires network access).
2. **Type-check & build** (`npm run build`, which runs `tsc --noEmit && vite build`) works completely offline.
3. **Starting a local dev/preview server** binds a localhost TCP port (`5173` or `4173`). If running from a sandboxed agent shell, run it as a background daemon (`IsDaemon: true`) and request port-binding/unsandboxed permission if the sandbox blocks binding localhost sockets.
4. **3D scene is 100% offline-safe:** `TactileSensor3D.tsx` uses a procedural `<Environment resolution={256}><Lightformer ... /></Environment>` instead of external CDN `.hdr` presets, so it renders properly with no internet access.
5. **Do not modify the IJRR manuscript** (`69e5e57456c2623ce4f17a75/IJRR/ijrr_new_main.tex`) when working on the website unless explicitly requested.

## Website Modules & Key Files

| Module | Survey Alignment | Main Files |
| :--- | :--- | :--- |
| **1. Theory & 3D Lab** | Sec. 2, Fig. 2 (4 optical cues + contact mechanics) | `src/components/theory/TheoryModule.tsx`, `TactileSensor3D.tsx`, `SimulatedCameraCanvas.tsx`, `ContactMechanicsLab.tsx`, `src/physics/contactMechanics.ts` |
| **2. Hardware Co-Design** | Sec. 3, Fig. 3, Table 3 (18 design levers, radar, conflict advisor) | `src/components/codesign/CodesignModule.tsx`, `MorphingSchematic.tsx`, `TradeoffRadar.tsx`, `src/data/hardwareGoals.ts` |
| **3. Sensor Taxonomy** | Sec. 3, Fig. 4 (61 sensors, branch tree, timeline, 4-way compare) | `src/components/taxonomy/TaxonomyModule.tsx`, `src/data/sensors.ts`, `public/thumbnails/` (97 cropped thumbnails from `fig4.pdf`) |
| **4. Data & Learning Regimes** | Sec. 4, Fig. 5, Tables 4–7 (75 curated / 125 audited budgets + 35 native-only, $N_{\mathrm{obs}}$ calculator, simulators, transfer, VLA timing) | `src/components/regimes/DataRegimesModule.tsx`, `DataBudgetChart.tsx`, `src/data/dataRegimes.ts` |
| **5. Unified Future Roadmap** | Sec. 5, Fig. 6 (Challenges 5.1–5.5 & Couplings 1–6 interactive loop) | `src/components/roadmap/RoadmapModule.tsx`, `src/data/futureRoadmap.ts` |

## Authoritative Data Sources

- **Sensor thumbnails:** Cropped from `69e5e57456c2623ce4f17a75/IJRR/figs_pdf/fig4.pdf` into `vbts_website/public/thumbnails/` (copied automatically to `dist/thumbnails/` on build).
- **Data-budget audit ledger (Module 4):** Derived from `69e5e57456c2623ce4f17a75/IJRR_support/review_support/figure4_data_audit/reported_budgets.csv` and `figure4_complete_source_ledger.csv` paired with DOIs from `69e5e57456c2623ce4f17a75/IJRR/ijrr_references.bib`.
