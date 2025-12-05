import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_REGIONS } from '../constants';

interface Scene3DProps {
  interactionRef: React.MutableRefObject<{
    rotation: { x: number; y: number };
    scale: number;
  }>;
  onRegionUpdate: (region: string) => void;
}

const EarthMesh: React.FC<{
  interactionRef: React.MutableRefObject<{ rotation: { x: number; y: number }; scale: number }>;
  onRegionUpdate: (region: string) => void;
}> = ({ interactionRef, onRegionUpdate }) => {
  const earthRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Load texture manually to avoid suspense blocking in this strict output format
  // In a real app, useLoader(TextureLoader) is fine.
  const map = useMemo(() => new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'), []);
  
  useFrame((state, delta) => {
    if (earthRef.current) {
      // Lerp rotation for smooth movement
      const targetRotX = interactionRef.current.rotation.x;
      const targetRotY = interactionRef.current.rotation.y;
      const targetScale = interactionRef.current.scale;
      
      earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x, targetRotX, delta * 5);
      earthRef.current.rotation.y = THREE.MathUtils.lerp(earthRef.current.rotation.y, targetRotY, delta * 5);
      
      const currentScale = earthRef.current.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 5);
      earthRef.current.scale.set(nextScale, nextScale, nextScale);

      // Determine region
      let normalizedY = earthRef.current.rotation.y % (Math.PI * 2);
      if (normalizedY < 0) normalizedY += Math.PI * 2;
      
      const region = EARTH_REGIONS.find(r => normalizedY >= r.min && normalizedY < r.max)?.name || 'UNKNOWN';
      onRegionUpdate(region);
    }
    
    // Animate atmosphere glow
    if (glowRef.current) {
        glowRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group ref={earthRef} position={[-1.5, 0, 0]}>
      {/* Core Earth */}
      <Sphere args={[1, 64, 64]}>
        <meshPhongMaterial
          map={map}
          specular={new THREE.Color('#00FFFF')}
          shininess={15}
          emissive={new THREE.Color('#002222')}
          emissiveIntensity={0.8}
          transparent={true}
          opacity={0.9}
        />
      </Sphere>
      
      {/* Wireframe Grid */}
      <Sphere args={[1.05, 32, 32]}>
        <meshBasicMaterial
          color="#00FFFF"
          wireframe={true}
          transparent={true}
          opacity={0.15}
        />
      </Sphere>

      {/* Holographic Atmosphere Ring */}
      <mesh ref={glowRef}>
        <ringGeometry args={[1.2, 1.25, 64]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Scene3D: React.FC<Scene3DProps> = ({ interactionRef, onRegionUpdate }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 20, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00FFFF" />
        <EarthMesh interactionRef={interactionRef} onRegionUpdate={onRegionUpdate} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
