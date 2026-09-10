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
├── app/            App composition (3D layer + DOM layer, no logic)
├── components/
│   ├── canvas/     CurioCanvas, SceneRoot, CanvasErrorBoundary
│   ├── camera/     CameraRig — the SOLE owner of the camera
│   ├── environment/EnvironmentSetup — lights, floor, technical grid
│   ├── nodes/      CurioNode (reusable), AssetModel (GLB), NodeErrorBoundary
│   └── ui/         Chrome, DetailPanel, LoadScreen, WebGLFallback
├── data/           nodes.ts (spatial single source of truth)
│                   projects.ts (content — separated from rendering)
├── store/          useCurioStore.ts (activeNode, cameraMode, targets…)
├── hooks/          reduced-motion, compact viewport, keyboard nav
├── lib/            camera poses (deterministic), WebGL probe
└── styles/         tokens.css + global.css (DOM layer only)
```

Key contracts:

- **Add a project = edit data.** Append to `NODES` in `src/data/nodes.ts`
  (id, position, scale) and to `PROJECTS` in `src/data/projects.ts`.
  The scene, camera, nav and panel pick it up with zero component changes.
- **Positions must stay ≥ 2.2 apart** — validated in dev by
  `validateNodeSeparation()`.
- **One active node.** Selection lives only in Zustand; node presses
  `stopPropagation()`; background deselect goes through `onPointerMissed`
  so the two paths can never cross-fire.
- **Animation ownership.** R3F `useFrame` damps move the camera and node
  transforms; Anime.js (`createTimeline`, `stagger`) moves DOM
  opacity/transform only.
- **GLB assets are progressive.** `assetUrl: null` renders the procedural
  fallback. Drop a file under `public/models/`, set the URL, optionally
  `useGLTF.preload` it via `preloadNodeAssets()`. Failures fall back
  per-node, never crashing the scene.
- **Reduced motion** (`prefers-reduced-motion`) makes camera moves near-
  instant and skips UI timelines while preserving all functionality.
