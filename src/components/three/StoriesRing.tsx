"use client";
/* eslint-disable react-hooks/immutability --
   three.js materials, uniforms and buffers are created once and mutated imperatively inside useFrame,
   which is the intended react-three-fiber pattern. Components here opt out of the React Compiler. */

import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Image } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

export type RingItem = { slug: string; couple: string; url: string };

const RADIUS = 4.2;
const CARD_W = 1.9;
const CARD_H = CARD_W * 1.25;

type Props = {
  items: RingItem[];
  progress: MotionValue<number>;
  onFocus: (index: number) => void;
  onSelect: (slug: string) => void;
  setCursor: (label: string | null) => void;
};

function Card({ item, index, count, onSelect, setCursor }: { item: RingItem; index: number; count: number } & Pick<Props, "onSelect" | "setCursor">) {
  "use no memo";
  const ref = useRef<THREE.Mesh>(null);
  const hovered = useRef(false);
  const angle = (index / count) * Math.PI * 2;

  // Bend the card so the ring reads as one continuous cylinder.
  useLayoutEffect(() => {
    const geo = ref.current?.geometry as THREE.BufferGeometry | undefined;
    if (!geo) return;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) * CARD_W;
      pos.setZ(i, -(x * x) / (2 * RADIUS));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, []);

  useFrame((_, delta) => {
    const m = ref.current?.material as unknown as { grayscale: number; zoom: number } | undefined;
    if (!m) return;
    const k = 1 - Math.pow(0.002, delta);
    m.grayscale += ((hovered.current ? 0 : 0.35) - m.grayscale) * k;
    m.zoom += ((hovered.current ? 1.08 : 1) - m.zoom) * k;
  });

  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- drei <Image> is a WebGL mesh, not an <img>
    <Image
      ref={ref}
      url={item.url}
      segments={24}
      scale={[CARD_W, CARD_H]}
      position={[Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS]}
      rotation={[0, angle, 0]}
      side={THREE.FrontSide}
      toneMapped={false}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        hovered.current = true;
        setCursor("View");
      }}
      onPointerOut={() => {
        hovered.current = false;
        setCursor(null);
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(item.slug);
      }}
    />
  );
}

function Ring({ items, progress, onFocus, onSelect, setCursor }: Props) {
  "use no memo";
  const group = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, lastX: 0, offset: 0, velocity: 0, moved: 0 });
  const canvas = useThree((s) => s.gl.domElement);
  const focused = useRef(-1);
  const step = (Math.PI * 2) / items.length;

  useEffect(() => {
    const d = drag.current;
    const down = (e: PointerEvent) => {
      d.active = true;
      d.lastX = e.clientX;
      d.moved = 0;
    };
    const move = (e: PointerEvent) => {
      if (!d.active) return;
      const dx = e.clientX - d.lastX;
      d.lastX = e.clientX;
      d.moved += Math.abs(dx);
      d.offset += dx * 0.005;
      d.velocity = dx * 0.005;
    };
    const up = () => (d.active = false);
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [canvas]);

  // A drag that ends over a card shouldn't count as a click.
  const select = (slug: string) => drag.current.moved < 6 && onSelect(slug);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const d = drag.current;
    if (!d.active) {
      d.offset += d.velocity;
      d.velocity *= Math.pow(0.02, delta);
    }
    const target = -progress.get() * step * (items.length - 1) + d.offset;
    g.rotation.y += (target - g.rotation.y) * (1 - Math.pow(0.0015, delta));

    // Gentle tilt toward the pointer.
    g.rotation.x += (state.pointer.y * 0.06 - g.rotation.x) * 0.05;
    g.position.y += (state.pointer.y * 0.1 - g.position.y) * 0.05;

    const idx = ((Math.round(-g.rotation.y / step) % items.length) + items.length) % items.length;
    if (idx !== focused.current) {
      focused.current = idx;
      onFocus(idx);
    }
  });

  return (
    <group ref={group}>
      {items.map((item, i) => (
        <Card key={item.slug} item={item} index={i} count={items.length} onSelect={select} setCursor={setCursor} />
      ))}
    </group>
  );
}

export default function StoriesRing(props: Omit<Props, "setCursor">) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const setCursor = (label: string | null) => {
    if (!wrap.current) return;
    if (label) wrap.current.dataset.cursor = label;
    else delete wrap.current.dataset.cursor;
  };

  return (
    <div ref={wrap} className="absolute inset-0 touch-pan-y">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0, RADIUS + 8], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Ring {...props} setCursor={setCursor} />
        </Suspense>
      </Canvas>
    </div>
  );
}
