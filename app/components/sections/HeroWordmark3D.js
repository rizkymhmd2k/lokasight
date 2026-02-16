"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Text3D, Environment } from "@react-three/drei";
import * as THREE from "three";
import groteskBold from "three/examples/fonts/helvetiker_bold.typeface.json";

function Wordmark() {
  const groupRef = useRef(null);

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    // Smoother, lighter rotation math
    const targetX = -pointer.y * 0.04;
    const targetY = pointer.x * 0.04;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      0.05,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      0.05,
    );
  });

  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font={groteskBold}
          size={2.9}
          height={0.4} // Thick enough to catch light
          curveSegments={6} // PERFORMANCE: Reduced from 12 (hardly visible difference)
          bevelEnabled
          bevelThickness={0.04}
          bevelSize={0.02}
          bevelSegments={2} // PERFORMANCE: Reduced from 4
          letterSpacing={-0.06}
        >
          formrizk
          {/* NATIVE MESH PHYSICAL MATERIAL
             This is the performance secret. It simulates glass in a single render pass.
          */}
          <meshPhysicalMaterial
            color="#000000" // Pure black base
            roughness={0.2} // Frosted glass look
            metalness={0.1} // Slight polish
            transmission={0.6} // 60% transparent (Smoked glass)
            thickness={1.5} // Volume simulation
            ior={1.5} // Glass refraction index
            clearcoat={1} // High gloss top layer
            clearcoatRoughness={0.1}
            attenuationDistance={1} // How fast light fades inside
            attenuationColor="#ffffff"
          />
        </Text3D>
      </Center>
    </group>
  );
}

export default function HeroWordmark3D() {
  return (
    <div className="w-full h-[30vw] min-h-[220px] max-h-[480px] bg-transparent">
      <Canvas
        dpr={[1, 1.5]} // PERFORMANCE: Cap pixel ratio to save battery/heat
        camera={{ position: [0, 0, 8], fov: 35 }}
        gl={{
          alpha: true,
          antialias: true,
          // Tone mapping helps the bright reflections look realistic, not blown out
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        {/* LIGHTING:
          Glass needs something to reflect. The Environment map is the cheapest way 
          to get "complex" lighting. "Studio" gives nice white highlights on dark glass.
        */}
        <Environment
          files="/hdri/bell01.exr"
          intensity={0.9}
          blur={0.15}
          rotation={[0, -Math.PI / 2, 0]} // rotate around Y
        />

        {/* One manual light for dramatic edge highlights */}
        <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />

        <Wordmark />
      </Canvas>
    </div>
  );
}
