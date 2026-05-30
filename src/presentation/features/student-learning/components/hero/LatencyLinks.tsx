import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { linksVert, linksFrag } from "./shaders";

const NODES = 180;
const LINKS_PER_NODE = 2;
const RADIUS = 6;

const COLORS = [new THREE.Color("#00F0FF"), new THREE.Color("#7000FF")];

export function LatencyLinks() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < NODES; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = RADIUS * (0.6 + Math.random() * 0.5);
      pts.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.7,
          r * Math.cos(phi),
        ),
      );
    }

    const positions: number[] = [];
    const progress: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < NODES; i++) {
      // find nearest neighbors
      const dists = pts
        .map((p, j) => ({ j, d: pts[i].distanceTo(p) }))
        .filter((x) => x.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, LINKS_PER_NODE);

      for (const { j } of dists) {
        const a = pts[i];
        const b = pts[j];
        const c = COLORS[(i + j) % COLORS.length];
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        progress.push(0, 1);
        colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute("aProgress", new THREE.Float32BufferAttribute(progress, 1));
    geom.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));
    return geom;
  }, []);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={linksVert}
        fragmentShader={linksFrag}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}
