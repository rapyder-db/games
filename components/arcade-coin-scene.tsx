"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function CoinMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const frontTexture = useLoader(THREE.TextureLoader, "/Coin.png");
  const backTexture = useMemo(() => {
    const texture = frontTexture.clone();
    texture.needsUpdate = true;
    return texture;
  }, [frontTexture]);

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += delta * 1.8;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.16;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.12;
  });

  return (
    <Float speed={2.3} rotationIntensity={0.5} floatIntensity={0.7}>
      <group ref={groupRef}>
        <mesh>
          <cylinderGeometry args={[1.1, 1.1, 0.18, 96]} />
          <meshStandardMaterial color="#f3b230" metalness={0.92} roughness={0.22} />
        </mesh>

        <mesh position={[0, 0, 0.095]} rotation={[0, 0, 0]}>
          <circleGeometry args={[1.06, 96]} />
          <meshStandardMaterial map={frontTexture} transparent metalness={0.65} roughness={0.35} />
        </mesh>

        <mesh position={[0, 0, -0.095]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[1.06, 96]} />
          <meshStandardMaterial map={backTexture} transparent metalness={0.65} roughness={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

export function ArcadeCoinScene() {
  return (
    <div className="arcade-three-wrap">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 36 }} dpr={[1, 2]}>
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 5, 10]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 4]} intensity={2.6} color="#ffffff" />
        <pointLight position={[-3, 0, 3]} intensity={16} color="#fc3030" />
        <pointLight position={[3, 1, 2]} intensity={12} color="#ffb000" />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Sparkles count={90} size={3.5} scale={[6, 6, 3]} speed={0.6} color="#ffb000" />
          <CoinMesh />
        </Suspense>
      </Canvas>
      <div className="arcade-three-glow" />
    </div>
  );
}
