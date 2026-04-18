import { createContext, useContext } from "react";
import type { SparkRenderer } from "@sparkjsdev/spark";

export const SparkRendererContext = createContext<SparkRenderer | null>(null);

export function useSparkRenderer(): SparkRenderer {
  const renderer = useContext(SparkRendererContext);
  if (!renderer) {
    throw new Error(
      "<Splat /> must be rendered inside <SparkCanvas>. " +
        "If you're using <SparkViewer> you shouldn't see this — please file an issue.",
    );
  }
  return renderer;
}
