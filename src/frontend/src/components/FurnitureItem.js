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
  if (n.includes('dining'))                             return [1.8,  0.08, 0.9];
  if (n.includes('coffee'))                             return [0.9,  0.06, 0.5];
  if (n.includes('desk'))                               return [1.2,  0.06, 0.7];
  if (n.includes('table'))                              return [1.5,  0.08, 0.9];
  if (n.includes('lamp'))                               return [0.3,  1.6,  0.3];
  if (n.includes('bookshelf') || n.includes('shelf') || n.includes('bookcase')) return [1.0, 1.8, 0.3];
  if (n.includes('chair'))                              return [0.65, 1.0,  0.65];
  return [0.8, 1.2, 0.8];
}

// ─── Recognizable multi-part furniture geometry ───────────────────────────────
function FurnitureMesh({ name, color, isSelected }) {
  const n   = (name || '').toLowerCase();
  const col = color || '#888888';
  const sel = isSelected;

  const M = ({ c = col, metal = 0.1, rough = 0.65, emissive = sel ? '#6b1c1c' : '#000000', emissiveIntensity = sel ? 0.3 : 0 } = {}) => (
    <meshStandardMaterial color={sel ? '#d45c5c' : c} metalness={metal} roughness={rough} emissive={emissive} emissiveIntensity={emissiveIntensity} />
  );
  const wood = '#5c3a1e';

  // All meshes are shifted so their BOTTOM sits at local y = 0.
  // This lets every item rest exactly on the floor (group.position.y = -2)
  // regardless of scale, with no per-type placement offsets needed.

  if (n.includes('sofa')) return (
    <group>
      {/* Base/feet — bottom at y=0 (+0.26 shift) */}
      <mesh castShadow position={[0, 0.07, 0]}><boxGeometry args={[1.8, 0.14, 0.75]} /><M c={wood} /></mesh>
      {/* Seat */}
      <mesh castShadow receiveShadow position={[0, 0.26, 0]}><boxGeometry args={[1.8, 0.22, 0.75]} /><M /></mesh>
      {/* Arms */}
      {[-0.86, 0.86].map((x, i) => <mesh key={i} castShadow position={[x, 0.41, 0]}><boxGeometry args={[0.12, 0.36, 0.75]} /><M /></mesh>)}
      {/* Back */}
      <mesh castShadow position={[0, 0.64, -0.3]}><boxGeometry args={[1.8, 0.55, 0.12]} /><M /></mesh>
    </group>
  );

  if (n.includes('bed')) return (
    <group>
      {/* Frame — bottom at y=0 (+0.17 shift) */}
      <mesh castShadow receiveShadow position={[0, 0.07, 0]}><boxGeometry args={[1.3, 0.14, 1.9]} /><M /></mesh>
      {/* Mattress */}
      <mesh castShadow position={[0, 0.27, 0]}><boxGeometry args={[1.2, 0.22, 1.65]} /><M c={sel ? col : '#f4f0eb'} rough={0.9} /></mesh>
      {/* Headboard */}
      <mesh castShadow position={[0, 0.67, -0.9]}><boxGeometry args={[1.3, 0.84, 0.1]} /><M /></mesh>
      {/* Footboard */}
      <mesh castShadow position={[0, 0.39, 0.9]}><boxGeometry args={[1.3, 0.3, 0.1]} /><M /></mesh>
      {/* Pillow */}
      <mesh castShadow position={[0, 0.45, -0.62]}><boxGeometry args={[1.0, 0.1, 0.28]} /><M c={sel ? col : '#ffffff'} rough={0.9} /></mesh>
    </group>
  );

  if (n.includes('wardrobe') || n.includes('cabinet')) return (
    <group>
      {/* Body — bottom at y=0 (+0.925 shift) */}
      <mesh castShadow receiveShadow position={[0, 0.925, 0]}><boxGeometry args={[1.1, 1.85, 0.5]} /><M /></mesh>
      {/* Door panels */}
      {[-0.26, 0.26].map((x, i) => <mesh key={i} castShadow position={[x, 0.925, 0.26]}><boxGeometry args={[0.48, 1.65, 0.02]} /><M c={sel ? col : '#d8cfc4'} rough={0.5} /></mesh>)}
      {/* Handles */}
      {[-0.07, 0.07].map((x, i) => <mesh key={i} castShadow position={[x, 0.925, 0.28]}><boxGeometry args={[0.035, 0.1, 0.015]} /><meshStandardMaterial color="#a0a0a0" metalness={0.7} roughness={0.2} /></mesh>)}
    </group>
  );

  if (n.includes('chair')) return (
    <group>
      {/* 4 legs — bottom at y=0 (+0.57 shift) */}
      {[[-0.21, 0.12], [-0.21, -0.19], [0.21, 0.12], [0.21, -0.19]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.29, z]}><boxGeometry args={[0.05, 0.58, 0.05]} /><M c={wood} /></mesh>
      ))}
      {/* Seat */}
      <mesh castShadow receiveShadow position={[0, 0.61, 0.04]}><boxGeometry args={[0.52, 0.08, 0.5]} /><M /></mesh>
      {/* Backrest */}
      <mesh castShadow position={[0, 0.95, -0.2]}><boxGeometry args={[0.52, 0.6, 0.07]} /><M /></mesh>
    </group>
  );

  if (n.includes('lamp')) return (
    <group>
      {/* Base — bottom at y=0 (+0.695 shift) */}
      <mesh castShadow position={[0, 0.045, 0]}><cylinderGeometry args={[0.17, 0.21, 0.09, 10]} /><M c={sel ? col : '#888'} metal={0.5} rough={0.4} /></mesh>
      {/* Pole */}
      <mesh castShadow position={[0, 0.695, 0]}><cylinderGeometry args={[0.022, 0.022, 1.32, 8]} /><meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.15} /></mesh>
      {/* Shade */}
      <mesh castShadow position={[0, 1.415, 0]}><cylinderGeometry args={[0.28, 0.13, 0.38, 12]} /><M c={sel ? col : '#f8e8c0'} rough={0.7} emissive={sel ? '#6b1c1c' : '#ffe090'} emissiveIntensity={sel ? 0.3 : 0.25} /></mesh>
    </group>
  );

  if (n.includes('bookshelf') || n.includes('shelf') || n.includes('bookcase')) return (
    <group>
      {/* Back panel — bottom at y=0 (+0.875 shift) */}
      <mesh castShadow receiveShadow position={[0, 0.875, -0.12]}><boxGeometry args={[0.92, 1.75, 0.03]} /><M /></mesh>
      {/* Side panels */}
      {[-0.44, 0.44].map((x, i) => <mesh key={i} castShadow position={[x, 0.875, 0]}><boxGeometry args={[0.04, 1.75, 0.27]} /><M /></mesh>)}
      {/* Shelves */}
      {[0.075, 0.495, 0.915, 1.335, 1.715].map((y, i) => <mesh key={i} castShadow position={[0, y, 0]}><boxGeometry args={[0.84, 0.04, 0.27]} /><M /></mesh>)}
    </group>
  );

  if (n.includes('dining')) return (
    <group>
      {/* Legs — bottom at y=0 (+0.965 shift) */}
      {[[-0.75, -0.36], [-0.75, 0.36], [0.75, -0.36], [0.75, 0.36]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.475, z]}><boxGeometry args={[0.07, 0.95, 0.07]} /><M c={wood} /></mesh>
      ))}
      {/* Top */}
      <mesh castShadow receiveShadow position={[0, 1.005, 0]}><boxGeometry args={[1.7, 0.07, 0.85]} /><M /></mesh>
    </group>
  );

  if (n.includes('coffee')) return (
    <group>
      {/* Legs — bottom at y=0 (+0.33 shift) */}
      {[[-0.37, -0.2], [-0.37, 0.2], [0.37, -0.2], [0.37, 0.2]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.16, z]}><boxGeometry args={[0.05, 0.32, 0.05]} /><M c={wood} /></mesh>
      ))}
      {/* Top */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}><boxGeometry args={[0.88, 0.07, 0.5]} /><M /></mesh>
    </group>
  );

  if (n.includes('desk') || n.includes('table')) return (
    <group>
      {/* Legs — bottom at y=0 (+0.83 shift) */}
      {[[-0.61, -0.32], [-0.61, 0.32], [0.61, -0.32], [0.61, 0.32]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.41, z]}><boxGeometry args={[0.07, 0.82, 0.07]} /><M c={wood} /></mesh>
      ))}
      {/* Top */}
      <mesh castShadow receiveShadow position={[0, 0.87, 0]}><boxGeometry args={[1.4, 0.07, 0.75]} /><M /></mesh>
    </group>
  );

  // Fallback: plain box with bottom at y=0
  const [w, h, d] = getFurnitureArgs(name);
  return <mesh castShadow receiveShadow position={[0, h / 2, 0]}><boxGeometry args={[w, h, d]} /><M /></mesh>;
}

// ─── Individual furniture object with TransformControls ──────────────────────
function FurnitureObject({
  id, name, position, scale, rotation, color,
  isSelected, onSelect, onTransformChange, snapEnabled, onDragging, transformMode,
}) {
  const groupRef      = useRef(null);
  const transformRef  = useRef(null);
  const isDraggingRef = useRef(false);
  const lastStateRef  = useRef({ pos: null, scl: null, rot: null });
  const FLOOR_Y = -2;   // floor plane sits at y=-2; furniture bottom is at local y=0

  // When this item is deselected, ensure dragging state is cleared.
  useEffect(() => {
    if (!isSelected) {
      isDraggingRef.current = false;
      onDragging?.(false);
    }
  }, [isSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Props → mesh: only applied when NOT dragging (handles initial placement & undo/redo).
  // KEY DESIGN: the <group> lives permanently in the scene (never re-parented inside TC),
  // so Three.js position is preserved across selection changes without any stale-prop writes.
  useEffect(() => {
    if (groupRef.current && !isDraggingRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.scale.set(scale[0], scale[1], scale[2]);
      groupRef.current.rotation.set(
        rotation?.[0] ?? 0,
        rotation?.[1] ?? 0,
        rotation?.[2] ?? 0
      );
    }
  }, [position, scale, rotation]);

  // Mesh → React state during drag (runs every frame while dragging)
  useFrame(() => {
    if (!groupRef.current || !isDraggingRef.current) return;
    const pos = groupRef.current.position;
    const scl = groupRef.current.scale;
    const rot = groupRef.current.rotation;
    if (!pos || !scl) return;

    if (pos.y < FLOOR_Y) pos.y = FLOOR_Y;

    if (snapEnabled && (transformMode === 'translate' || !transformMode)) {
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

    const rotChanged =
      !lastStateRef.current.rot ||
      Math.abs(rot.x - lastStateRef.current.rot.x) > 0.005 ||
      Math.abs(rot.y - lastStateRef.current.rot.y) > 0.005 ||
      Math.abs(rot.z - lastStateRef.current.rot.z) > 0.005;

    if (posChanged || sclChanged || rotChanged) {
      try {
        lastStateRef.current = { pos: pos.clone(), scl: scl.clone(), rot: rot.clone() };
        onTransformChange?.({
          position: [pos.x, pos.y, pos.z],
          scale:    [scl.x, scl.y, scl.z],
          rotation: [rot.x, rot.y, rot.z],
        });
      } catch (_) {}
    }
  });

  // ── ARCHITECTURE NOTE ────────────────────────────────────────────────────────
  // The <group> is rendered as a STABLE sibling of <TransformControls>, never
  // as a child.  TC attaches to it via the `object` prop.
  //
  // WHY: when the group was rendered INSIDE <TC> (old code), switching selection
  // changed the JSX root type (TC → group), causing React to UNMOUNT + REMOUNT
  // the group.  The new Three.js object always started at [0,0,0], and the
  // subsequent useEffect wrote the last-known (stale) React state position back
  // — visually "resetting" the object to where it was originally placed.
  //
  // With the sibling pattern the group Three.js object is NEVER destroyed between
  // selection changes, so its position is always the live dragged value.
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mesh group — always in scene, never re-parented */}
      <group
        ref={groupRef}
        onClick={(e) => { e.stopPropagation(); onSelect?.(id); }}
      >
        <FurnitureMesh name={name} color={color} isSelected={isSelected} />
      </group>

      {/* TC mounts/unmounts alongside the group without affecting it */}
      {isSelected && (
        <TransformControls
          ref={transformRef}
          object={groupRef}          // attach to sibling group by ref
          mode={transformMode || 'translate'}
          size={1.0}                 // larger handles = easier to grab
          onMouseDown={() => { isDraggingRef.current = true;  onDragging?.(true);  }}
          onMouseUp={() => {
            // Flush final mesh state → React before clearing the drag flag so
            // that useEffect (above) never writes stale props back to the mesh.
            if (groupRef.current) {
              const pos = groupRef.current.position;
              const scl = groupRef.current.scale;
              const rot = groupRef.current.rotation;
              onTransformChange?.({
                position: [pos.x, pos.y, pos.z],
                scale:    [scl.x, scl.y, scl.z],
                rotation: [rot.x, rot.y, rot.z],
              });
            }
            isDraggingRef.current = false;
            onDragging?.(false);
          }}
        />
      )}
    </>
  );
}

// ─── Room (floor + three walls) ───────────────────────────────────────────────
function Room({ width = 10, depth = 10, wallColor = '#e8e8e8' }) {
  const wallH     = 3;
  const halfW     = width  / 2;
  const halfD     = depth  / 2;
  const floorY    = -2;
  const wallCol   = (wallColor && !wallColor.startsWith('var(')) ? wallColor : '#e8e8e8';
  const FLOOR_COL = '#c8b89a'; // static warm timber — unaffected by wall colour

  return (
    <group>
      {/* Floor — always timber/neutral, wall colour does NOT apply here */}
      <mesh position={[0, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={FLOOR_COL} roughness={0.85} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, floorY + wallH / 2, -halfD]} receiveShadow>
        <boxGeometry args={[width + 0.25, wallH, 0.12]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-halfW, floorY + wallH / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, wallH, depth]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>

      {/* Right wall */}
      <mesh position={[halfW, floorY + wallH / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, wallH, depth]} />
        <meshStandardMaterial color={wallCol} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── Default items for Dashboard preview ────────────────────────────────────
const DEFAULT_ITEMS = [
  { id: 1, name: 'Chair',  position: [-2, -2,  0], scale: [1, 1, 1], color: '#e2844a' },
  { id: 2, name: 'Table',  position: [ 2, -2,  0], scale: [1, 1, 1], color: '#6b4f35' },
  { id: 3, name: 'Sofa',   position: [ 0, -2, -2], scale: [1, 1, 1], color: '#9b59b6' },
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
  transformMode: externalTransformMode,
}) {
  const isControlled = externalItems !== undefined;

  const [internalItems,      setInternalItems]      = useState(DEFAULT_ITEMS);
  const [internalSnap,       setInternalSnap]       = useState(true);
  const [internalSelectedId, setInternalSelectedId] = useState(null);
  const [internalIs2D,       setInternalIs2D]       = useState(false);
  // FIX BUG-2: track whether any object is being dragged so we can disable OrbitControls
  const [isAnyDragging, setIsAnyDragging]           = useState(false);

  const items          = isControlled ? externalItems        : internalItems;
  const snapEnabled    = externalSnap !== undefined ? externalSnap : internalSnap;
  const selectedId     = isControlled ? externalSelectedId  : internalSelectedId;
  const is2DMode       = is2DOverride !== undefined ? is2DOverride : internalIs2D;
  const transformMode  = externalTransformMode || 'translate';

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
            rotation={item.rotation || [0, 0, 0]}
            color={item.color}
            isSelected={item.id === selectedId}
            onSelect={handleSelect}
            onTransformChange={(data) => handleTransformChange(item.id, data)}
            snapEnabled={snapEnabled}
            onDragging={(v) => setIsAnyDragging(v)}
            transformMode={transformMode}
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
