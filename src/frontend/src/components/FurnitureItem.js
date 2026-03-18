import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  TransformControls,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
  ContactShadows,
  Environment,
  Lightformer,
} from '@react-three/drei';

const snapToGrid = (value, gridSize = 0.5) =>
  Math.round(value / gridSize) * gridSize;

const blendColor = (from, to, amount = 0.8) => {
  try {
    const a = new THREE.Color(from || '#888888');
    const b = new THREE.Color(to || '#888888');
    return `#${a.lerp(b, Math.max(0, Math.min(1, amount))).getHexString()}`;
  } catch (_) {
    return to || from || '#888888';
  }
};

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
  if (n.includes('bookshelf') || n.includes('shelf') || n.includes('bookcase')) return [1.2, 1.85, 0.38];
  if (n.includes('chair'))                              return [0.65, 1.0,  0.65];
  return [0.8, 1.2, 0.8];
}

// ─── Recognizable multi-part furniture geometry ───────────────────────────────
function FurnitureMesh({ name, color, isSelected }) {
  const n   = (name || '').toLowerCase();
  const col = color || '#888888';
  const sel = isSelected;

  const M = ({
    c = col,
    metal = 0.1,
    rough = 0.65,
    env = 1.0,
    clearcoat = 0.15,
    clearcoatRoughness = 0.5,
    tint,
    useUserColor = true,
    emissive = sel ? '#6b1c1c' : '#000000',
    emissiveIntensity = sel ? 0.24 : 0,
  } = {}) => (
    <meshPhysicalMaterial
      color={useUserColor ? blendColor(c, col, tint ?? (metal >= 0.45 ? 0.26 : 0.82)) : c}
      metalness={metal}
      roughness={rough}
      envMapIntensity={env}
      clearcoat={clearcoat}
      clearcoatRoughness={clearcoatRoughness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );
  const wood = blendColor('#5c3a1e', col, 0.62);

  // All meshes are shifted so their BOTTOM sits at local y = 0.
  // This lets every item rest exactly on the floor (group.position.y = -2)
  // regardless of scale, with no per-type placement offsets needed.

  if (n.includes('sofa')) return (
    <group>
      {/* Feet — bottom at y=0 */}
      {[[-0.78, 0.27], [-0.78, -0.27], [0.78, 0.27], [0.78, -0.27]].map(([x, z], i) => (
        <mesh key={`foot-${i}`} castShadow position={[x, 0.04, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 10]} />
          <M c={wood} metal={0.25} rough={0.45} env={0.8} />
        </mesh>
      ))}

      {/* Base frame */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.82, 0.22, 0.8]} />
        <M c={sel ? '#d45c5c' : '#b1733a'} rough={0.55} />
      </mesh>

      {/* Seat deck */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0.02]}>
        <boxGeometry args={[1.7, 0.08, 0.68]} />
        <M c={sel ? '#d45c5c' : '#a56a35'} rough={0.62} />
      </mesh>

      {/* Seat cushions */}
      {[-0.55, 0, 0.55].map((x, i) => (
        <mesh key={`seat-${i}`} castShadow receiveShadow position={[x, 0.42, 0.05]}>
          <boxGeometry args={[0.5, 0.16, 0.6]} />
          <M c={'#8b949e'} useUserColor={false} metal={0.02} rough={0.88} env={0.55} clearcoat={0.03} clearcoatRoughness={0.95} />
        </mesh>
      ))}

      {/* Arms */}
      {[-0.86, 0.86].map((x, i) => (
        <group key={`arm-${i}`} position={[x, 0.52, 0.02]}>
          <mesh castShadow><boxGeometry args={[0.14, 0.5, 0.7]} /><M c={sel ? '#d45c5c' : '#b9783f'} rough={0.72} /></mesh>
          <mesh castShadow position={[0, 0.22, 0]}><cylinderGeometry args={[0.07, 0.07, 0.68, 12]} /><M c={sel ? '#d45c5c' : '#cc8b4c'} rough={0.86} /></mesh>
        </group>
      ))}

      {/* Back frame */}
      <mesh castShadow receiveShadow position={[0, 0.74, -0.29]}>
        <boxGeometry args={[1.7, 0.5, 0.12]} />
        <M c={sel ? '#d45c5c' : '#b9783f'} rough={0.7} />
      </mesh>

      {/* Back cushions */}
      {[-0.55, 0, 0.55].map((x, i) => (
        <mesh key={`back-${i}`} castShadow receiveShadow position={[x, 0.76, -0.2]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.48, 0.36, 0.18]} />
          <M c={'#8b949e'} useUserColor={false} metal={0.02} rough={0.9} env={0.5} clearcoat={0.03} clearcoatRoughness={0.96} />
        </mesh>
      ))}
    </group>
  );

  if (n.includes('bed')) return (
    <group>
      {/* Legs / supports — bottom at y=0 */}
      {[[-0.58, -0.86], [0.58, -0.86], [-0.58, 0.86], [0.58, 0.86]].map(([x, z], i) => (
        <mesh key={`bed-leg-${i}`} castShadow position={[x, 0.085, z]}>
          <cylinderGeometry args={[0.045, 0.05, 0.17, 12]} />
          <M c={wood} rough={0.52} />
        </mesh>
      ))}

      {/* Main wooden frame */}
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <boxGeometry args={[1.34, 0.2, 1.95]} />
        <M c={wood} rough={0.5} />
      </mesh>

      {/* Inner platform */}
      <mesh castShadow receiveShadow position={[0, 0.23, 0]}>
        <boxGeometry args={[1.24, 0.05, 1.78]} />
        <M c={sel ? '#d45c5c' : '#e0d8cc'} rough={0.82} metal={0.02} env={0.6} />
      </mesh>

      {/* Mattress */}
      <mesh castShadow receiveShadow position={[0, 0.36, 0]}>
        <boxGeometry args={[1.2, 0.22, 1.7]} />
        <M c={sel ? '#d45c5c' : '#f6f2ec'} rough={0.94} metal={0.01} env={0.45} clearcoat={0.02} clearcoatRoughness={0.96} />
      </mesh>

      {/* Blanket */}
      <mesh castShadow receiveShadow position={[0, 0.46, 0.2]}>
        <boxGeometry args={[1.16, 0.05, 1.0]} />
        <M c={'#a3b6cc'} useUserColor={false} rough={0.9} metal={0.02} env={0.5} />
      </mesh>

      {/* Headboard */}
      <mesh castShadow receiveShadow position={[0, 0.78, -0.94]}>
        <boxGeometry args={[1.34, 1.02, 0.09]} />
        <M c={sel ? '#d45c5c' : '#8a5a32'} rough={0.56} />
      </mesh>

      {/* Headboard panel inset */}
      <mesh castShadow position={[0, 0.78, -0.89]}>
        <boxGeometry args={[1.16, 0.84, 0.03]} />
        <M c={sel ? '#d45c5c' : '#c49b72'} rough={0.72} />
      </mesh>

      {/* Footboard */}
      <mesh castShadow receiveShadow position={[0, 0.38, 0.94]}>
        <boxGeometry args={[1.34, 0.36, 0.09]} />
        <M c={sel ? '#d45c5c' : '#8a5a32'} rough={0.56} />
      </mesh>

      {/* Pillows */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={`pillow-${i}`} castShadow receiveShadow position={[x, 0.49, -0.62]}>
          <boxGeometry args={[0.5, 0.1, 0.26]} />
          <M c={sel ? '#d45c5c' : '#ffffff'} rough={0.92} metal={0.01} env={0.4} clearcoat={0.02} clearcoatRoughness={0.98} />
        </mesh>
      ))}
    </group>
  );

  if (n.includes('wardrobe') || n.includes('cabinet')) return (
    <group>
      {/* Carcass */}
      <mesh castShadow receiveShadow position={[0, 0.925, 0]}>
        <boxGeometry args={[1.14, 1.85, 0.54]} />
        <M c={sel ? '#d45c5c' : '#8f5f39'} rough={0.55} />
      </mesh>

      {/* Top crown */}
      <mesh castShadow receiveShadow position={[0, 1.865, 0.02]}>
        <boxGeometry args={[1.2, 0.06, 0.58]} />
        <M c={sel ? '#d45c5c' : '#7b4f2f'} rough={0.5} />
      </mesh>

      {/* Toe kick / base plinth */}
      <mesh castShadow receiveShadow position={[0, 0.06, 0.12]}>
        <boxGeometry args={[1.08, 0.12, 0.14]} />
        <M c={sel ? '#d45c5c' : '#6c4429'} rough={0.52} />
      </mesh>

      {/* Door rails */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={`door-rail-${i}`} castShadow receiveShadow position={[x, 0.93, 0.28]}>
          <boxGeometry args={[0.5, 1.66, 0.03]} />
          <M c={'#9a6b43'} rough={0.58} />
        </mesh>
      ))}

      {/* Door center panels */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={`door-panel-${i}`} castShadow receiveShadow position={[x, 0.93, 0.302]}>
          <boxGeometry args={[0.38, 1.48, 0.012]} />
          <M c={'#c39d72'} useUserColor={false} rough={0.74} metal={0.03} env={0.7} />
        </mesh>
      ))}

      {/* Vertical divider line */}
      <mesh castShadow receiveShadow position={[0, 0.93, 0.292]}>
        <boxGeometry args={[0.025, 1.68, 0.014]} />
        <M c={sel ? '#d45c5c' : '#7d5232'} rough={0.55} />
      </mesh>

      {/* Handles */}
      {[-0.085, 0.085].map((x, i) => (
        <mesh key={`handle-${i}`} castShadow position={[x, 0.93, 0.315]}>
          <cylinderGeometry args={[0.013, 0.013, 0.16, 12]} />
          <meshStandardMaterial color="#b2b2b2" metalness={0.82} roughness={0.24} />
        </mesh>
      ))}
    </group>
  );

  if (n.includes('chair')) return (
    <group>
      {/* Front legs — rounded profile, bottom at y=0 */}
      {[[-0.22, 0.14], [0.22, 0.14]].map(([x, z], i) => (
        <mesh key={`f-${i}`} castShadow position={[x, 0.245, z]}>
          <cylinderGeometry args={[0.028, 0.032, 0.49, 12]} />
          <M c={wood} rough={0.55} />
        </mesh>
      ))}

      {/* Rear legs extended into back posts */}
      {[[-0.22, -0.2], [0.22, -0.2]].map(([x, z], i) => (
        <mesh key={`r-${i}`} castShadow position={[x, 0.46, z]}>
          <cylinderGeometry args={[0.028, 0.034, 0.92, 12]} />
          <M c={wood} rough={0.55} />
        </mesh>
      ))}

      {/* Seat frame */}
      <mesh castShadow receiveShadow position={[0, 0.53, 0.0]}>
        <boxGeometry args={[0.54, 0.06, 0.52]} />
        <M c={wood} rough={0.5} />
      </mesh>

      {/* Seat cushion */}
      <mesh castShadow receiveShadow position={[0, 0.585, 0.02]}>
        <boxGeometry args={[0.49, 0.05, 0.45]} />
        <M c={'#8b949e'} useUserColor={false} metal={0.02} rough={0.9} env={0.5} clearcoat={0.02} clearcoatRoughness={0.95} />
      </mesh>

      {/* Top rail */}
      <mesh castShadow position={[0, 0.95, -0.2]}>
        <boxGeometry args={[0.5, 0.055, 0.05]} />
        <M c={wood} rough={0.52} />
      </mesh>

      {/* Middle back rail */}
      <mesh castShadow position={[0, 0.79, -0.2]}>
        <boxGeometry args={[0.48, 0.045, 0.045]} />
        <M c={wood} rough={0.52} />
      </mesh>

      {/* Vertical back slats */}
      {[-0.12, 0, 0.12].map((x, i) => (
        <mesh key={`slat-${i}`} castShadow position={[x, 0.86, -0.2]}>
          <boxGeometry args={[0.035, 0.2, 0.035]} />
          <M c={wood} rough={0.56} />
        </mesh>
      ))}

      {/* Front stretcher */}
      <mesh castShadow position={[0, 0.19, 0.14]}>
        <boxGeometry args={[0.42, 0.03, 0.03]} />
        <M c={wood} rough={0.55} />
      </mesh>

      {/* Side stretchers */}
      {[-0.22, 0.22].map((x, i) => (
        <mesh key={`st-${i}`} castShadow position={[x, 0.19, -0.03]}>
          <boxGeometry args={[0.03, 0.03, 0.34]} />
          <M c={wood} rough={0.55} />
        </mesh>
      ))}
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
      {/* Side frames */}
      {[-0.44, 0.44].map((x, i) => (
        <mesh key={`side-${i}`} castShadow receiveShadow position={[x, 0.88, 0]}>
          <boxGeometry args={[0.08, 1.76, 0.36]} />
          <M c={wood} rough={0.55} />
        </mesh>
      ))}

      {/* Top and bottom frame */}
      <mesh castShadow receiveShadow position={[0, 1.75, 0]}><boxGeometry args={[1.08, 0.07, 0.36]} /><M c={wood} rough={0.5} /></mesh>
      <mesh castShadow receiveShadow position={[0, 0.035, 0]}><boxGeometry args={[1.08, 0.07, 0.36]} /><M c={wood} rough={0.5} /></mesh>

      {/* Recessed back panel */}
      <mesh castShadow receiveShadow position={[0, 0.9, -0.14]}>
        <boxGeometry args={[0.98, 1.68, 0.02]} />
        <M c={sel ? '#d45c5c' : '#d8c7b3'} rough={0.78} metal={0.03} env={0.7} />
      </mesh>

      {/* Shelves */}
      {[0.35, 0.68, 1.01, 1.34].map((y, i) => (
        <mesh key={`shelf-${i}`} castShadow receiveShadow position={[0, y, 0]}>
          <boxGeometry args={[0.96, 0.06, 0.34]} />
          <M c={sel ? '#d45c5c' : '#8c5a31'} rough={0.52} />
        </mesh>
      ))}

      {/* Books for realism */}
      {[
        [-0.26, 0.16, 0.03, '#4b78a8'], [-0.2, 0.16, 0.03, '#b35b4f'], [-0.14, 0.16, 0.03, '#d8c26a'],
        [0.16, 0.5, 0.02, '#6f8f4f'], [0.22, 0.5, 0.02, '#8a4ea3'], [0.28, 0.5, 0.02, '#c17a48'],
        [-0.28, 0.83, 0.01, '#6c88b7'], [-0.22, 0.83, 0.01, '#b97474'], [-0.16, 0.83, 0.01, '#7a9d64'],
        [0.08, 1.16, 0.0, '#c9b067'], [0.14, 1.16, 0.0, '#5c7fab'], [0.2, 1.16, 0.0, '#976a54'],
      ].map(([x, y, z, c], i) => (
        <mesh key={`book-${i}`} castShadow receiveShadow position={[x, y, z]}>
          <boxGeometry args={[0.052, 0.24, 0.22]} />
          <M c={c} useUserColor={false} metal={0.05} rough={0.7} env={0.7} clearcoat={0.08} clearcoatRoughness={0.8} />
        </mesh>
      ))}

      {/* Toe kick */}
      <mesh castShadow receiveShadow position={[0, 0.055, 0.12]}>
        <boxGeometry args={[0.96, 0.05, 0.05]} />
        <M c={wood} rough={0.58} />
      </mesh>
    </group>
  );

  if (n.includes('dining')) return (
    <group>
      {/* Legs — bottom at y=0 (+0.965 shift) — fixed color */}
      {[[-0.75, -0.36], [-0.75, 0.36], [0.75, -0.36], [0.75, 0.36]].map(([x, z], i) => (
        <mesh key={`d-leg-${i}`} castShadow position={[x, 0.475, z]}><boxGeometry args={[0.07, 0.95, 0.07]} /><M c={'#5c3a1e'} useUserColor={false} /></mesh>
      ))}
      {/* Tabletop — matching user color */}
      <mesh castShadow receiveShadow position={[0, 1.005, 0]}>
        <boxGeometry args={[1.7, 0.07, 0.85]} />
        <M c={col} rough={0.5} />
      </mesh>

      {/* Subtle texture line */}
      <mesh castShadow receiveShadow position={[0, 1.0075, 0]}>
        <boxGeometry args={[1.65, 0.002, 0.8]} />
        <M c={col} rough={0.55} />
      </mesh>

      {/* Place settings — 4 elegant settings */}
      {[[-0.35, -0.22], [-0.35, 0.22], [0.35, -0.22], [0.35, 0.22]].map(([x, z], i) => (
        <group key={`place-${i}`} position={[x, 1.06, z]}>
          {/* Plate — clean white ceramic, smaller size */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.009, 32]} />
            <M c={'#faf8f5'} useUserColor={false} rough={0.68} metal={0.06} env={0.65} clearcoat={0.14} clearcoatRoughness={0.72} />
          </mesh>

          {/* Water glass — elegant clear */}
          <mesh castShadow receiveShadow position={[0.08, 0.025, 0.12]}>
            <cylinderGeometry args={[0.035, 0.04, 0.09, 18]} />
            <meshPhysicalMaterial color="#f0f8ff" metalness={0.0} roughness={0.04} transmission={0.85} ior={1.52} thickness={0.008} clearcoat={0.12} clearcoatRoughness={0.18} />
          </mesh>

          {/* Napkin fold — subtle */}
          <mesh castShadow position={[0, 0.01, -0.12]}>
            <boxGeometry args={[0.12, 0.005, 0.1]} />
            <meshStandardMaterial color="#fefdfb" roughness={0.82} metalness={0.0} />
          </mesh>
        </group>
      ))}
    </group>
  );

  if (n.includes('coffee')) return (
    <group>
      {/* Round base — bottom at y=0 */}
      <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.06, 28]} />
        <M c={wood} rough={0.54} />
      </mesh>

      {/* Central pedestal */}
      <mesh castShadow receiveShadow position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.075, 0.09, 0.32, 24]} />
        <M c={wood} rough={0.52} />
      </mesh>

      {/* Top support plate */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.03, 24]} />
        <M c={wood} rough={0.5} />
      </mesh>

      {/* Round tabletop */}
      <mesh castShadow receiveShadow position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.48, 0.5, 0.07, 36]} />
        <M c={sel ? '#d45c5c' : '#8c5a31'} rough={0.48} metal={0.06} env={0.9} clearcoat={0.16} clearcoatRoughness={0.55} />
      </mesh>

      {/* Subtle top inlay */}
      <mesh castShadow receiveShadow position={[0, 0.448, 0]}>
        <cylinderGeometry args={[0.41, 0.41, 0.008, 36]} />
        <M c={'#a87345'} useUserColor={false} rough={0.62} metal={0.04} env={0.7} />
      </mesh>
    </group>
  );

  if (n.includes('desk')) return (
    <group>
      {/* Metal legs — bottom at y=0 */}
      {[[-0.58, -0.32], [-0.58, 0.32], [0.58, -0.32], [0.58, 0.32]].map(([x, z], i) => (
        <mesh key={`d-leg-${i}`} castShadow position={[x, 0.39, z]}>
          <cylinderGeometry args={[0.03, 0.035, 0.78, 12]} />
          <M c={'#5d6670'} useUserColor={false} metal={0.55} rough={0.32} env={1.1} clearcoat={0.1} clearcoatRoughness={0.55} />
        </mesh>
      ))}

      {/* Horizontal support rails */}
      {[-0.32, 0.32].map((z, i) => (
        <mesh key={`d-rail-${i}`} castShadow position={[0, 0.36, z]}>
          <boxGeometry args={[1.12, 0.04, 0.03]} />
          <M c={'#4f5963'} useUserColor={false} metal={0.5} rough={0.35} env={1.0} />
        </mesh>
      ))}

      {/* Desktop */}
      <mesh castShadow receiveShadow position={[0, 0.81, 0]}>
        <boxGeometry args={[1.38, 0.08, 0.74]} />
        <M c={sel ? '#d45c5c' : '#7b5738'} rough={0.55} metal={0.08} env={0.9} clearcoat={0.2} clearcoatRoughness={0.52} />
      </mesh>

      {/* Drawer unit */}
      <mesh castShadow receiveShadow position={[0.42, 0.46, -0.21]}>
        <boxGeometry args={[0.3, 0.62, 0.44]} />
        <M c={sel ? '#d45c5c' : '#6a472f'} rough={0.58} />
      </mesh>
      {[0.24, 0.46, 0.68].map((y, i) => (
        <mesh key={`drawer-${i}`} castShadow receiveShadow position={[0.42, y, -0.01]}>
          <boxGeometry args={[0.26, 0.18, 0.02]} />
          <M c={sel ? '#d45c5c' : '#8d6645'} rough={0.62} />
        </mesh>
      ))}

      {/* Monitor stand */}
      <mesh castShadow position={[-0.05, 0.87, -0.21]}>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 12]} />
        <M c={'#656d76'} useUserColor={false} metal={0.6} rough={0.32} env={1.2} />
      </mesh>
      <mesh castShadow position={[-0.05, 0.81, -0.21]}>
        <cylinderGeometry args={[0.11, 0.11, 0.012, 18]} />
        <M c={'#5a626b'} useUserColor={false} metal={0.55} rough={0.35} env={1.1} />
      </mesh>

      {/* Monitor */}
      <mesh castShadow receiveShadow position={[-0.05, 1.03, -0.22]}>
        <boxGeometry args={[0.58, 0.35, 0.04]} />
        <M c={'#101317'} useUserColor={false} metal={0.35} rough={0.26} env={1.2} clearcoat={0.2} clearcoatRoughness={0.2} />
      </mesh>
      <mesh castShadow position={[-0.05, 1.03, -0.197]}>
        <boxGeometry args={[0.52, 0.29, 0.006]} />
        <meshStandardMaterial color={sel ? '#6b1c1c' : '#2e5d87'} emissive={sel ? '#6b1c1c' : '#2a4f70'} emissiveIntensity={sel ? 0.22 : 0.35} metalness={0.1} roughness={0.35} />
      </mesh>

      {/* Keyboard */}
      <mesh castShadow receiveShadow position={[0.02, 0.86, 0.04]} rotation={[-0.06, 0, 0]}>
        <boxGeometry args={[0.34, 0.02, 0.12]} />
        <M c={'#2b2f33'} useUserColor={false} metal={0.15} rough={0.45} env={0.9} />
      </mesh>

      {/* Mouse pad + mouse */}
      <mesh castShadow receiveShadow position={[0.31, 0.855, 0.06]}>
        <boxGeometry args={[0.14, 0.008, 0.16]} />
        <M c={'#202428'} useUserColor={false} metal={0.05} rough={0.6} env={0.6} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.31, 0.87, 0.06]}>
        <boxGeometry args={[0.05, 0.02, 0.08]} />
        <M c={'#3b424a'} useUserColor={false} metal={0.2} rough={0.45} env={0.8} />
      </mesh>

      {/* PC tower */}
      <mesh castShadow receiveShadow position={[-0.45, 0.38, 0.22]}>
        <boxGeometry args={[0.22, 0.58, 0.4]} />
        <M c={'#1f2328'} useUserColor={false} metal={0.3} rough={0.4} env={1.0} clearcoat={0.14} clearcoatRoughness={0.42} />
      </mesh>
      <mesh castShadow position={[-0.37, 0.38, 0.42]}>
        <boxGeometry args={[0.05, 0.5, 0.012]} />
        <meshStandardMaterial color={sel ? '#6b1c1c' : '#3b7ea4'} emissive={sel ? '#6b1c1c' : '#326c8d'} emissiveIntensity={sel ? 0.2 : 0.3} metalness={0.2} roughness={0.45} />
      </mesh>
    </group>
  );

  if (n.includes('table')) return (
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
function Room({ width = 10, depth = 10, wallColor = '#e8e8e8', floorColor = '#c8b89a' }) {
  const wallH    = 3;
  const halfW    = width  / 2;
  const halfD    = depth  / 2;
  const floorY   = -2;
  const wallCol  = (wallColor  && !wallColor.startsWith('var('))  ? wallColor  : '#e8e8e8';
  const floorCol = (floorColor && !floorColor.startsWith('var(')) ? floorColor : '#c8b89a';

  return (
    <group>
      {/* Floor — independently coloured, unaffected by wall colour */}
      <mesh position={[0, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshPhysicalMaterial color={floorCol} roughness={0.82} metalness={0.06} clearcoat={0.08} clearcoatRoughness={0.9} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, floorY + wallH / 2, -halfD]} receiveShadow>
        <boxGeometry args={[width + 0.25, wallH, 0.12]} />
        <meshPhysicalMaterial color={wallCol} roughness={0.95} metalness={0.02} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-halfW, floorY + wallH / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, wallH, depth]} />
        <meshPhysicalMaterial color={wallCol} roughness={0.95} metalness={0.02} />
      </mesh>

      {/* Right wall */}
      <mesh position={[halfW, floorY + wallH / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, wallH, depth]} />
        <meshPhysicalMaterial color={wallCol} roughness={0.95} metalness={0.02} />
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

// ─── Keyboard camera controls (WASD) ────────────────────────────────────────
function KeyboardCameraControls({ controlsRef, is2DMode, isEnabled = true }) {
  const { camera } = useThree();
  const pressedRef = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const shouldIgnoreTarget = (target) => {
      if (!target) return false;
      const tagName = target.tagName?.toLowerCase();
      return (
        target.isContentEditable ||
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select'
      );
    };

    const onKeyDown = (event) => {
      if (shouldIgnoreTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key in pressedRef.current) pressedRef.current[key] = true;
    };

    const onKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key in pressedRef.current) pressedRef.current[key] = false;
    };

    const onBlur = () => {
      pressedRef.current = { w: false, a: false, s: false, d: false };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useFrame((_, delta) => {
    if (!isEnabled) return;
    const controls = controlsRef?.current;
    if (!controls || !camera) return;

    const { w, a, s, d } = pressedRef.current;
    if (!w && !a && !s && !d) return;

    let changed = false;
    const panStep = (is2DMode ? 10 : 8) * delta;

    if (a) {
      camera.position.x -= panStep;
      controls.target.x -= panStep;
      changed = true;
    }
    if (d) {
      camera.position.x += panStep;
      controls.target.x += panStep;
      changed = true;
    }

    const zoomStep = (is2DMode ? 20 : 10) * delta;
    if (w) {
      if (is2DMode) {
        camera.zoom = Math.min(120, camera.zoom + zoomStep);
        camera.updateProjectionMatrix();
      } else {
        const towardTarget = controls.target.clone().sub(camera.position);
        const distance = towardTarget.length();
        if (distance > 1.0) {
          const step = Math.min(zoomStep, distance - 1.0);
          camera.position.addScaledVector(towardTarget.normalize(), step);
        }
      }
      changed = true;
    }

    if (s) {
      if (is2DMode) {
        camera.zoom = Math.max(8, camera.zoom - zoomStep);
        camera.updateProjectionMatrix();
      } else {
        const awayFromTarget = camera.position.clone().sub(controls.target).normalize();
        camera.position.addScaledVector(awayFromTarget, zoomStep);
      }
      changed = true;
    }

    if (changed) controls.update();
  });

  return null;
}

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
  const orbitControlsRef = useRef(null);

  const items          = isControlled ? externalItems        : internalItems;
  const snapEnabled    = externalSnap !== undefined ? externalSnap : internalSnap;
  const selectedId     = isControlled ? externalSelectedId  : internalSelectedId;
  const is2DMode       = is2DOverride !== undefined ? is2DOverride : internalIs2D;
  const transformMode  = externalTransformMode || 'translate';

  // Room dimensions
  const roomW      = roomData?.width      ?? 10;
  const roomD      = roomData?.height     ?? roomData?.depth ?? 10;
  const wallColor  = roomData?.color      ?? '#e8e8e8';
  const floorColor = roomData?.floorColor ?? '#c8b89a';
  const gridSize   = Math.max(roomW, roomD) + 6;

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
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
        style={{ flex: 1 }}
        onPointerMissed={() => handleSelect(null)}
      >
        <color attach="background" args={['#1e232a']} />
        <KeyboardCameraControls
          controlsRef={orbitControlsRef}
          is2DMode={is2DMode}
          isEnabled={!isAnyDragging}
        />

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

        <ambientLight intensity={0.35} />
        <hemisphereLight intensity={0.45} color="#f0f4ff" groundColor="#7e848a" />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.15}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0002}
          shadow-normalBias={0.02}
        />
        <directionalLight position={[-10, 8, -6]} intensity={0.4} color="#dbe7ff" />

        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3.5} color="#ffffff" scale={[10, 4, 1]} position={[0, 6, 6]} rotation={[0, Math.PI, 0]} />
          <Lightformer form="rect" intensity={2.1} color="#b6d0ff" scale={[6, 3, 1]} position={[-6, 4, -3]} rotation={[0, Math.PI / 3, 0]} />
          <Lightformer form="ring" intensity={1.2} color="#ffffff" scale={8} position={[0, 10, 0]} target={[0, 0, 0]} />
        </Environment>

        {/* Room */}
        <Room width={roomW} depth={roomD} wallColor={wallColor} floorColor={floorColor} />

        {/* Grid */}
        <gridHelper
          args={[gridSize, gridSize, '#444444', '#2e3235']}
          position={[0, -1.98, 0]}
        />

        <ContactShadows
          position={[0, -1.995, 0]}
          opacity={0.45}
          blur={2.8}
          far={14}
          scale={[roomW * 1.05, roomD * 1.05]}
          resolution={1024}
          color="#000000"
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
          ref={orbitControlsRef}
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
