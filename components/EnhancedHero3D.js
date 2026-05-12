'use client';
import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Text, Stars, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Brain geometry using mathematical functions
function BrainMesh({ position = [0, 0, 0] }) {
  const meshRef = useRef(null);
  const brainRef = useRef(null);

  useFrame((state) => {
    if (!brainRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Gentle floating and rotation
    brainRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.1;
    brainRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
    brainRef.current.rotation.x = Math.cos(t * 0.2) * 0.05;
    
    // Pulsing effect
    const scale = 1 + Math.sin(t * 2) * 0.02;
    brainRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={brainRef} position={position}>
      {/* Main brain structure */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial 
          color="#7FA582" 
          roughness={0.2} 
          metalness={0.3}
          emissive="#7FA582"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Brain lobes */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
        <mesh position={[0.3, 0.2, 0.4]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            color="#c026d3" 
            roughness={0.15} 
            metalness={0.4}
            emissive="#c026d3"
            emissiveIntensity={0.05}
          />
        </mesh>
        <mesh position={[-0.3, 0.2, 0.4]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            color="#9DBF9E" 
            roughness={0.15} 
            metalness={0.4}
            emissive="#9DBF9E"
            emissiveIntensity={0.05}
          />
        </mesh>
        <mesh position={[0, -0.3, 0.5]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial 
            color="#1C1B2E" 
            roughness={0.15} 
            metalness={0.4}
            emissive="#1C1B2E"
            emissiveIntensity={0.05}
          />
        </mesh>
      </Float>
      
      {/* Neural connections */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 1.5;
        return (
          <Float key={i} speed={2 + i * 0.2} rotationIntensity={0.4} floatIntensity={0.3}>
            <mesh 
              position={[
                Math.cos(angle) * radius, 
                Math.sin(angle * 2) * 0.3, 
                Math.sin(angle) * radius
              ]}
            >
              <torusGeometry args={[0.05, 0.02, 8, 16]} />
              <meshStandardMaterial 
                color="#60a5fa" 
                roughness={0.1} 
                metalness={0.6}
                emissive="#60a5fa"
                emissiveIntensity={0.2}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

// Floating data particles
function DataParticles() {
  const particlesRef = useRef(null);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 50; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ],
        scale: Math.random() * 0.1 + 0.05,
        speed: Math.random() * 0.5 + 0.5
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const t = state.clock.getElapsedTime();
    
    particlesRef.current.children.forEach((child, i) => {
      const particle = particles[i];
      child.position.y += Math.sin(t * particle.speed + i) * 0.01;
      child.rotation.x += 0.01;
      child.rotation.y += 0.01;
    });
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position} scale={particle.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="#e879f9" 
            roughness={0.1} 
            metalness={0.8}
            emissive="#e879f9"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Resume/CV floating elements
function ResumeElements() {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05;
  });

  return (
    <group ref={groupRef} position={[2, 0, 0]}>
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.3}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.8, 1, 0.1]} />
          <meshStandardMaterial 
            color="#1e293b" 
            roughness={0.2} 
            metalness={0.3}
          />
        </mesh>
        <mesh position={[0, 0.5, 0.06]}>
          <planeGeometry args={[0.7, 0.9]} />
          <meshStandardMaterial 
            color="#0f172a" 
            roughness={0.3}
          />
        </mesh>
      </Float>
      
      <Float speed={2.2} rotationIntensity={0.3} floatIntensity={0.25}>
        <mesh position={[0, -0.8, 0.2]}>
          <boxGeometry args={[0.6, 0.8, 0.08]} />
          <meshStandardMaterial 
            color="#334155" 
            roughness={0.25} 
            metalness={0.2}
          />
        </mesh>
      </Float>
    </group>
  );
}

// Main scene component
function Scene() {
  return (
    <>
      <Environment preset="city" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.8} color="#7FA582" />
      <pointLight position={[5, -5, 5]} intensity={0.6} color="#c026d3" />
      <pointLight position={[0, 10, 0]} intensity={0.4} color="#60a5fa" />
      
      {/* Main 3D elements */}
      <BrainMesh position={[0, 0, 0]} />
      <DataParticles />
      <ResumeElements />
      
      {/* Ground shadow */}
      <ContactShadows 
        opacity={0.3} 
        scale={10} 
        blur={3} 
        far={8} 
        position={[0, -2, 0]} 
      />
    </>
  );
}

export default function EnhancedHero3D() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className="relative w-full h-[480px] md:h-[560px] lg:h-[650px]"
    >
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-purple-deep/10 via-transparent to-transparent blur-2xl -rotate-6" />
      <div className="absolute inset-0 rounded-[2.5rem]" style={{ background: 'radial-gradient(circle at 35% 30%, rgba(127, 165, 130,0.12), rgba(255,255,255,0) 55%)' }} />
      
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true, 
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
