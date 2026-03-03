import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TransformControls, OrbitControls, OrthographicCamera } from '@react-three/drei';

const snapToGrid = (value, gridSize = 0.5) => Math.round(value / gridSize) * gridSize;

// FurnitureObject: individual 3D object that syncs bidirectionally with React state
function FurnitureObject({ id, position, scale, color, isSelected, onSelect, onTransformChange, snapEnabled }) {
  const groupRef = useRef(null);
  const transformRef = useRef(null);
  // isDraggingRef: true while the user is actively dragging via TransformControls.
  // Prevents the prop→Three.js useEffect from fighting the live drag.
  const isDraggingRef = useRef(false);
  const lastStateRef = useRef({ pos: null, scl: null });
  const FLOOR_Y = -1.25;

  // Subscribe to TransformControls 'dragging-changed' so we know when a drag starts/ends
  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;
    const handler = (e) => { isDraggingRef.current = e.value; };
    controls.addEventListener('dragging-changed', handler);
    return () => controls.removeEventListener('dragging-changed', handler);
  }, []);

  // Sidebar → Three.js: when props change and we are NOT dragging, push values to the mesh
  useEffect(() => {
    if (groupRef.current && !isDraggingRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.scale.set(scale[0], scale[1], scale[2]);
    }
  }, [position, scale]);

  // Three.js → React: while dragging, read position from the mesh and push to state
  useFrame(() => {
    if (!groupRef.current || !isDraggingRef.current) return;

    const pos = groupRef.current.position;
    const scl = groupRef.current.scale;
    if (!pos || !scl) return;

    // Floor constraint
    if (pos.y < FLOOR_Y) pos.y = FLOOR_Y;

    // Grid snapping
    if (snapEnabled) {
      pos.x = snapToGrid(pos.x);
      pos.y = snapToGrid(pos.y);
      pos.z = snapToGrid(pos.z);
    }

    const posChanged =
      !lastStateRef.current.pos ||
      Math.abs(pos.x - lastStateRef.current.pos.x) > 0.005 ||
      Math.abs(pos.y - lastStateRef.current.pos.y) > 0.005 ||
      Math.abs(pos.z - lastStateRef.current.pos.z) > 0.005;

    const sclChanged =
      !lastStateRef.current.scl ||
      Math.abs(scl.x - lastStateRef.current.scl.x) > 0.005 ||
      Math.abs(scl.y - lastStateRef.current.scl.y) > 0.005 ||
      Math.abs(scl.z - lastStateRef.current.scl.z) > 0.005;

    if (posChanged || sclChanged) {
      try {
        lastStateRef.current = { pos: pos.clone(), scl: scl.clone() };
        onTransformChange?.({
          position: [pos.x, pos.y, pos.z],
          scale: [scl.x, scl.y, scl.z],
        });
      } catch (_) {}
    }
  });

  return (
    <TransformControls ref={transformRef} mode="translate" size={0.8}>
      <group
        ref={groupRef}
        onClick={(e) => { e.stopPropagation(); onSelect?.(id); }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1.5, 1]} />
          {/* Color comes from props — updating it in React re-renders the material in real time */}
          <meshStandardMaterial
            color={isSelected ? '#d45c5c' : color}
            metalness={0.2}
            roughness={0.6}
            emissive={isSelected ? '#6b1c1c' : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : 0}
          />
        </mesh>
      </group>
    </TransformControls>
  );
}

// Default items used when FurnitureItem is rendered without external state (e.g. Dashboard)
const DEFAULT_ITEMS = [
  { id: 1, position: [-2, -1.25, 0], scale: [1, 1, 1], color: '#4a90e2' },
  { id: 2, position: [2,  -1.25, 0], scale: [1, 1, 1], color: '#6b4f35' },
  { id: 3, position: [0,  -1.25, 0], scale: [1, 1, 1], color: '#5a9e6f' },
];

/**
 * FurnitureItem can run in two modes:
 *   Controlled  – pass externalItems / selectedId / onSelect / onTransformChange (used by Design.js)
 *   Uncontrolled – omit those props; internal state is used instead (used by Dashboard.js)
 */
function FurnitureItem({
  externalItems,
  selectedId: externalSelectedId,
  onSelect: externalOnSelect,
  onTransformChange: externalOnTransformChange,
  snapToGridEnabled: externalSnap,
}) {
  const isControlled = externalItems !== undefined;

  const [internalItems, setInternalItems] = useState(DEFAULT_ITEMS);
  const [internalSnap, setInternalSnap]   = useState(true);
  const [internalSelectedId, setInternalSelectedId] = useState(null);

  const items      = isControlled ? externalItems          : internalItems;
  const snapEnabled = externalSnap !== undefined ? externalSnap : internalSnap;
  const selectedId = isControlled ? externalSelectedId  : internalSelectedId;

  const [is2DMode, setIs2DMode] = useState(false);

  const handleSelect = (id) => {
    const next = id === selectedId ? null : id; // click again to deselect
    if (isControlled) externalOnSelect?.(next);
    else setInternalSelectedId(next);
  };

  const handleTransformChange = (id, data) => {
    if (isControlled) {
      externalOnTransformChange?.(id, data);
    } else {
      setInternalItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Snap-to-grid toolbar — only shown in uncontrolled (Dashboard) mode */}
      {!isControlled && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#f0ebe0',
          borderBottom: '1px solid #d4c5a9',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#6b4f35' }}>
            <input
              type="checkbox"
              checked={snapEnabled}
              onChange={(e) => setInternalSnap(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#6b4f35' }}
            />
            Snap to Grid (0.5 units)
          </label>
          <span style={{ fontSize: '12px', color: '#8b6f47' }}>Floor constraint always active</span>
        </div>
      )}

      {/* View mode toggle */}
      <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#fff0', flexShrink: 0 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#6b4f35' }}>
          <input
            type="checkbox"
            checked={is2DMode}
            onChange={(e) => setIs2DMode(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: '#6b4f35' }}
          />
          Top-down 2D View
        </label>
      </div>

      {/* 3-D Canvas */}
      <Canvas shadows style={{ flex: 1 }}>
        {is2DMode ? (
          <OrthographicCamera makeDefault position={[0, 10, 0]} rotation={[-Math.PI / 2, 0, 0]} zoom={40} near={0.1} far={1000} />
        ) : (
          <perspectiveCamera makeDefault position={[0, 5, 8]} fov={50} />
        )}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 5, 5]} intensity={0.4} />

        {/* Ground plane */}
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#d6cfc2" />
        </mesh>

        {items.map((item) => (
          <FurnitureObject
            key={item.id}
            id={item.id}
            position={item.position}
            scale={item.scale}
            color={item.color}
            isSelected={item.id === selectedId}
            onSelect={handleSelect}
            onTransformChange={(data) => handleTransformChange(item.id, data)}
            snapEnabled={snapEnabled}
          />
        ))}

        <OrbitControls enableZoom enablePan enableRotate={!is2DMode} />
        <gridHelper args={[20, 20]} position={[0, -1.9, 0]} />
      </Canvas>
    </div>
  );
}

export default FurnitureItem;
