import type { CSSProperties, ReactNode } from "react";
import type { SplatMesh } from "@sparkjsdev/spark";
import { SparkCanvas } from "./SparkCanvas";
import { SparkControls } from "./SparkControls";
import { Splat } from "./Splat";

export type SparkViewerProps = {
  url: string;
  style?: CSSProperties;
  className?: string;
  background?: string | null;
  camera?: { position?: [number, number, number]; fov?: number };
  controls?: "orbit" | false;
  autoRotate?: boolean;
  upAxis?: "y-up" | "y-down";
  onLoad?: (mesh: SplatMesh) => void;
  children?: ReactNode;
};

const defaultStyle: CSSProperties = { width: "100%", height: "100%" };

export function SparkViewer({
  url,
  style,
  className,
  background = null,
  camera,
  controls = "orbit",
  autoRotate = false,
  upAxis = "y-down",
  onLoad,
  children,
}: SparkViewerProps) {
  const splatRotation: [number, number, number] =
    upAxis === "y-down" ? [Math.PI, 0, 0] : [0, 0, 0];
  const mergedStyle: CSSProperties = { ...defaultStyle, ...style };
  if (background !== null) mergedStyle.backgroundColor = background;

  const cameraConfig = {
    position: camera?.position ?? ([0, 0, 3] as [number, number, number]),
    fov: camera?.fov ?? 50,
  };

  return (
    <div style={mergedStyle} {...(className !== undefined && { className })}>
      <SparkCanvas camera={cameraConfig}>
        {controls === "orbit" && <SparkControls autoRotate={autoRotate} />}
        <Splat
          url={url}
          rotation={splatRotation}
          {...(onLoad !== undefined && { onLoad })}
        />
        {children}
      </SparkCanvas>
    </div>
  );
}
