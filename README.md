# CURIO — spatial portfolio for Ahmed (Robotics & AI)

Curiosity made spatial: identity, projects, interests and contact exist as
objects inside one coherent, restrained 3D environment. Quiet, precise,
engineered — no neon, no dashboards, no decorative particles.

## Stack

- Vite 8 + React 19 + TypeScript (strict)
- `@react-three/fiber` 9 + `@react-three/drei` 10 (3D layer)
- Zustand 5 (single authoritative `activeNodeId`, camera targets)
- Anime.js v4 (DOM/UI motion only — never the camera)

## Run

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build → dist/
npm run preview
```

## Architecture

```text
src/
├── app/            App composition (viewport + scroll track, no logic)
├── components/
│   ├── canvas/     CurioCanvas, Scene, CanvasErrorBoundary
│   ├── camera/     CameraController — the SOLE owner of the camera
│   ├── environment/Environment — void, grid, sweep, scroll mood lighting
│   ├── artifacts/  HeroCore, CrocDevice (+live OLED), RoverArtifact,
│   │               RobotArm, TurntableStage, ArtifactModel (GLB layer)
│   └── ui/         Chrome, SectionOverlay, ScrollRail, SiteIndex,
│                   LoadScreen, WebGLFallback
├── data/           sections.ts (journey single source of truth)
│                   projects.ts (content — separated from rendering)
├── store/          useCurioStore.ts (activeSection, ready, compact)
├── hooks/          reduced-motion, compact viewport, scroll driver, keys
├── lib/            camera/mood sampling, scroll state, links, WebGL probe
└── styles/         tokens.css + global.css (DOM layer only)
```

Key contracts:

- **Scroll is the single driver.** Continuous progress lives in the mutable
  `scrollState` ref (read every frame, never re-renders React); discrete
  stop changes go through Zustand (`activeSection` → DOM overlay/rail).
- **Add a journey stop = edit data.** Append to `SECTIONS` in
  `src/data/sections.ts` (pose, mood, copy ref). Camera, stage, lighting,
  rail and overlay follow with zero component changes.
- **One subject at a time.** Three artifact bays share one turntable;
  scroll rotates the active bay front-center. No node graphs.
- **Animation ownership.** R3F `useFrame` moves camera/stage/artifacts;
  Anime.js moves DOM opacity/transform only. Never the same property.
- **GLB assets are progressive.** `ArtifactModel url={null}` renders the
  procedural artifact. Drop a file under `public/models/`, pass the URL,
  preload via `preloadArtifactAsset()`. Failures fall back per-artifact.
- **Reduced motion** steps discretely between stops (no glide), freezes
  idle motion, and shortens UI timelines — functionality preserved.
- **Smooth scroll** is Lenis (lazy chunk, skipped under reduced motion).
  It animates real window scroll, so the scroll driver needs no changes.
- **Spline dock**: set `splineUrl` (a `.splinecode` URL) on any stop in
  `src/data/sections.ts` and that stop crossfades a full-viewport Spline
  scene over the R3F world. No URL = zero cost (runtime lazy-loads).
