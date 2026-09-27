"use client";
/* eslint-disable react-hooks/immutability, react-hooks/purity --
   three.js materials, uniforms and buffers are created once and mutated imperatively inside useFrame,
   which is the intended react-three-fiber pattern. Components here opt out of the React Compiler. */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { frostFragment, frostVertex, snowFragment, snowVertex } from "./frostShader";

type Props = {
  images: string[];
  /** Seconds each photo stays before the frost dissolve. */
  interval?: number;
  play: boolean;
  onSlide?: (index: number) => void;
  onReady?: () => void;
};

const TRANSITION = 2.4;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function FrostPlane({ images, interval = 6, play, onSlide, onReady }: Props) {
  "use no memo";
  const textures = useTexture(images);
  const { size, gl } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const target = useRef(new THREE.Vector2(0.5, 0.5));
  const state = useRef({ index: 0, next: 1, clock: 0, transitioning: false, t: 0, intro: 0, vel: 0 });

  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      t.needsUpdate = true;
      gl.initTexture(t);
    });
    onReady?.();
  }, [textures, gl, onReady]);

  const dims = (t: THREE.Texture) => {
    const img = t.image as { width: number; height: number };
    return new THREE.Vector2(img.width, img.height);
  };

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: frostVertex,
        fragmentShader: frostFragment,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTex0: { value: textures[0] },
          uTex1: { value: textures[1 % textures.length] },
          uImg0: { value: dims(textures[0]) },
          uImg1: { value: dims(textures[1 % textures.length]) },
          uRes: { value: new THREE.Vector2(1, 1) },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uVel: { value: 0 },
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uFrost: { value: new THREE.Color("#c9d6df") },
        },
      }),
    [textures],
  );

  useEffect(() => {
    material.uniforms.uRes.value.set(size.width, size.height);
  }, [size, material]);

  useEffect(() => {
    const move = (e: PointerEvent) => target.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20);
    const s = state.current;
    const u = material.uniforms;
    u.uTime.value += delta;

    if (play) s.intro = Math.min(1, s.intro + delta / 2.2);
    u.uIntro.value = easeInOut(s.intro);

    const prev = mouse.current.clone();
    mouse.current.lerp(target.current, 1 - Math.pow(0.001, delta));
    const speed = prev.distanceTo(mouse.current) / Math.max(delta, 1e-3);
    s.vel += (Math.min(speed, 3) - s.vel) * (1 - Math.pow(0.02, delta));
    u.uMouse.value.copy(mouse.current);
    u.uVel.value = s.vel;

    if (!play || textures.length < 2) return;
    s.clock += delta;
    if (!s.transitioning && s.clock > interval) {
      s.transitioning = true;
      s.t = 0;
      onSlide?.(s.next);
    }
    if (s.transitioning) {
      s.t = Math.min(1, s.t + delta / TRANSITION);
      u.uProgress.value = easeInOut(s.t);
      if (s.t >= 1) {
        s.index = s.next;
        s.next = (s.next + 1) % textures.length;
        u.uTex0.value = textures[s.index];
        u.uImg0.value = dims(textures[s.index]);
        u.uTex1.value = textures[s.next];
        u.uImg1.value = dims(textures[s.next]);
        u.uProgress.value = 0;
        s.transitioning = false;
        s.clock = 0;
      }
    }
  });

  return (
    <mesh frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

function Snow({ count = 420 }: { count?: number }) {
  "use no memo";
  const { gl } = useThree();
  const target = useRef(new THREE.Vector2(0.5, 0.5));

  const [geometry, material] = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * 2 - 1;
      pos[i * 3 + 1] = Math.random() * 2 - 1;
      pos[i * 3 + 2] = Math.random();
      sizes[i] = 1.5 + Math.pow(Math.random(), 3) * 5;
      speeds[i] = 0.4 + Math.random() * 0.9;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: snowVertex,
      fragmentShader: snowFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
    });
    return [g, m] as const;
  }, [count]);

  useEffect(() => {
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    const move = (e: PointerEvent) => target.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      geometry.dispose();
      material.dispose();
    };
  }, [gl, geometry, material]);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += Math.min(delta, 1 / 20);
    material.uniforms.uMouse.value.lerp(target.current, 0.05);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={1} />;
}

export default function HeroCanvas(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering entirely when the hero is scrolled out of view.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        flat
        // A soft photographic image doesn't need full retina resolution; this keeps the fragment cost down.
        dpr={[1, 1.25]}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 1] }}
      >
        <Suspense fallback={null}>
          <FrostPlane {...props} />
          <Snow count={typeof window !== "undefined" && window.innerWidth < 768 ? 200 : 420} />
        </Suspense>
      </Canvas>
    </div>
  );
}
