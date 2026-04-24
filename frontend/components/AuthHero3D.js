'use client';
import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, RoundedBox } from '@react-three/drei';

function MonitorScene() {
  const frame = useRef(null);
  const cards = useMemo(
    () => [
      { pos: [1.3, 0.4, -0.35], scale: [0.72, 0.42, 0.08], color: '#7c3aed' },
      { pos: [-1.25, 0.2, -0.55], scale: [0.68, 0.34, 0.08], color: '#c026d3' },
      { pos: [0, -0.65, -0.35], scale: [0.88, 0.26, 0.08], color: '#60a5fa' },
    ],
    []
  );

  useFrame((state) => {
    if (!frame.current) return;
    const t = state.clock.getElapsedTime();
    frame.current.rotation.y = Math.sin(t * 0.18) * 0.14;
    frame.current.rotation.x = Math.sin(t * 0.09) * 0.05;
  });

  return (
    <group ref={frame}>
      <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.35}>
        <RoundedBox args={[3.2, 1.95, 0.22]} radius={0.28} smoothness={8} castShadow receiveShadow>
          <meshStandardMaterial color="#0f172a" roughness={0.12} metalness={0.25} />
        </RoundedBox>
      </Float>

      <group position={[0, 0.05, 0.12]}>
        <mesh>
          <planeGeometry args={[2.8, 1.45]} />
          <meshStandardMaterial color="#111827" roughness={0.18} metalness={0.05} />
        </mesh>
        <group position={[0, 0.5, 0.05]}>
          <mesh position={[-1.05, 0, 0]}>
            <boxGeometry args={[0.8, 0.18, 0.08]} />
            <meshStandardMaterial color="#8b5cf6" />
          </mesh>
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[1.6, 0.18, 0.08]} />
            <meshStandardMaterial color="#a855f7" />
          </mesh>
        </group>
        <group position={[-0.65, -0.35, 0.05]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.4, 0.22, 0.06]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-0.56, 0, 0.05]}>
            <boxGeometry args={[0.38, 0.14, 0.04]} />
            <meshStandardMaterial color="#60a5fa" />
          </mesh>
          <mesh position={[0.3, 0, 0.05]}>
            <boxGeometry args={[0.55, 0.14, 0.04]} />
            <meshStandardMaterial color="#c026d3" />
          </mesh>
        </group>
      </group>

      {cards.map((card, index) => (
        <Float key={index} speed={1.5} rotationIntensity={0.35} floatIntensity={0.24}>
          <RoundedBox args={card.scale} radius={0.14} smoothness={8} position={card.pos} castShadow>
            <meshStandardMaterial color={card.color} transparent opacity={0.88} roughness={0.22} metalness={0.24} />
          </RoundedBox>
        </Float>
      ))}

      <ContactShadows opacity={0.22} scale={8} blur={2.8} far={4} position={[0, -1.1, 0]} />
    </group>
  );
}

export default function AuthHero3D() {
  return (
    <div className="relative w-full h-[420px] sm:h-[520px] overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_35px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-slate-900/50 via-slate-900/10 to-transparent" />
      <Canvas camera={{ position: [0, 0.7, 5.2], fov: 36 }} shadows dpr={[1, 1.75]}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <MonitorScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
