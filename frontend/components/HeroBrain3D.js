'use client';
import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, RoundedBox, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

function ResumeScreen() {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.14) * 0.1;
    ref.current.rotation.x = Math.sin(t * 0.06) * 0.05;
  });

  return (
    <group ref={ref}>
      <Float speed={1.2} rotationIntensity={0.28} floatIntensity={0.32}>
        <RoundedBox args={[3.2, 1.9, 0.24]} radius={0.26} smoothness={10} castShadow receiveShadow>
          <meshStandardMaterial color="#111827" roughness={0.14} metalness={0.28} />
        </RoundedBox>
      </Float>

      <Float speed={1.5} rotationIntensity={0.35} floatIntensity={0.18}>
        <group position={[0, 0.08, 0.12]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2.9, 1.6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.22} metalness={0.1} transparent opacity={0.94} />
          </mesh>

          <Text position={[-1.24, 0.62, 0.05]} fontSize={0.1} color="#c7d2fe" anchorX="left" anchorY="middle">
            Resume screening
          </Text>
          <Text position={[-1.24, 0.45, 0.05]} fontSize={0.07} color="#94a3b8" anchorX="left" anchorY="middle">
            CV parsing + AI fit score
          </Text>

          <RoundedBox args={[1.88, 0.16, 0.04]} radius={0.08} smoothness={6} position={[-0.05, 0.2, 0.05]}>
            <meshStandardMaterial color="#7c3aed" />
          </RoundedBox>
          <RoundedBox args={[1.88, 0.10, 0.04]} radius={0.08} smoothness={6} position={[-0.05, 0.05, 0.05]}>
            <meshStandardMaterial color="#1f2937" />
          </RoundedBox>

          <group position={[-1.15, -0.18, 0.05]}>
            {[0.6, 0.42, 0.32].map((width, idx) => (
              <RoundedBox
                key={idx}
                args={[width, 0.1, 0.04]}
                radius={0.06}
                smoothness={6}
                position={[0, -idx * 0.14, 0]}
              >
                <meshStandardMaterial color={idx === 0 ? '#8b5cf6' : idx === 1 ? '#c026d3' : '#60a5fa'} />
              </RoundedBox>
            ))}
          </group>

          <RoundedBox args={[0.62, 0.22, 0.04]} radius={0.08} smoothness={6} position={[1.02, -0.24, 0.05]}>
            <meshStandardMaterial color="#111827" roughness={0.26} metalness={0.1} />
          </RoundedBox>
          <Text position={[1.02, -0.24, 0.08]} fontSize={0.07} color="#c7d2fe" anchorX="center" anchorY="middle">
            92%
          </Text>
        </group>
      </Float>

      <Float speed={1.35} rotationIntensity={0.32} floatIntensity={0.28}>
        <mesh position={[1.6, 0.78, 0.12]}>
          <torusGeometry args={[0.18, 0.04, 24, 48]} />
          <meshStandardMaterial color="#8b5cf6" metalness={0.5} roughness={0.15} />
        </mesh>
      </Float>
    </group>
  );
}

function ProfileCard({ position, rotation, accent, name, role }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = rotation[1] + Math.sin(t * 0.7 + position[0]) * 0.05;
    ref.current.rotation.x = rotation[0] + Math.sin(t * 0.55 + position[2]) * 0.03;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <RoundedBox args={[1.18, 0.7, 0.12]} radius={0.16} smoothness={8} castShadow receiveShadow>
        <meshStandardMaterial color="#111827" roughness={0.18} metalness={0.22} />
      </RoundedBox>
      <RoundedBox args={[1.18, 0.7, 0.14]} radius={0.16} smoothness={8}>
        <meshStandardMaterial color={accent} transparent opacity={0.08} roughness={0.48} />
      </RoundedBox>
      <Text position={[-0.52, 0.2, 0.08]} fontSize={0.08} color="#e2e8f0" anchorX="left" anchorY="middle">
        {name}
      </Text>
      <Text position={[-0.52, -0.02, 0.08]} fontSize={0.065} color="#94a3b8" anchorX="left" anchorY="middle">
        {role}
      </Text>
      <RoundedBox args={[0.62, 0.08, 0.04]} radius={0.05} smoothness={6} position={[-0.5, -0.26, 0.08]}>
        <meshStandardMaterial color="#111827" />
      </RoundedBox>
      <RoundedBox args={[0.22, 0.08, 0.045]} radius={0.05} smoothness={6} position={[-0.5, -0.26, 0.11]}>
        <meshStandardMaterial color={accent} />
      </RoundedBox>
      <Text position={[0.52, -0.26, 0.08]} fontSize={0.07} color="#c7d2fe" anchorX="right" anchorY="middle">
        ✓ Fit
      </Text>
    </group>
  );
}

function Scene() {
  const profiles = useMemo(
    () => [
      { position: [1.85, 0.85, -0.36], rotation: [0.04, -0.46, 0.02], accent: '#8b5cf6', name: 'Emma S.', role: 'Senior Engineer' },
      { position: [-2.05, -0.18, -0.62], rotation: [-0.03, 0.54, -0.04], accent: '#c026d3', name: 'Marcus R.', role: 'Product Lead' },
      { position: [1.55, -0.92, -0.42], rotation: [0.02, -0.31, 0.03], accent: '#60a5fa', name: 'Ava K.', role: 'Talent Ops' },
    ],
    []
  );

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 6, 4]} intensity={1.02} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-4.5, 1.8, -1.6]} intensity={0.65} color="#c026d3" />
      <pointLight position={[4.8, -0.8, 1.8]} intensity={0.55} color="#8b5cf6" />

      <group position={[0, 0.1, 0]}>
        <ResumeScreen />
      </group>

      {profiles.map((profile) => (
        <ProfileCard key={profile.name} {...profile} />
      ))}

      <ContactShadows opacity={0.22} scale={8} blur={2.8} far={5.5} position={[0, -1.35, 0]} />
    </>
  );
}

export default function HeroBrain3D() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className="relative w-full h-[480px] md:h-[560px] lg:h-[650px]"
    >
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-purple-deep/10 via-transparent to-transparent blur-2xl -rotate-6" />
      <div className="absolute inset-0 rounded-[2.5rem]" style={{ background: 'radial-gradient(circle at 35% 30%, rgba(139,92,246,0.12), rgba(255,255,255,0) 55%)' }} />
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.35, 4.8], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
