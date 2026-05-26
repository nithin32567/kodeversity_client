import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { NodeSwarm } from "./NodeSwarm";
import { LatencyLinks } from "./LatencyLinks";
import type { MouseField } from "@/presentation/lib/useMouseField";

type Props = { mouse: React.MutableRefObject<MouseField> };

export function SwarmCanvas({ mouse }: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 12], fov: 55, near: 0.1, far: 100 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color("#060709"), 1);
      }}
    >
      <NodeSwarm mouse={mouse} />
      <LatencyLinks />
      <EffectComposer>
        <Bloom intensity={1.1} luminanceThreshold={0.15} luminanceSmoothing={0.6} mipmapBlur />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0015, 0.0012)}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
