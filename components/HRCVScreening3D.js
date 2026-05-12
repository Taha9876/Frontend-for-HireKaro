'use client';
import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Text, Stars, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Resume document with floating effect
function ResumeDocument({ position, delay = 0 }) {
  const meshRef = useRef(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + delay;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.05;
    meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.02;
    meshRef.current.rotation.z = Math.cos(t * 0.3) * 0.01;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.15}>
      <group position={position}>
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={[1.2, 1.6, 0.08]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.3} 
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[1.1, 1.5]} />
          <meshStandardMaterial 
            color="#f8fafc" 
            roughness={0.4}
          />
        </mesh>
        {/* Resume content lines */}
        <mesh position={[-0.45, 0.6, 0.06]}>
          <boxGeometry args={[0.6, 0.08, 0.01]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[-0.45, 0.4, 0.06]}>
          <boxGeometry args={[0.8, 0.04, 0.01]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[-0.45, 0.25, 0.06]}>
          <boxGeometry args={[0.7, 0.04, 0.01]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[-0.45, 0.1, 0.06]}>
          <boxGeometry args={[0.75, 0.04, 0.01]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>
    </Float>
  );
}

// AI processing node
function AIProcessor({ position }) {
  const coreRef = useRef(null);
  const ringsRef = useRef([]);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Core pulsing
    if (coreRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.1;
      coreRef.current.scale.set(scale, scale, scale);
    }
    
    // Rotating rings
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.x = t * (0.5 + i * 0.2);
        ring.rotation.y = t * (0.3 + i * 0.1);
      }
    });
  });

  return (
    <group position={position}>
      {/* Central AI core */}
      <mesh ref={coreRef} castShadow>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial 
          color="#1C1B2E" 
          roughness={0.1} 
          metalness={0.8}
          emissive="#1C1B2E"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Processing rings */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh 
          key={i}
          ref={el => ringsRef.current[i] = el}
          position={[0, 0, 0]}
        >
          <torusGeometry args={[1.2 + i * 0.3, 0.05, 16, 32]} />
          <meshStandardMaterial 
            color={i === 0 ? "#c026d3" : i === 1 ? "#9DBF9E" : "#7FA582"}
            roughness={0.2} 
            metalness={0.6}
            emissive={i === 0 ? "#c026d3" : i === 1 ? "#9DBF9E" : "#7FA582"}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Data flow particles
function DataFlowParticles() {
  const particlesRef = useRef(null);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 30; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2
        ],
        velocity: [
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ],
        scale: Math.random() * 0.05 + 0.02
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    particlesRef.current.children.forEach((child, i) => {
      const particle = particles[i];
      child.position.x += particle.velocity[0];
      child.position.y += particle.velocity[1];
      child.position.z += particle.velocity[2];
      child.rotation.x += 0.05;
      child.rotation.y += 0.03;
      
      // Wrap around
      if (Math.abs(child.position.x) > 3) particle.velocity[0] *= -1;
      if (Math.abs(child.position.y) > 2) particle.velocity[1] *= -1;
      if (Math.abs(child.position.z) > 1) particle.velocity[2] *= -1;
    });
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position} scale={particle.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial 
            color="#60a5fa" 
            roughness={0.1} 
            metalness={0.8}
            emissive="#60a5fa"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

// Candidate profile cards
function CandidateProfile({ position, score, name, delay = 0 }) {
  const cardRef = useRef(null);
  
  useFrame((state) => {
    if (!cardRef.current) return;
    const t = state.clock.getElapsedTime() + delay;
    cardRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.03;
  });

  const scoreColor = score >= 90 ? '#10b981' : score >= 75 ? '#f59e0b' : '#ef4444';

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.1}>
      <group ref={cardRef} position={position}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.0, 0.06]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.3} 
            metalness={0.1}
          />
        </mesh>
        
        {/* Profile header */}
        <mesh position={[0, 0.3, 0.04]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        
        {/* Score indicator */}
        <mesh position={[0, -0.1, 0.04]}>
          <boxGeometry args={[0.6, 0.08, 0.02]} />
          <meshStandardMaterial color={scoreColor} />
        </mesh>
        
        {/* Name text placeholder */}
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[0.6, 0.04]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </Float>
  );
}

// Skills visualization
function SkillsRadar({ position }) {
  const groupRef = useRef(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });

  const skills = [
    { name: 'JavaScript', level: 0.9, angle: 0 },
    { name: 'React', level: 0.85, angle: Math.PI / 3 },
    { name: 'Node.js', level: 0.8, angle: (2 * Math.PI) / 3 },
    { name: 'Python', level: 0.75, angle: Math.PI },
    { name: 'SQL', level: 0.7, angle: (4 * Math.PI) / 3 },
    { name: 'AWS', level: 0.65, angle: (5 * Math.PI) / 3 }
  ];

  return (
    <group ref={groupRef} position={position}>
      {/* Radar base */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.2, 32]} />
        <meshStandardMaterial 
          color="#e2e8f0" 
          roughness={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Skill bars */}
      {skills.map((skill, i) => (
        <group key={skill.name} rotation={[0, skill.angle, 0]}>
          <mesh position={[0, 0.5 + skill.level * 0.5, 0]}>
            <cylinderGeometry args={[0.03, 0.03, skill.level, 8]} />
            <meshStandardMaterial 
              color="#7FA582" 
              roughness={0.2}
              metalness={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Main HR CV Screening Scene
function HRCVScene() {
  return (
    <>
      <Environment preset="apartment" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-3, 4, -2]} intensity={0.8} color="#1C1B2E" />
      <pointLight position={[3, -2, 3]} intensity={0.6} color="#c026d3" />
      <pointLight position={[0, 6, 0]} intensity={0.4} color="#60a5fa" />
      
      {/* Resume documents being processed */}
      <ResumeDocument position={[-2.5, 0.5, 0]} delay={0} />
      <ResumeDocument position={[-2.5, -0.8, 0.5]} delay={1} />
      <ResumeDocument position={[-2.5, 0, -0.5]} delay={2} />
      
      {/* Central AI processor */}
      <AIProcessor position={[0, 0, 0]} />
      
      {/* Data flow particles */}
      <DataFlowParticles />
      
      {/* Processed candidate profiles */}
      <CandidateProfile position={[2.5, 0.8, 0]} score={95} name="Emma S." delay={0} />
      <CandidateProfile position={[2.5, -0.2, 0.5]} score={82} name="Marcus R." delay={1} />
      <CandidateProfile position={[2.5, -1.2, -0.5]} score={78} name="Ava K." delay={2} />
      
      {/* Skills radar visualization */}
      <SkillsRadar position={[0, -2, 0]} />
      
      {/* Ground shadow */}
      <ContactShadows 
        opacity={0.4} 
        scale={12} 
        blur={3.5} 
        far={10} 
        position={[0, -3, 0]} 
      />
    </>
  );
}

export default function HRCVScreening3D() {
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
        camera={{ position: [0, 1, 6], fov: 40 }}
        gl={{ 
          antialias: true, 
          alpha: true, 
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1
        }}
      >
        <Suspense fallback={null}>
          <HRCVScene />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={0.3}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
