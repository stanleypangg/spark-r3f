# spark-r3f

Gaussian splatting for React Three Fiber, in three lines.

```tsx
import { SparkViewer } from "spark-r3f";

<SparkViewer url="/butterfly.spz" />
```

Wraps [`@sparkjsdev/spark`](https://github.com/sparkjsdev/spark) (the World Labs Gaussian splat renderer) for [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber), and fixes Spark's silent `frameloop="demand"` + `invalidate()` race ([spark#173](https://github.com/sparkjsdev/spark/issues/173)).

## Install

```
npm i spark-r3f three @react-three/fiber @sparkjsdev/spark
```

(All deps except `spark-r3f` are peer dependencies — they share a single copy of `three` with the rest of your app.)

## Usage

### Drop-in viewer

```tsx
import { SparkViewer } from "spark-r3f";

export default function App() {
  return <SparkViewer url="/scene.spz" autoRotate />;
}
```

### Compose manually

```tsx
import { SparkCanvas, SparkControls, Splat } from "spark-r3f";

export default function App() {
  return (
    <SparkCanvas camera={{ position: [0, 0, 3], fov: 50 }}>
      <SparkControls />
      <Splat url="/scene.spz" color="#ffaa00" />
    </SparkCanvas>
  );
}
```

Supports `.spz`, `.ply`, `.ksplat`, `.splat` — whatever Spark supports.

## Why this exists

`@react-three/fiber` supports demand-mode rendering (`frameloop="demand"`) — the app stays at 0 FPS unless something tells it to paint. Spark's splat sort runs on a worker, and in stock R3F the sort's completion doesn't trigger `invalidate()`, so visual updates stall until the camera moves. `spark-r3f`'s `<SparkCanvas>` wires Spark's `onDirty` callback to R3F's `invalidate()` — demand mode "just works."

See `examples/src/demos/BugFixSideBySide.tsx` for a visible before/after.

## API

| export | purpose |
|---|---|
| `<SparkViewer>` | Drop-in: renders a splat with default camera, controls, and lighting. Single-prop: `url`. |
| `<SparkCanvas>` | `<Canvas>` wrapper with Spark wired up. Defaults `frameloop="demand"`, `gl.antialias: false`. |
| `<Splat>` | Declarative `SplatMesh`. Props: `url` / `fileBytes`, `position`, `rotation`, `scale`, `color`, `opacity`, `onLoad`, `ref`. |
| `<SparkControls>` | Hand-rolled orbit controls. No `@react-three/drei` dependency. |

## Not yet supported (v0.1)

- React `<StrictMode>` double-invocation (disable for now — Spark's worker isn't re-entrant in dev).
- Multiple `<SparkCanvas>` instances on one page ([spark#107](https://github.com/sparkjsdev/spark/issues/107)).
- Next.js SSR helpers.
- WebXR / hand tracking.
- Declarative `<SplatEdit>`, `<SplatSkinning>` — drop down to the underlying classes via `<Splat ref>`.

## Status

v0.1 — alpha. Feedback and issues welcome.

## License

MIT
