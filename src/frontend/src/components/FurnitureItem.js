import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TransformControls, OrbitControls } from '@react-three/drei';

// FurnitureObject component for individual furniture items
function FurnitureObject({ initialPosition, initialScale, onTransformChange }) {
  const groupRef = useRef(null);
  const transformRef = useRef(null);
  const [isSelected, setIsSelected] = useState(false);
  const lastStateRef = useRef({ pos: null, scl: null });

  // Handle click to select
  const handleClick = (e) => {
    e.stopPropagation();
    setIsSelected(!isSelected);
  };

  // Set initial position and scale
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(initialPosition[0], initialPosition[1], initialPosition[2]);
      groupRef.current.scale.set(initialScale[0], initialScale[1], initialScale[2]);
    }
  }, [initialPosition, initialScale]);

  // Track changes using useFrame
  useFrame(() => {
    if (!groupRef.current) return;

    const pos = groupRef.current.position;
    const scl = groupRef.current.scale;

    // Verify pos and scl exist
    if (!pos || !scl) return;

    // Only log if position or scale changed
    const posChanged = !lastStateRef.current.pos || 
      (Math.abs(pos.x - lastStateRef.current.pos.x) > 0.01 ||
       Math.abs(pos.y - lastStateRef.current.pos.y) > 0.01 ||
       Math.abs(pos.z - lastStateRef.current.pos.z) > 0.01);

    const sclChanged = !lastStateRef.current.scl ||
      (Math.abs(scl.x - lastStateRef.current.scl.x) > 0.01 ||
       Math.abs(scl.y - lastStateRef.current.scl.y) > 0.01 ||
       Math.abs(scl.z - lastStateRef.current.scl.z) > 0.01);

    if (posChanged || sclChanged) {
      try {
        lastStateRef.current = { 
          pos: pos.clone(), 
          scl: scl.clone() 
        };

        console.log('Furniture Item Updated:', {
          position: { x: pos.x.toFixed(2), y: pos.y.toFixed(2), z: pos.z.toFixed(2) },
          scale: { x: scl.x.toFixed(2), y: scl.y.toFixed(2), z: scl.z.toFixed(2) }
        });

        onTransformChange?.({
          position: { x: pos.x, y: pos.y, z: pos.z },
          scale: { x: scl.x, y: scl.y, z: scl.z }
        });
      } catch (e) {
        // Silently ignore if clone() fails
      }
    }
  });

  return (
    <TransformControls
      ref={transformRef}
      mode="translate"
      size={0.8}
    >
      <group ref={groupRef}>
        <mesh onClick={handleClick} castShadow receiveShadow>
          <boxGeometry args={[1, 1.5, 1]} />
          <meshStandardMaterial
            color={isSelected ? '#ff6b6b' : '#4a90e2'}
            metalness={0.3}
            roughness={0.6}
            emissive={isSelected ? '#ff3333' : '#000000'}
          />
        </mesh>
      </group>
    </TransformControls>
  );
}

// Main FurnitureItem component with Canvas
function FurnitureItem() {
  const [items, setItems] = useState([
    { id: 1, position: [-2, 0, 0], scale: [1, 1, 1] },
    { id: 2, position: [2, 0, 0], scale: [1, 1, 1] },
    { id: 3, position: [0, 0, 0], scale: [1, 1, 1] }
  ]);

  const handleTransformChange = (itemId, data) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, position: data.position, scale: data.scale } : item
    ));
  };

  return (
    <Canvas shadows camera={{ position: [0, 5, 8], fov: 50 }}>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.8}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        castShadow
      />
      <pointLight position={[-10, 5, 5]} intensity={0.4} />

      {/* Ground plane */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* Furniture items */}
      {items.map(item => (
        <FurnitureObject
          key={item.id}
          initialPosition={item.position}
          initialScale={item.scale}
          onTransformChange={(data) => handleTransformChange(item.id, data)}
        />
      ))}

      {/* Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
      />

      {/* Grid helper for reference */}
      <gridHelper args={[20, 20]} position={[0, -1.9, 0]} />
    </Canvas>
  );
}

export default FurnitureItem;
