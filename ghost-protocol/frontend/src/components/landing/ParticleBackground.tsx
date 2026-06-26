import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 800 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 3.5;

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const roll = Math.random();
      const brightness = 0.4 + Math.random() * 0.5;
      if (roll > 0.95) {
        col[i * 3] = 0.0; col[i * 3 + 1] = 1.0; col[i * 3 + 2] = 0.47;
      } else if (roll > 0.88) {
        col[i * 3] = 0.0; col[i * 3 + 1] = 0.85; col[i * 3 + 2] = 1.0;
      } else {
        col[i * 3] = 0.8 * brightness;
        col[i * 3 + 1] = 0.85 * brightness;
        col[i * 3 + 2] = 0.95 * brightness;
      }

      sz[i] = Math.random() < 0.05
        ? Math.random() * 4 + 2
        : Math.random() * 1.5 + 0.3;
    }

    return [pos, col, sz];
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.012;
    mesh.current.rotation.x = Math.sin(t * 0.007) * 0.05;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55 }}
        gl={{ antialias: false, alpha: true }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
      >
        <Particles count={800} />
      </Canvas>
    </div>
  );
}
