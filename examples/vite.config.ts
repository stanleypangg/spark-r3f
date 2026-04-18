import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "spark-r3f": path.resolve(__dirname, "../src/index.ts"),
    },
    dedupe: ["react", "react-dom", "three", "@react-three/fiber"],
  },
});
