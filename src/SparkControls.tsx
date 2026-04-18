import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Spherical, Vector3 } from "three";

export type SparkControlsProps = {
  target?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  enableDamping?: boolean;
  dampingFactor?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enabled?: boolean;
};

const EPS = 1e-4;

export function SparkControls({
  target = [0, 0, 0],
  minDistance = 0.1,
  maxDistance = 100,
  enableDamping = true,
  dampingFactor = 0.08,
  autoRotate = false,
  autoRotateSpeed = 0.5,
  enabled = true,
}: SparkControlsProps) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  const targetVec = useRef(new Vector3(...target));
  const spherical = useRef(new Spherical());
  const sphericalDelta = useRef(new Spherical());
  const panOffset = useRef(new Vector3());
  const scale = useRef(1);
  const pointerState = useRef<{
    active: "rotate" | "pan" | null;
    x: number;
    y: number;
  }>({ active: null, x: 0, y: 0 });

  useEffect(() => {
    targetVec.current.set(target[0], target[1], target[2]);
    const offset = camera.position.clone().sub(targetVec.current);
    spherical.current.setFromVector3(offset);
    invalidate();
  }, [target, camera, invalidate]);

  useEffect(() => {
    if (!enabled) return;
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      dom.setPointerCapture(e.pointerId);
      pointerState.current.active =
        e.button === 2 || e.shiftKey ? "pan" : "rotate";
      pointerState.current.x = e.clientX;
      pointerState.current.y = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerState.current.active) return;
      const dx = e.clientX - pointerState.current.x;
      const dy = e.clientY - pointerState.current.y;
      pointerState.current.x = e.clientX;
      pointerState.current.y = e.clientY;

      const h = dom.clientHeight || 1;
      if (pointerState.current.active === "rotate") {
        sphericalDelta.current.theta -= (2 * Math.PI * dx) / h;
        sphericalDelta.current.phi -= (2 * Math.PI * dy) / h;
      } else {
        const r = spherical.current.radius;
        const panScale = r / h;
        const vX = new Vector3().setFromMatrixColumn(camera.matrix, 0);
        const vY = new Vector3().setFromMatrixColumn(camera.matrix, 1);
        panOffset.current.addScaledVector(vX, -dx * panScale);
        panOffset.current.addScaledVector(vY, dy * panScale);
      }
      invalidate();
    };

    const onPointerUp = (e: PointerEvent) => {
      dom.releasePointerCapture?.(e.pointerId);
      pointerState.current.active = null;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.pow(0.95, Math.sign(e.deltaY) * -1);
      scale.current *= factor;
      invalidate();
    };

    const onContextMenu = (e: Event) => e.preventDefault();

    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("pointercancel", onPointerUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("contextmenu", onContextMenu);
    return () => {
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("contextmenu", onContextMenu);
    };
  }, [gl, enabled, camera, invalidate]);

  useFrame((_, delta) => {
    if (!enabled) return;
    let changed = false;

    if (autoRotate && !pointerState.current.active) {
      sphericalDelta.current.theta -= autoRotateSpeed * delta;
    }

    const damp = enableDamping ? dampingFactor : 1;
    spherical.current.theta += sphericalDelta.current.theta * damp;
    spherical.current.phi += sphericalDelta.current.phi * damp;
    spherical.current.radius *= Math.pow(scale.current, damp);
    spherical.current.radius = Math.max(
      minDistance,
      Math.min(maxDistance, spherical.current.radius),
    );
    spherical.current.phi = Math.max(
      EPS,
      Math.min(Math.PI - EPS, spherical.current.phi),
    );
    spherical.current.makeSafe();

    if (panOffset.current.lengthSq() > EPS * EPS) {
      targetVec.current.add(panOffset.current.clone().multiplyScalar(damp));
      changed = true;
    }

    if (
      Math.abs(sphericalDelta.current.theta) > EPS ||
      Math.abs(sphericalDelta.current.phi) > EPS ||
      Math.abs(scale.current - 1) > EPS ||
      autoRotate
    ) {
      changed = true;
    }

    sphericalDelta.current.theta *= 1 - damp;
    sphericalDelta.current.phi *= 1 - damp;
    panOffset.current.multiplyScalar(1 - damp);
    scale.current = 1 + (scale.current - 1) * (1 - damp);

    const offset = new Vector3().setFromSpherical(spherical.current);
    camera.position.copy(targetVec.current).add(offset);
    camera.lookAt(targetVec.current);

    if (changed) invalidate();
  });

  return null;
}
