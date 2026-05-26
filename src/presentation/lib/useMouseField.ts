import { useEffect, useRef } from "react";

export type MouseField = {
  x: number; // -1..1
  y: number; // -1..1
  active: number; // 0..1 smoothed
};

export function useMouseField() {
  const ref = useRef<MouseField>({ x: 0, y: 0, active: 0 });

  useEffect(() => {
    const target = { x: 0, y: 0, active: 0 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = -((e.clientY / window.innerHeight) * 2 - 1);
      target.active = 1;
    };
    const onLeave = () => {
      target.active = 0;
    };

    const tick = () => {
      ref.current.x += (target.x - ref.current.x) * 0.08;
      ref.current.y += (target.y - ref.current.y) * 0.08;
      ref.current.active += (target.active - ref.current.active) * 0.05;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return ref;
}
