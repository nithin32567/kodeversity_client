import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MouseField } from "@/presentation/lib/useMouseField";
import { swarmVert, swarmFrag } from "./shaders";

const COUNT = 2400;
const RADIUS = 6;

const COLORS = [
  new THREE.Color("#00F0FF"), // cyan
  new THREE.Color("#7000FF"), // violet
  new THREE.Color("#FF9900"), // amber
];

type Props = { mouse: React.MutableRefObject<MouseField> };

export function NodeSwarm({ mouse }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, seeds, colors } = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const seeds = new Float32Array(COUNT);
    const colors = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // distribute in a spherical shell with some thickness
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = RADIUS * (0.55 + Math.random() * 0.55);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.7; // flatten a bit
      const z = r * Math.cos(phi);
      positions.push(new THREE.Vector3(x, y, z));
      seeds[i] = Math.random();

      // weighted toward cyan
      const roll = Math.random();
      const c = roll < 0.7 ? COLORS[0] : roll < 0.9 ? COLORS[1] : COLORS[2];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, seeds, colors };
  }, []);

  // set instance matrices once
  const initialized = useRef(false);
  useFrame((state) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    if (!initialized.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < COUNT; i++) {
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      const geom = mesh.geometry as THREE.InstancedBufferGeometry;
      geom.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
      geom.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));
      initialized.current = true;
    }

    mat.uniforms.uTime.value = state.clock.elapsedTime;

    // project mouse to scene plane at z=0
    const m = mouse.current;
    mat.uniforms.uCursor.value.set(m.x * 6, m.y * 4, 0);
    mat.uniforms.uCursorStrength.value = m.active;

    // slow rotation of whole swarm for life
    mesh.rotation.y += 0.0008;
    mesh.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <icosahedronGeometry args={[0.06, 0]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={swarmVert}
        fragmentShader={swarmFrag}
        uniforms={{
          uTime: { value: 0 },
          uCursor: { value: new THREE.Vector3() },
          uCursorStrength: { value: 0 },
        }}
        transparent={false}
      />
    </instancedMesh>
  );
}
