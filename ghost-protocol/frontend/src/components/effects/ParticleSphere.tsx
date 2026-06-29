import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleSphereProps {
  particleCount?:   number;
  radius?:          number;
  rotationSpeed?:   number;
  particleSize?:    number;
  color?:           string;
  opacity?:         number;
  interactionRadius?: number;
  interactionStrength?: number;
  width?:           number;
  height?:          number;
}

export default function ParticleSphere({
  particleCount      = 2800,
  radius             = 2.2,
  rotationSpeed      = 0.0025,
  particleSize       = 0.018,
  color              = '#00e67a',
  opacity            = 0.65,
  interactionRadius  = 0.9,
  interactionStrength = 0.1,
  width              = 520,
  height             = 520,
}: ParticleSphereProps) {
  const mountRef    = useRef<HTMLDivElement>(null);
  const mouseRef    = useRef({ x: 0, y: 0, inCanvas: false });
  const isDragging  = useRef(false);
  const dragStart   = useRef({ x: 0, y: 0 });
  const dragRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 5;

    const positions  = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const sizes      = new Float32Array(particleCount);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < particleCount; i++) {
      const y      = 1 - (i / (particleCount - 1)) * 2;
      const r      = Math.sqrt(1 - y * y);
      const theta  = goldenAngle * i;

      const x = Math.cos(theta) * r * radius;
      const z = Math.sin(theta) * r * radius;
      const py = y * radius;

      positions[i * 3]     = x;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = z;
      basePositions[i * 3]     = x;
      basePositions[i * 3 + 1] = py;
      basePositions[i * 3 + 2] = z;

      sizes[i] = particleSize * (0.6 + Math.random() * 0.8);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const threeColor = new THREE.Color(color);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor:   { value: threeColor },
        uOpacity: { value: opacity },
      },
      vertexShader: `
        attribute float size;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3  uColor;
        uniform float uOpacity;
        void main() {
          vec2  coord = gl_PointCoord - vec2(0.5);
          float dist  = length(coord);
          if (dist > 0.5) discard;
          float alpha = uOpacity * (1.0 - smoothstep(0.3, 0.5, dist));
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / width)  * 2 - 1,
        y: -((e.clientY - rect.top)  / height) * 2 + 1,
        inCanvas: true,
      };

      if (isDragging.current) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        dragRotation.current.y = dx * 0.008;
        dragRotation.current.x = dy * 0.008;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current    = true;
      dragStart.current     = { x: e.clientX, y: e.clientY };
      dragRotation.current  = { x: 0, y: 0 };
    };

    const handleMouseUp = () => { isDragging.current = false; };
    const handleMouseLeave = () => { mouseRef.current.inCanvas = false; };

    const handleClick = () => {
      const pos   = geometry.attributes.position.array as Float32Array;
      const burst = 0.18;
      for (let i = 0; i < particleCount; i++) {
        const x = pos[i * 3];
        const y = pos[i * 3 + 1];
        const z = pos[i * 3 + 2];
        const len = Math.sqrt(x*x + y*y + z*z) || 1;
        pos[i * 3]     += (x/len) * burst * (Math.random() * 2 - 1);
        pos[i * 3 + 1] += (y/len) * burst * (Math.random() * 2 - 1);
        pos[i * 3 + 2] += (z/len) * burst * (Math.random() * 2 - 1);
      }
      geometry.attributes.position.needsUpdate = true;
    };

    mount.addEventListener('mousemove',  handleMouseMove);
    mount.addEventListener('mousedown',  handleMouseDown);
    mount.addEventListener('mouseup',    handleMouseUp);
    mount.addEventListener('mouseleave', handleMouseLeave);
    mount.addEventListener('click',      handleClick);

    let rafId: number;
    const raycaster = new THREE.Raycaster();
    const mouse3D   = new THREE.Vector2();

    function animate() {
      rafId = requestAnimationFrame(animate);

      if (!isDragging.current) {
        points.rotation.y += rotationSpeed;
        points.rotation.x += rotationSpeed * 0.3;
      } else {
        points.rotation.y += dragRotation.current.y;
        points.rotation.x += dragRotation.current.x;
        dragRotation.current.x *= 0.92;
        dragRotation.current.y *= 0.92;
      }

      if (mouseRef.current.inCanvas) {
        mouse3D.set(mouseRef.current.x, mouseRef.current.y);
        raycaster.setFromCamera(mouse3D, camera);

        const pos = geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const px = pos[i * 3];
          const py = pos[i * 3 + 1];
          const pz = pos[i * 3 + 2];

          const pVec = new THREE.Vector3(px, py, pz).applyMatrix4(points.matrixWorld);
          pVec.project(camera);

          const dx = pVec.x - mouseRef.current.x;
          const dy = pVec.y - mouseRef.current.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist < interactionRadius * 0.5) {
            const force = (1 - dist / (interactionRadius * 0.5)) * interactionStrength;
            const bx = basePositions[i * 3];
            const by = basePositions[i * 3 + 1];
            const bz = basePositions[i * 3 + 2];
            const bLen = Math.sqrt(bx*bx + by*by + bz*bz) || 1;
            pos[i * 3]     = bx + (bx/bLen) * force * 0.5;
            pos[i * 3 + 1] = by + (by/bLen) * force * 0.5;
            pos[i * 3 + 2] = bz + (bz/bLen) * force * 0.5;
          } else {
            pos[i * 3]     += (basePositions[i * 3]     - pos[i * 3])     * 0.04;
            pos[i * 3 + 1] += (basePositions[i * 3 + 1] - pos[i * 3 + 1]) * 0.04;
            pos[i * 3 + 2] += (basePositions[i * 3 + 2] - pos[i * 3 + 2]) * 0.04;
          }
        }
        geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      mount.removeEventListener('mousemove',  handleMouseMove);
      mount.removeEventListener('mousedown',  handleMouseDown);
      mount.removeEventListener('mouseup',    handleMouseUp);
      mount.removeEventListener('mouseleave', handleMouseLeave);
      mount.removeEventListener('click',      handleClick);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [particleCount, radius, rotationSpeed, particleSize, color, opacity, interactionRadius, interactionStrength, width, height]);

  return (
    <div
      ref={mountRef}
      style={{
        width:  `${width}px`,
        height: `${height}px`,
        cursor: 'grab',
        flexShrink: 0,
      }}
      aria-label="Interactive particle sphere"
    />
  );
}
