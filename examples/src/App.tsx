import { SparkViewer } from "spark-r3f";

export default function App() {
  return (
    <div style={{ height: "100vh" }}>
      <SparkViewer
        url="https://sparkjs.dev/assets/splats/butterfly.spz"
        autoRotate
      />
    </div>
  );
}
