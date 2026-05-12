'use client';
import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Text, Stars, OrbitControls, useTexture } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Professional resume document with advanced geometry
function ProfessionalResume({ position, rotation, delay = 0 }) {
  const meshRef = useRef(null);
  const pagesRef = useRef([]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + delay;
    
    // Subtle floating animation
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.08;
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * 0.4) * 0.02;
    meshRef.current.rotation.z = rotation[2] + Math.cos(t * 0.3) * 0.01;
    
    // Page turning effect
    pagesRef.current.forEach((page, i) => {
      if (page) {
        page.rotation.y = Math.sin(t * 0.5 + i * 0.2) * 0.1;
      }
    });
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Main resume cover */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.8, 0.1]} />
        <meshPhysicalMaterial 
          color="#f8fafc" 
          roughness={0.4}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>
      
      {/* Individual pages with depth */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh 
          key={i}
          ref={el => pagesRef.current[i] = el}
          position={[0, 0, 0.05 + i * 0.015]}
          castShadow
        >
          <boxGeometry args={[1.35, 1.75, 0.008]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#ffffff" : "#f1f5f9"} 
            roughness={0.6}
            metalness={0.05}
          />
        </mesh>
      ))}
      
      {/* Professional content elements */}
      <mesh position={[-0.55, 0.65, 0.06]}>
        <boxGeometry args={[0.7, 0.12, 0.01]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.55, 0.45, 0.06]}>
        <boxGeometry args={[0.9, 0.06, 0.01]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[-0.55, 0.3, 0.06]}>
        <boxGeometry args={[0.85, 0.06, 0.01]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      
      {/* Professional sections */}
      <mesh position={[-0.55, 0.05, 0.06]}>
        <boxGeometry args={[0.4, 0.08, 0.01]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.2, 0.05, 0.06]}>
        <boxGeometry args={[0.5, 0.08, 0.01]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

// Advanced AI processing core with complex geometry
function AIProcessingCore({ position }) {
  const coreRef = useRef(null);
  const ringsRef = useRef([]);
  const particlesRef = useRef([]);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Core pulsing with complex motion
    if (coreRef.current) {
      const scale = 1 + Math.sin(t * 2.5) * 0.15;
      coreRef.current.scale.set(scale, scale, scale);
      coreRef.current.rotation.x = t * 0.3;
      coreRef.current.rotation.y = t * 0.2;
    }
    
    // Complex ring rotations
    ringsRef.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.x = t * (0.8 + i * 0.3);
        ring.rotation.y = t * (0.5 + i * 0.2);
        ring.rotation.z = t * (0.2 + i * 0.1);
      }
    });
    
    // Particle system
    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        const angle = (i / particlesRef.current.length) * Math.PI * 2;
        const radius = 1.5 + Math.sin(t + i) * 0.3;
        particle.position.x = Math.cos(angle + t) * radius;
        particle.position.y = Math.sin(angle + t * 0.5) * radius * 0.5;
        particle.position.z = Math.sin(angle + t * 0.3) * radius * 0.3;
        particle.rotation.x += 0.05;
        particle.rotation.y += 0.03;
      }
    });
  });

  return (
    <group position={position}>
      {/* Central AI core with icosahedron */}
      <mesh ref={coreRef} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial 
          color="#1C1B2E" 
          roughness={0.1}
          metalness={0.8}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
          emissive="#1C1B2E"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Complex processing rings */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i}>
          <mesh ref={el => ringsRef.current[i] = el}>
            <torusGeometry args={[1.2 + i * 0.4, 0.08, 16, 48]} />
            <meshPhysicalMaterial 
              color={i === 0 ? "#c026d3" : i === 1 ? "#9DBF9E" : i === 2 ? "#7FA582" : "#6366f1"}
              roughness={0.15}
              metalness={0.7}
              clearcoat={0.3}
              emissive={i === 0 ? "#c026d3" : i === 1 ? "#9DBF9E" : i === 2 ? "#7FA582" : "#6366f1"}
              emissiveIntensity={0.15}
            />
          </mesh>
          <mesh ref={el => ringsRef.current[i + 4] = el} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.2 + i * 0.4, 0.06, 12, 32]} />
            <meshPhysicalMaterial 
              color="#60a5fa"
              roughness={0.2}
              metalness={0.6}
              emissive="#60a5fa"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      ))}
      
      {/* Orbiting particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh 
          key={i}
          ref={el => particlesRef.current[i] = el}
          castShadow
        >
          <octahedronGeometry args={[0.05, 0]} />
          <meshPhysicalMaterial 
            color="#fbbf24" 
            roughness={0.1}
            metalness={0.9}
            emissive="#fbbf24"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Professional data visualization network
function DataNetwork({ position }) {
  const networkRef = useRef(null);
  const connectionsRef = useRef([]);
  
  useFrame((state) => {
    if (!networkRef.current) return;
    const t = state.clock.getElapsedTime();
    
    networkRef.current.rotation.y = t * 0.1;
    
    // Animated connections
    connectionsRef.current.forEach((connection, i) => {
      if (connection) {
        connection.scale.y = 0.5 + Math.sin(t * 2 + i * 0.5) * 0.5;
      }
    });
  });

  const nodes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        Math.cos((i / 8) * Math.PI * 2) * 2,
        Math.sin((i / 8) * Math.PI * 2) * 0.5,
        Math.sin((i / 8) * Math.PI * 2) * 2
      ],
      scale: 0.1 + Math.random() * 0.1
    }));
  }, []);

  return (
    <group ref={networkRef} position={position}>
      {/* Network nodes */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position} scale={node.scale} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial 
            color="#10b981" 
            roughness={0.2}
            metalness={0.6}
            clearcoat={0.4}
            emissive="#10b981"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
      
      {/* Network connections */}
      {nodes.map((node, i) => 
        nodes.slice(i + 1).map((targetNode, j) => {
          const distance = node.position[0] - targetNode.position[0];
          if (Math.abs(distance) < 1.5) {
            return (
              <mesh 
                key={`connection-${i}-${j}`}
                ref={el => connectionsRef.current.push(el)}
                position={[
                  (node.position[0] + targetNode.position[0]) / 2,
                  (node.position[1] + targetNode.position[1]) / 2,
                  (node.position[2] + targetNode.position[2]) / 2
                ]}
              >
                <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
                <meshPhysicalMaterial 
                  color="#3b82f6" 
                  roughness={0.3}
                  metalness={0.5}
                  emissive="#3b82f6"
                  emissiveIntensity={0.1}
                />
              </mesh>
            );
          }
          return null;
        })
      )}
    </group>
  );
}

// Professional candidate evaluation display
function CandidateEvaluation({ position, score, name, delay = 0 }) {
  const cardRef = useRef(null);
  const scoreRingRef = useRef(null);
  
  useFrame((state) => {
    if (!cardRef.current) return;
    const t = state.clock.getElapsedTime() + delay;
    
    cardRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.05;
    
    if (scoreRingRef.current) {
      scoreRingRef.current.rotation.z = t * 0.5;
    }
  });

  const scoreColor = score >= 90 ? '#10b981' : score >= 75 ? '#f59e0b' : '#ef4444';
  const scoreAngle = (score / 100) * Math.PI * 2;

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.15}>
      <group ref={cardRef} position={position}>
        {/* Professional card base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.0, 1.2, 0.08]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            roughness={0.3}
            metalness={0.1}
            clearcoat={0.2}
          />
        </mesh>
        
        {/* Glass overlay effect */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.95, 1.15, 0.02]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            roughness={0.1}
            metalness={0.1}
            transmission={0.9}
            thickness={0.5}
          />
        </mesh>
        
        {/* Profile avatar */}
        <mesh position={[0, 0.35, 0.06]}>
          <circleGeometry args={[0.2, 32]} />
          <meshPhysicalMaterial 
            color="#e2e8f0" 
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
        
        {/* Professional score ring */}
        <group position={[0, -0.15, 0.06]}>
          <mesh ref={scoreRingRef}>
            <torusGeometry args={[0.35, 0.06, 16, 32]} />
            <meshPhysicalMaterial 
              color="#e2e8f0" 
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
          <mesh rotation={[0, 0, scoreAngle]}>
            <torusGeometry args={[0.35, 0.06, 16, 32, 0, scoreAngle]} />
            <meshPhysicalMaterial 
              color={scoreColor} 
              roughness={0.2}
              metalness={0.4}
              emissive={scoreColor}
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
        
        {/* Name placeholder */}
        <mesh position={[0, 0, 0.07]}>
          <planeGeometry args={[0.7, 0.06]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </Float>
  );
}

// Professional skills visualization
function SkillsVisualization({ position }) {
  const groupRef = useRef(null);
  const skillBarsRef = useRef([]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    
    // Animated skill bars
    skillBarsRef.current.forEach((bar, i) => {
      if (bar) {
        const targetScale = 0.3 + (i + 1) * 0.15;
        bar.scale.y = targetScale * (0.8 + Math.sin(state.clock.getElapsedTime() * 2 + i) * 0.2);
      }
    });
  });

  const skills = [
    { name: 'Leadership', level: 0.9, color: '#7FA582' },
    { name: 'Communication', level: 0.85, color: '#c026d3' },
    { name: 'Technical', level: 0.8, color: '#9DBF9E' },
    { name: 'Analytics', level: 0.75, color: '#1C1B2E' },
    { name: 'Strategy', level: 0.7, color: '#6366f1' },
    { name: 'Innovation', level: 0.65, color: '#60a5fa' }
  ];

  return (
    <group ref={groupRef} position={position}>
      {/* Base platform */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
        <meshPhysicalMaterial 
          color="#f8fafc" 
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      
      {/* Skill bars */}
      {skills.map((skill, i) => {
        const angle = (i / skills.length) * Math.PI * 2;
        return (
          <group key={skill.name} rotation={[0, angle, 0]}>
            <mesh 
              ref={el => skillBarsRef.current[i] = el}
              position={[0.8, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
              <meshPhysicalMaterial 
                color={skill.color} 
                roughness={0.2}
                metalness={0.6}
                clearcoat={0.3}
                emissive={skill.color}
                emissiveIntensity={0.1}
              />
            </mesh>
          </group>
        );
      })}
      
      {/* Central core */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <octahedronGeometry args={[0.3, 0]} />
        <meshPhysicalMaterial 
          color="#1e293b" 
          roughness={0.2}
          metalness={0.7}
          clearcoat={0.4}
        />
      </mesh>
    </group>
  );
}

// Main professional HR scene
function ProfessionalHRScene() {
  return (
    <>
      <Environment preset="city" />
      <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={0.8} />
      
      {/* Professional lighting setup */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[8, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={4096} 
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-5, 8, -5]} intensity={1.2} color="#1C1B2E" />
      <pointLight position={[5, 6, 5]} intensity={1.0} color="#c026d3" />
      <pointLight position={[0, 10, 0]} intensity={0.8} color="#60a5fa" />
      <spotLight 
        position={[0, 15, 0]} 
        angle={0.3} 
        penumbra={0.5} 
        intensity={0.5} 
        color="#ffffff" 
        castShadow 
      />
      
      {/* Professional resume documents */}
      <ProfessionalResume position={[-3, 1, 0]} rotation={[0, 0.2, 0]} delay={0} />
      <ProfessionalResume position={[-3, -0.5, 0.5]} rotation={[0, -0.1, 0.1]} delay={1} />
      <ProfessionalResume position={[-3, 0, -0.5]} rotation={[0, 0.15, -0.05]} delay={2} />
      
      {/* Central AI processing core */}
      <AIProcessingCore position={[0, 0, 0]} />
      
      {/* Professional data network */}
      <DataNetwork position={[0, -2, 0]} />
      
      {/* Professional candidate evaluations */}
      <CandidateEvaluation position={[3, 1.2, 0]} score={95} name="Emma S." delay={0} />
      <CandidateEvaluation position={[3, 0, 0.5]} score={82} name="Marcus R." delay={1} />
      <CandidateEvaluation position={[3, -1.2, -0.5]} score={78} name="Ava K." delay={2} />
      
      {/* Professional skills visualization */}
      <SkillsVisualization position={[0, -3.5, 0]} />
      
      {/* Professional ground shadow */}
      <ContactShadows 
        opacity={0.5} 
        scale={20} 
        blur={4} 
        far={15} 
        position={[0, -5, 0]} 
      />
    </>
  );
}

export default function ProfessionalHR3D() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="relative w-full h-[480px] md:h-[560px] lg:h-[650px]"
    >
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-purple-deep/10 via-transparent to-transparent blur-2xl -rotate-6" />
      <div className="absolute inset-0 rounded-[2.5rem]" style={{ background: 'radial-gradient(circle at 35% 30%, rgba(127, 165, 130,0.12), rgba(255,255,255,0) 55%)' }} />
      
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2, 8], fov: 35 }}
        gl={{ 
          antialias: true, 
          alpha: true, 
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
          shadowMap: THREE.PCFSoftShadowMap
        }}
      >
        <Suspense fallback={null}>
          <ProfessionalHRScene />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate={true}
            autoRotateSpeed={0.4}
            maxPolarAngle={Math.PI / 2.5}
            minPolarAngle={Math.PI / 3.5}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
