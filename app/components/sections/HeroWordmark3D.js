"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Text3D } from "@react-three/drei";
import * as THREE from "three";
import groteskBold from "three/examples/fonts/helvetiker_bold.typeface.json";

function Wordmark() {
  const groupRef = useRef(null);

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;

    const targetX = -pointer.y * 0.025;
    const targetY = pointer.x * 0.03;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      0.08
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      0.08
    );
  });

  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font={groteskBold}
          size={2.6}
          height={0.4}
          curveSegments={6}
          bevelEnabled
          bevelThickness={0.035}
          bevelSize={0.02}
          bevelSegments={2}
          letterSpacing={-0.06}
        >
          formrizk
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.08}
            metalness={0.5}
          />
        </Text3D>
      </Center>
    </group>
  );
}

export default function HeroWordmark3D() {
  return (
    <div className="w-full h-[30vw] min-h-[220px] max-h-[480px]">
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 0, 8], fov: 32 }}
        gl={{ 
          alpha: true, 
          antialias: true, 
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
      >
        {/* 
          AMBIENT LIGHT - Base illumination (like room lighting)
          - Lights everything equally from all directions
          - Prevents completely black shadows
          - Lower intensity so directional lights create definition
        */}
        <ambientLight intensity={4.5} color="#fff9e6" />
        
        {/* 
          HEMISPHERE LIGHT - Sky/ground lighting (natural environment)
          - Sky color from above, ground color from below
          - Mimics natural outdoor lighting
          - Warm tones to match your yellow background
        */}
        <hemisphereLight
          skyColor="#fffaeb"
          groundColor="#e6d5b8"
          intensity={4.0}
        />
        
        {/* 
          KEY LIGHT - Main light (like the sun or main studio light)
          - Positioned top-front-right for classic hero lighting
          - Highest intensity - creates primary highlights
          - Defines the main look and shadows
        */}
        <directionalLight 
          position={[6, 7, 8]} 
          intensity={12.0} 
          color="#fff8e1" 
        />
        
        {/* 
          FILL LIGHT - Reduces harsh shadows (like a reflector)
          - Positioned opposite to key light (left side)
          - Lower intensity than key light
          - Softens shadows, reveals detail in dark areas
        */}
        <directionalLight 
          position={[-5, 4, 6]} 
          intensity={10.0} 
          color="#ffefc2" 
        />
        
        {/* 
          RIM/BACK LIGHT - Creates edge glow (separation from background)
          - Positioned behind the text
          - Creates a "halo" effect on edges
          - Makes text pop out from the background
        */}
        <directionalLight 
          position={[0, 5, -7]} 
          intensity={3.0} 
          color="#fff4d6" 
        />
        
        {/* 
          TOP LIGHT - Overhead illumination
          - Lights the top surfaces of letters
          - Adds dimensional depth
          - Simulates ceiling/sky light
        */}
        <directionalLight 
          position={[0, 10, 3]} 
          intensity={5.0} 
          color="#fffbeb" 
        />
        
        {/* 
          ACCENT LIGHTS - Point lights for sparkle/detail
          - Point lights emit from a single point in all directions
          - Right side accent adds highlights to right edges
          - Helps define the 3D form
        */}
        
        
       
    
      
        <Wordmark />
      </Canvas>
    </div>
  );
}