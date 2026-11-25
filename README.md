# Tactile Sight Explorer — Vision-Based Tactile Intelligence for Robotics

Interactive companion website for the survey **"Vision-Based Tactile Intelligence for Robotics: Hardware Design, Data Regimes, and Embodied Manipulation."**

**Live Site:** https://juuhuu.github.io/VBTSwebsite/

## Interactive Modules

1. **Theory & 3D Lab** — Interactive 3D VBTS cutaway, 4 optical transduction cues, simulated camera readout, and contact-mechanics lab.
2. **Hardware Co-Design** — 6 design goals, 18 physical levers, morphing sensor schematic, trade-off radar, and conflict advisor.
3. **Sensor Taxonomy** — 61 representative VBTS hardware implementations with branch tree, timeline, and 4-way comparator.
4. **Data & Learning Regimes** — Unit-explicit data-budget explorer across the 5 regimes, $N_{\mathrm{obs}}$ calculator, simulator/transfer comparisons, and VLA timing explorer.
5. **Unified Future Roadmap** — Interactive closed-loop system view connecting the five open research directions.

## Local Development

```bash
npm install
npm run dev
```

To build the production bundle:

```bash
npm run build
npm run preview
```
