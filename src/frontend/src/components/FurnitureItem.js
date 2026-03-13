import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  TransformControls,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from '@react-three/drei';

const snapToGrid = (value, gridSize = 0.5) =>
  Math.round(value / gridSize) * gridSize;

// ─── Per-type furniture geometry ─────────────────────────────────────────────
function getFurnitureArgs(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('sofa'))                               return [2.0,  0.75, 0.9];
  if (n.includes('bed'))                                return [1.4,  0.4,  2.0];
  if (n.includes('wardrobe') || n.includes('cabinet'))  return [1.2,  2.0,  0.55];
  if (n.includes('table') || n.includes('desk'))        return [1.5,  0.08, 0.9];
  if (n.includes('lamp'))                               return [0.3,  1.6,  0.3];
  if (n.includes('shelf') || n.includes('bookcase'))    return [1.2,  1.8,  0.3];
  if (n.includes('chair'))                              return [0.65, 1.0,  0.65];
  return [0.8, 1.2, 0.8];
}

// ─── Individual furniture object with TransformControls ──────────────────────
function FurnitureObject({
  id, name, position, scale, color,
  isSelected, onSelect, onTransformChange, snapEnabled, onDragging,
}) {
  const groupRef     = useRef(null);
  const transformRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastStateRef  = useRef({ pos: null, scl: null });
  const FLOOR_Y = -1.25;

  // When this item is deselected, ensure dragging state is cleared.
  useEffect(() => {
    if (!isSelected) {
      isDraggingRef.current = false;
      onDragging?.(false);
    }
  }, [isSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Props → mesh (only when not actively dragging)
  useEffect(() => {
    if (groupRef.current && !isDraggingRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.scale.set(scale[0], scale[1], scale[2]);
    }
  }, [position, scale]);

  // Mesh → React state during drag
  useFrame(() => {
    if (!groupRef.current || !isDraggingRef.current) return;
    const pos = groupRef.current.position;
    const scl = groupRef.current.scale;
    if (!pos || !scl) return;

    if (pos.y < FLOOR_Y) pos.y = FLOOR_Y;

    if (snapEnabled) {
      pos.x = snapToGrid(pos.x);
      pos.y = Math.max(FLOOR_Y, snapToGrid(pos.y));
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
          scale:    [scl.x, scl.y, scl.z],
        });
      } catch (_) {}
    }
  });

  const geoArgs = getFurnitureArgs(name);

  // FIX BUG-1: the mesh group is always rendered so groupRef is always valid.
  // TransformControls is ONLY rendered when this item is selected — prevents
  // all TC gizmos from being active simultaneously and intercepting clicks.
  const meshGroup = (
    <group
      ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onSelect?.(id); }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={geoArgs} />
        <meshStandardMaterial
          color={isSelected ? '#d45c5c' : color}
          metalness={0.1}
          roughness={0.65}
          emissive={isSelected ? '#6b1c1c' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
    </group>
  );

  if (!isSelected) return meshGroup;

  return (
    <TransformControls
      ref={transformRef}
      mode="translate"
      size={0.7}
      onMouseDown={() => { isDraggingRef.current = true;  onDragging?.(true);  }}
      onMouseUp={()   => { isDraggingRef.current = false; onDragging?.(false); }}
    >
      {meshGroup}
    </TransformControls>
  );
}

// ─── Room (floor + three walls) ───────────────────────────────────────────────
function Room({ width = 10, depth = 10, wallColor = '#e8e8e8' }) {
  const wallH  = 3;
  const halfW  = width  / 2;
  const halfD  = depth  / 2;
  const floorY = -2;
  const col    = (wallColor && !wallColor.startsWith('var(')) ? wallColor : '#e8e8e8';

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={col} roughness={0.9} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, floorY + wallH / 2, -halfD]} receiveShadow>
        <boxGeometry args={[width + 0.25, wallH, 0.12]} />
        <meshStandardMaterial color={col} roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-halfW, floorY + wallH / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, wallH, depth]} />
        <meshStandardMaterial color={col} roughness={0.9} />
      </mesh>

      {/* Right wall */}
      <mesh position={[halfW, floorY + wallH / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, wallH, depth]} />
        <meshStandardMaterial color={col} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── Default items for Dashboard preview ────────────────────────────────────
const DEFAULT_ITEMS = [
  { id: 1, name: 'Chair',  position: [-2, -1.25,  0], scale: [1, 1, 1], color: '#e2844a' },
  { id: 2, name: 'Table',  position: [ 2, -1.25,  0], scale: [1, 1, 1], color: '#6b4f35' },
  { id: 3, name: 'Sofa',   position: [ 0, -1.25, -2], scale: [1, 1, 1], color: '#9b59b6' },
];

// ─── Main exported component ──────────────────────────────────────────────────
/**
 * Modes:
 *   Controlled   (Design.js)  — pass externalItems / selectedId / onSelect /
 *                               onTransformChange / snapToGridEnabled / is2DOverride / roomData
 *   Uncontrolled (Dashboard)  — omit props above; component manages its own state
 */
function FurnitureItem({
  externalItems,
  selectedId: externalSelectedId,
  onSelect: externalOnSelect,
  onTransformChange: externalOnTransformChange,
  snapToGridEnabled: externalSnap,
  is2DOverride,
  roomData,
}) {
  const isControlled = externalItems !== undefined;

  const [internalItems,      setInternalItems]      = useState(DEFAULT_ITEMS);
  const [internalSnap,       setInternalSnap]       = useState(true);
  const [internalSelectedId, setInternalSelectedId] = useState(null);
  const [internalIs2D,       setInternalIs2D]       = useState(false);
  // FIX BUG-2: track whether any object is being dragged so we can disable OrbitControls
  const [isAnyDragging, setIsAnyDragging]           = useState(false);

  const items       = isControlled ? externalItems        : internalItems;
  const snapEnabled = externalSnap !== undefined ? externalSnap : internalSnap;
  const selectedId  = isControlled ? externalSelectedId  : internalSelectedId;
  const is2DMode    = is2DOverride !== undefined ? is2DOverride : internalIs2D;

  // Room dimensions
  const roomW     = roomData?.width  ?? 10;
  const roomD     = roomData?.height ?? roomData?.depth ?? 10;
  const wallColor = roomData?.color  ?? '#e8e8e8';
  const gridSize  = Math.max(roomW, roomD) + 6;

  const handleSelect = (id) => {
    const next = id === selectedId ? null : id;
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

      {/* Controls bar — uncontrolled (Dashboard) only */}
      {!isControlled && (
        <div
          style={{
            padding: '6px 14px',
            backgroundColor: 'var(--surface-1)',
            borderBottom: '1px solid var(--grid-lines)',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            flexShrink: 0,
          }}
        >
          <label
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', fontSize: '13px', color: 'var(--text-high)',
            }}
          >
            <input
              type="checkbox"
              checked={snapEnabled}
              onChange={(e) => setInternalSnap(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
            />
            Snap to Grid
          </label>
          <label
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', fontSize: '13px', color: 'var(--text-high)',
            }}
          >
            <input
              type="checkbox"
              checked={internalIs2D}
              onChange={(e) => setInternalIs2D(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
            />
            Top-down 2D View
          </label>
        </div>
      )}

      {/* 3D canvas */}
      <Canvas shadows style={{ flex: 1 }} onPointerMissed={() => handleSelect(null)}>
        {is2DMode ? (
          <OrthographicCamera
            makeDefault
            position={[0, 20, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            zoom={30}
            near={0.1}
            far={1000}
          />
        ) : (
          <PerspectiveCamera
            makeDefault
            position={[0, 8, 14]}
            fov={45}
            near={0.1}
            far={1000}
          />
        )}

        <ambientLight intensity={0.7} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={0.9}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-8, 8, 8]} intensity={0.3} />

        {/* Room */}
        <Room width={roomW} depth={roomD} wallColor={wallColor} />

        {/* Grid */}
        <gridHelper
          args={[gridSize, gridSize, '#444444', '#2e3235']}
          position={[0, -1.98, 0]}
        />

        {/* Furniture */}
        {items.map((item) => (
          <FurnitureObject
            key={item.id}
            id={item.id}
            name={item.name}
            position={item.position}
            scale={item.scale}
            color={item.color}
            isSelected={item.id === selectedId}
            onSelect={handleSelect}
            onTransformChange={(data) => handleTransformChange(item.id, data)}
            snapEnabled={snapEnabled}
            onDragging={(v) => setIsAnyDragging(v)}
          />
        ))}

        {/* FIX BUG-2: disable OrbitControls while any TransformControls gizmo is active */}
        <OrbitControls
          enabled={!isAnyDragging}
          enableZoom
          enablePan
          enableRotate={!is2DMode}
          maxPolarAngle={is2DMode ? 0.01 : Math.PI / 2.05}
        />
      </Canvas>
    </div>
  );
}

export default FurnitureItem;
