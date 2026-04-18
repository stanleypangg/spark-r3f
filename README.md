# spark-r3f

**Gaussian splats for React, in one line.**

```tsx
import { SparkViewer } from "spark-r3f";

<SparkViewer url="/scene.spz" />
```

That's the whole API for the 90% case. Orbit controls, right-side-up orientation, efficient on-demand rendering: all handled.

For the other 10%, the same library exposes composable primitives so you can drop down to full [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) control without rewriting.

## Why

Gaussian splats are the fastest way to put photorealistic 3D captures on the web. But today, integrating one means learning Three.js, React Three Fiber, and [`@sparkjsdev/spark`](https://github.com/sparkjsdev/spark) all at once, plus wrestling with render-loop wiring and coordinate conventions. `spark-r3f` collapses that to a single component for the common case, with sensible defaults for everything you'd otherwise configure by hand.

## Install

```
npm i spark-r3f three @react-three/fiber @sparkjsdev/spark
```

Everything except `spark-r3f` is a peer dependency. Your app supplies its own copy of Three.js, R3F, and Spark, and this library plugs into them.

## Usage

### Drop-in viewer

```tsx
import { SparkViewer } from "spark-r3f";

export default function App() {
  return <SparkViewer url="/scene.spz" autoRotate />;
}
```

Props you can pass: `url`, `autoRotate`, `camera`, `controls`, `background`, `upAxis`, `onLoad`, `style`, `className`, `children`.

### Compose manually

When you need lights, multiple splats, custom controls, or anything else in the scene:

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

`<SparkCanvas>` is a `<Canvas>` with Spark wired up; `<Splat>` is a declarative `SplatMesh`; you can mix in any R3F/Three.js primitives as children.

Supports `.spz`, `.ply`, `.ksplat`, `.splat`: whatever Spark supports.

## API

| export | purpose |
|---|---|
| `<SparkViewer>` | Drop-in viewer with sensible defaults. Required prop: `url`. |
| `<SparkCanvas>` | `<Canvas>` wrapper with Spark wired up. Defaults `frameloop="demand"`, `gl.antialias: false`. |
| `<Splat>` | Declarative `SplatMesh`. Props: `url` / `fileBytes`, `position`, `rotation`, `scale`, `color`, `opacity`, `onLoad`, `ref`. |
| `<SparkControls>` | Hand-rolled orbit controls. No `@react-three/drei` dependency. |

## How it works

Two decisions make the one-line API work:

1. **Demand-mode rendering is actually driven.** `<SparkCanvas>` defaults to R3F's `frameloop="demand"` (idle at 0 FPS until something changes) and bridges Spark's internal `onDirty` callback to R3F's `invalidate()`, so splats repaint when they need to and stay quiet otherwise. Without this wiring, demand mode causes visible stalls; `spark-r3f` handles it automatically.
2. **Splats render right-side up by default.** Most capture pipelines export with Y pointing down, which renders upside down in Three.js's Y-up world. `<SparkViewer>` applies the flip for you. Pass `upAxis="y-up"` to opt out.

Neither of these is something you should ever have to think about. They're internal plumbing that make the public API feel simple.

## Not yet supported (v0.1)

- React `<StrictMode>` double-invocation (disable for now; Spark's worker isn't re-entrant in dev).
- Multiple `<SparkCanvas>` instances on one page ([spark#107](https://github.com/sparkjsdev/spark/issues/107)).
- Next.js SSR helpers.
- WebXR / hand tracking.
- Declarative `<SplatEdit>` / `<SplatSkinning>`. Drop down to the underlying classes via `<Splat ref>`.

## Status

v0.1, alpha. Feedback and issues welcome.

## License

MIT
