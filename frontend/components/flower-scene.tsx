"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Palette with serene anime blues & periwinkles, mixed with authentic bougainvillea rose
const PETAL_COLORS = [
  "#6b9dfa", // vibrant periwinkle blue
  "#8bb4ff", // soft sky blue
  "#5183e8", // calm cornflower blue
  "#a2c4fd", // ethereal pale blue
  "#3f6ad4", // twilight blue
  "#e0387b", // vibrant bougainvillea magenta
  "#f472b6", // soft rose pink
  "#7ca3f5", // summer breeze blue
];

// Botanically accurate 3D bougainvillea bract geometry (cordate paper petal with midrib fold)
function createPetalGeometry() {
  const shape = new THREE.Shape();
  // Delicate base attachment
  shape.moveTo(0, 0);
  // Right side: broad heart curve, widest around mid-lower section, tapering to an acute tip
  shape.bezierCurveTo(0.13, 0.03, 0.28, 0.16, 0.3, 0.4);
  shape.bezierCurveTo(0.31, 0.65, 0.18, 0.85, 0, 0.98);
  // Left side: symmetrical cordate curve
  shape.bezierCurveTo(-0.18, 0.85, -0.31, 0.65, -0.3, 0.4);
  shape.bezierCurveTo(-0.28, 0.16, -0.13, 0.03, 0, 0);

  const geometry = new THREE.ShapeGeometry(shape, 18);
  const pos = geometry.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const normY = Math.max(0, Math.min(1, y / 0.98));
    const distFromMidrib = Math.abs(x);

    // 1. Central midrib fold (the V-crease down the center of paper flowers)
    const midribCrease = -distFromMidrib * 0.16 * (1 - normY * 0.25);

    // 2. Gentle longitudinal curve from base to apex tip
    const arch = -Math.sin(normY * Math.PI) * 0.045;

    // 3. Delicate papery edge crinkles along margins
    const crinkle = Math.sin(y * 15 + x * 12) * 0.012 * (distFromMidrib / 0.3);

    pos.setZ(i, midribCrease + arch + crinkle);
  }
  geometry.computeVertexNormals();
  return geometry;
}

interface PetalData {
  x: number;
  y: number;
  z: number;
  scale: number;
  color: string;
  speedX: number;
  speedY: number;
  swayFreq: number;
  swayAmp: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  initialized: boolean;
}

// Falling petals: few in quantity (ultra-subtle, minimal, sparse)
function FallingPetals({ count = 7 }: { count?: number }) {
  const { viewport } = useThree();
  const petalGeo = useMemo(() => createPetalGeometry(), []);
  const groupRef = useRef<THREE.Group>(null);

  // Setup individual petal physics
  const petalsData = useMemo<PetalData[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const z = (Math.random() - 0.5) * 2.0;
      // Dainty, small, realistic scale
      const scale = 0.045 + Math.random() * 0.03;
      return {
        x: 0,
        y: 0,
        z,
        scale,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
        speedX: 0.22 + Math.random() * 0.22,
        speedY: 0.12 + Math.random() * 0.16,
        swayFreq: 1.2 + Math.random() * 1.2,
        swayAmp: 0.06 + Math.random() * 0.08,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        rotSpeedX: (Math.random() - 0.5) * 1.2,
        rotSpeedY: (Math.random() - 0.5) * 1.5,
        rotSpeedZ: (Math.random() - 0.5) * 1.0,
        initialized: false,
      };
    });
  }, [count]);

  // Authentic papery texture materials
  const materials = useMemo(() => {
    return PETAL_COLORS.map(
      (color) =>
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.12,
          roughness: 0.52,
          metalness: 0.02,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        })
    );
  }, []);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    petalsData.forEach((p, idx) => {
      const mesh = meshRefs.current[idx];
      if (!mesh) return;

      // Staggered initial distribution so only 1-2 petals appear at a time
      if (!p.initialized) {
        p.x = (idx / count - 0.4) * viewport.width * 1.8;
        p.y = (Math.random() - 0.3) * viewport.height * 1.4;
        p.initialized = true;
      }

      // Soft breeze drift from right towards left
      p.x -= p.speedX * clampedDelta * 1.0;
      p.y -= p.speedY * clampedDelta * 0.85;

      // Aerodynamic wobble
      const wobble = Math.sin(p.x * p.swayFreq + p.rotZ) * p.swayAmp;
      mesh.position.set(p.x, p.y + wobble, p.z);

      // Graceful 3D tumbling
      p.rotX += p.rotSpeedX * clampedDelta;
      p.rotY += p.rotSpeedY * clampedDelta;
      p.rotZ += (p.rotSpeedZ + Math.sin(p.y * 1.8) * 0.4) * clampedDelta;
      mesh.rotation.set(p.rotX, p.rotY, p.rotZ);

      // Seamless wrap-around strictly based on viewport bounds
      if (p.x < -halfW - 0.3) {
        p.x = halfW + 0.3 + Math.random() * 0.8;
        p.y = (Math.random() - 0.25) * viewport.height;
      }
      if (p.y < -halfH - 0.3) {
        p.y = halfH + 0.3 + Math.random() * 0.6;
        p.x = (Math.random() - 0.3) * viewport.width;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {petalsData.map((p, idx) => {
        const mat = materials[idx % materials.length];
        return (
          <mesh
            key={idx}
            ref={(el) => {
              meshRefs.current[idx] = el;
            }}
            geometry={petalGeo}
            material={mat}
            position={[p.x, p.y, p.z]}
            scale={[p.scale, p.scale, p.scale]}
          />
        );
      })}
    </group>
  );
}

// Subtle atmospheric golden light specks, responsive to viewport
function AtmosphereGlowParticles({ count = 18 }: { count?: number }) {
  const { viewport } = useThree();
  const pointsRef = useRef<THREE.Points>(null);

  const [geo, velocities] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const vels: { x: number; y: number }[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      vels.push({
        x: 0.06 + Math.random() * 0.1,
        y: 0.03 + Math.random() * 0.07,
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return [geometry, vels];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const clampedDelta = Math.min(delta, 0.05);
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    for (let i = 0; i < count; i++) {
      let x = pos.getX(i) - velocities[i].x * clampedDelta;
      let y = pos.getY(i) - velocities[i].y * clampedDelta;

      if (x < -halfW - 0.2) x = halfW + 0.2;
      if (y < -halfH - 0.2) y = halfH + 0.2;

      pos.setXY(i, x, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        size={0.038}
        color="#fff4d0"
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Smooth parallax camera with gentle auto-sway on mobile
function ParallaxCamera() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMouseMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMouseMove);
  }, []);

  useFrame((_, delta) => {
    timeRef.current += Math.min(delta, 0.05);
    const t = timeRef.current;
    // Gentle ambient breathing drift (vital for mobile touch devices where there's no mouse)
    const autoX = Math.sin(t * 0.45) * 0.05;
    const autoY = Math.cos(t * 0.35) * 0.03;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseRef.current.x * 0.25 + autoX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouseRef.current.y * 0.16 + autoY, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene() {
  return (
    <>
      <ParallaxCamera />

      {/* Cinematic Lighting: soft warm sun + cool fill */}
      <ambientLight intensity={1.3} color="#f2f7ff" />
      <directionalLight position={[-4, 5, 4]} intensity={2.0} color="#fff6e8" />
      <pointLight position={[2, 2, 2]} intensity={5} distance={7} color="#9bc1ff" />

      {/* Small, realistic blue & bougainvillea petals: ultra-minimal, only 7 petals */}
      <FallingPetals count={7} />

      {/* Subtle faint evening atmosphere specks */}
      <AtmosphereGlowParticles count={8} />
    </>
  );
}

export function FlowerScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[6] h-full w-full overflow-hidden"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 42 }}
        dpr={[1, 2]}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
