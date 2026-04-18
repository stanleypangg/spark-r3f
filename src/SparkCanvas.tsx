import { Canvas, useThree, type CanvasProps } from "@react-three/fiber";
import { SparkRenderer } from "@sparkjsdev/spark";
import { useEffect, useMemo, type ReactNode } from "react";
import { SparkRendererContext } from "./SparkRendererContext";

export type SparkCanvasProps = CanvasProps & {
  onDirty?: () => void;
};

export function SparkCanvas({
  children,
  frameloop = "demand",
  gl,
  dpr = [1, 2],
  onDirty,
  ...rest
}: SparkCanvasProps) {
  const mergedGl = { antialias: false, ...(typeof gl === "object" ? gl : {}) };

  return (
    <Canvas frameloop={frameloop} gl={mergedGl} dpr={dpr} {...rest}>
      <SparkRendererBridge {...(onDirty !== undefined && { onDirty })}>
        {children}
      </SparkRendererBridge>
    </Canvas>
  );
}

function SparkRendererBridge({
  children,
  onDirty,
}: {
  children: ReactNode;
  onDirty?: () => void;
}) {
  const renderer = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  const sparkRenderer = useMemo(() => {
    return new SparkRenderer({
      renderer,
      onDirty: () => {
        invalidate();
        onDirty?.();
      },
    });
  }, [renderer, invalidate, onDirty]);

  useEffect(() => {
    return () => {
      sparkRenderer.parent?.remove(sparkRenderer);
    };
  }, [sparkRenderer]);

  return (
    <SparkRendererContext.Provider value={sparkRenderer}>
      <primitive object={sparkRenderer} />
      {children}
    </SparkRendererContext.Provider>
  );
}
