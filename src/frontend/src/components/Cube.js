import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';

function Cube() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" flatShading={true} metalness={0.1} roughness={0.8} />
        <Edges scale={1.01} color="black" />
      </mesh>
      <OrbitControls />
    </Canvas>
  );
}

export default Cube;