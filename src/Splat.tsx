import { SplatMesh } from "@sparkjsdev/spark";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import type { ColorRepresentation, Euler, Vector3 } from "three";
import { useSparkRenderer } from "./SparkRendererContext";

export type SplatProps = {
  url?: string;
  fileBytes?: Uint8Array | ArrayBuffer;
  position?: [number, number, number] | Vector3;
  rotation?: [number, number, number] | Euler;
  scale?: number | [number, number, number] | Vector3;
  color?: ColorRepresentation;
  opacity?: number;
  onLoad?: (mesh: SplatMesh) => void;
};

export const Splat = forwardRef<SplatMesh, SplatProps>(function Splat(
  { url, fileBytes, position, rotation, scale, color, opacity, onLoad },
  ref,
) {
  useSparkRenderer();

  const mesh = useMemo(() => {
    const options: ConstructorParameters<typeof SplatMesh>[0] = {};
    if (url !== undefined) options.url = url;
    if (fileBytes !== undefined) options.fileBytes = fileBytes;
    if (onLoad !== undefined) options.onLoad = onLoad;
    return new SplatMesh(options);
  }, [url, fileBytes, onLoad]);

  useImperativeHandle(ref, () => mesh, [mesh]);

  useEffect(() => {
    return () => {
      mesh.dispose();
    };
  }, [mesh]);

  useEffect(() => {
    if (color !== undefined) mesh.recolor.set(color);
  }, [mesh, color]);

  useEffect(() => {
    if (opacity !== undefined) mesh.opacity = opacity;
  }, [mesh, opacity]);

  return (
    <primitive
      object={mesh}
      {...(position !== undefined && { position })}
      {...(rotation !== undefined && { rotation })}
      {...(scale !== undefined && { scale })}
    />
  );
});
