"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, NormalBlending, type Group, type ShaderMaterial } from "three";

import { buildForms, hash } from "@/lib/sculpture-forms";
import { sculpture } from "@/lib/sculpture-state";

/**
 * The hero sculpture: a few thousand particles holding one of three forms.
 *
 * Every particle carries its position in all six forms as attributes, and a
 * single shader blends between them by six weights the CPU eases toward the
 * form being asked for — two vec3 uniforms, since WebGL has no vec6. While the weights are mixed, particles lift off along
 * their own direction and settle back, so a morph reads as the sculpture coming
 * apart and reassembling rather than as one outline sliding into another.
 *
 * The pointer is handled in screen space inside the same shader: particles
 * near it are pushed aside and take the accent colour. Dragging turns the
 * sculpture with inertia, a click scatters it, and all of it is one draw call —
 * no per-particle work on the CPU.
 *
 * Drawn on the cream hero in ink, with a small share of particles in the site's
 * purple, rather than as glowing points: additive glow disappears on paper.
 */

const COUNT = 7200;
const ACCENT_SHARE = 0.11;

const vertex = /* glsl */ `
  attribute vec3 aForm0;
  attribute vec3 aForm1;
  attribute vec3 aForm2;
  attribute vec3 aForm3;
  attribute vec3 aForm4;
  attribute vec3 aForm5;
  attribute vec4 aSeed;
  attribute float aAccent;

  uniform vec3 uWeightsA;
  uniform vec3 uWeightsB;
  uniform float uTime;
  uniform float uBurst;
  uniform vec2 uPointer;
  uniform float uPointerOn;
  uniform float uAspect;
  uniform float uSize;
  uniform float uPixelRatio;

  varying float vDepth;
  varying float vAccent;
  varying float vTouch;

  void main() {
    vec3 p = aForm0 * uWeightsA.x + aForm1 * uWeightsA.y + aForm2 * uWeightsA.z
           + aForm3 * uWeightsB.x + aForm4 * uWeightsB.y + aForm5 * uWeightsB.z;

    // Mid-morph lift: zero when one form holds, strongest halfway between two.
    float settled = max(
      max(max(uWeightsA.x, uWeightsA.y), uWeightsA.z),
      max(max(uWeightsB.x, uWeightsB.y), uWeightsB.z)
    );
    float lift = (1.0 - settled) * 1.6;
    p += aSeed.xyz * lift * (0.35 + aSeed.w * 0.65);

    // A slow breath, different for every particle.
    p += aSeed.xyz * sin(uTime * 0.9 + aSeed.w * 6.2831) * 0.014;

    // Scatter.
    p += aSeed.xyz * uBurst * (0.8 + aSeed.w * 1.4);

    vec4 view = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * view;

    // Push aside in screen space, so the effect is the same size at any depth.
    vec2 ndc = clip.xy / clip.w;
    vec2 away = ndc - uPointer;
    away.x *= uAspect;
    float dist = length(away);
    float touch = uPointerOn * (1.0 - smoothstep(0.0, 0.3, dist));
    vec2 dir = away / max(dist, 0.0001);
    dir.x /= uAspect;
    ndc += dir * touch * touch * 0.16;
    clip.xy = ndc * clip.w;

    gl_Position = clip;
    gl_PointSize = uSize * uPixelRatio * (1.0 + aAccent * 0.7 + touch * 0.8) * (5.2 / -view.z);

    vDepth = clamp((-view.z - 4.1) / 3.4, 0.0, 1.0);
    vAccent = aAccent;
    vTouch = touch;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uAccentColor;
  uniform float uOpacity;

  varying float vDepth;
  varying float vAccent;
  varying float vTouch;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float soft = 1.0 - smoothstep(0.32, 0.5, r);

    vec3 color = mix(uInk, uAccentColor, max(vAccent, vTouch));
    // Nearer particles darker, farther ones fading into the paper.
    float alpha = soft * mix(0.95, 0.28, vDepth) * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

type Interaction = {
  pointer: { x: number; y: number; on: boolean };
  drag: { active: boolean; lastX: number; lastY: number; moved: number };
  spin: { yaw: number; pitch: number; vYaw: number; vPitch: number };
};

/**
 * Pointer, drag and spin, written by the DOM listeners and read by the render
 * loop. Module scope rather than React state: it changes every frame and is
 * never rendered, and there is only ever one hero sculpture on the page.
 */
const interaction: Interaction = {
  pointer: { x: 9, y: 9, on: false },
  drag: { active: false, lastX: 0, lastY: 0, moved: 0 },
  spin: { yaw: 0, pitch: 0, vYaw: 0, vPitch: 0 },
};

function Particles({ onFirstFrame }: { onFirstFrame?: () => void }) {
  const group = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const { gl, size } = useThree();

  const attributes = useMemo(() => {
    const forms = buildForms(COUNT);
    const seed = new Float32Array(COUNT * 4);
    const accent = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i += 1) {
      // A random direction on the sphere, for lift and scatter.
      const u = hash(i * 1.31) * 2 - 1;
      const t = hash(i * 2.17) * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      seed.set([s * Math.cos(t), u, s * Math.sin(t), hash(i * 3.73)], i * 4);
      accent[i] = hash(i * 5.19) < ACCENT_SHARE ? 1 : 0;
    }
    return { forms, seed, accent };
  }, []);

  const uniforms = useMemo(
    () => ({
      uWeightsA: { value: [1, 0, 0] as [number, number, number] },
      uWeightsB: { value: [0, 0, 0] as [number, number, number] },
      uTime: { value: 0 },
      uBurst: { value: 1.6 },
      uPointer: { value: [9, 9] as [number, number] },
      uPointerOn: { value: 0 },
      uAspect: { value: 1 },
      uSize: { value: 2.3 },
      uPixelRatio: { value: 1 },
      uInk: { value: new Color("#141414") },
      uAccentColor: { value: new Color("#7257ff") },
      uOpacity: { value: 0 },
    }),
    [],
  );

  const weights = useRef<number[]>([1, 0, 0, 0, 0, 0]);
  const burst = useRef({ value: 1.6, seen: sculpture.getSnapshot().burst });
  const frames = useRef(0);

  useFrame(({ clock }, delta) => {
    const m = material.current;
    const g = group.current;
    const it = interaction;
    if (!m || !g) return;

    const dt = Math.min(delta, 1 / 30);
    const state = sculpture.getSnapshot();

    // Ease each weight toward the requested form.
    const w = weights.current;
    const ease = 1 - Math.exp(-dt * 2.6);
    for (let k = 0; k < w.length; k += 1) {
      w[k] += ((k === state.form ? 1 : 0) - w[k]) * ease;
    }

    if (state.burst !== burst.current.seen) {
      burst.current.seen = state.burst;
      burst.current.value = Math.max(burst.current.value, 1.2);
    }
    burst.current.value *= Math.exp(-dt * 2.2);

    // Turning: a slow idle sway, plus whatever the visitor put into it,
    // bleeding off and drifting back toward rest.
    const spin = it.spin;
    if (!it.drag.active) {
      spin.yaw += spin.vYaw * dt;
      spin.pitch += spin.vPitch * dt;
      spin.vYaw *= Math.exp(-dt * 1.6);
      spin.vPitch *= Math.exp(-dt * 1.6);
      spin.pitch *= Math.exp(-dt * 0.8);
    }
    spin.pitch = Math.max(-0.7, Math.min(0.7, spin.pitch));
    const t = clock.elapsedTime;
    g.rotation.y = -0.5 + Math.sin(t * 0.22) * 0.38 + spin.yaw;
    g.rotation.x = 0.26 + Math.sin(t * 0.17) * 0.06 + spin.pitch;

    const u = m.uniforms;
    u.uWeightsA.value = [w[0], w[1], w[2]];
    u.uWeightsB.value = [w[3], w[4], w[5]];
    u.uTime.value = t;
    u.uBurst.value = burst.current.value;
    u.uPointer.value = [it.pointer.x, it.pointer.y];
    u.uPointerOn.value += ((it.pointer.on ? 1 : 0) - u.uPointerOn.value) * (1 - Math.exp(-dt * 8));
    u.uAspect.value = size.width / Math.max(1, size.height);
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uOpacity.value = Math.min(1, u.uOpacity.value + dt * 1.4);

    // `useFrame` runs before the render, so the second pass is the first
    // moment a drawn frame exists.
    if (frames.current < 2) {
      frames.current += 1;
      if (frames.current === 2) onFirstFrame?.();
    }
  });

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry>
          {/* `position` is required by three for bounds; the shader ignores it. */}
          <bufferAttribute attach="attributes-position" args={[attributes.forms[0], 3]} />
          {attributes.forms.map((form, i) => (
            <bufferAttribute key={i} attach={`attributes-aForm${i}`} args={[form, 3]} />
          ))}
          <bufferAttribute attach="attributes-aSeed" args={[attributes.seed, 4]} />
          <bufferAttribute attach="attributes-aAccent" args={[attributes.accent, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={NormalBlending}
        />
      </points>
    </group>
  );
}

export function SculptureScene({
  active,
  onFirstFrame,
}: {
  active: boolean;
  onFirstFrame?: () => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  // Bumped whenever the WebGL context is lost, which remounts the canvas with
  // a fresh one. Browsers drop contexts on a GPU reset, when too many are open,
  // or when a phone backgrounds the tab — and a hot reload in development does
  // it every time. Left alone, the canvas stays on the page and never draws
  // again until a full reload.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const it = interaction;

    const toNdc = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      it.pointer.x = ((event.clientX - box.left) / box.width) * 2 - 1;
      it.pointer.y = -(((event.clientY - box.top) / box.height) * 2 - 1);
    };

    const down = (event: PointerEvent) => {
      it.drag = { active: true, lastX: event.clientX, lastY: event.clientY, moved: 0 };
      it.spin.vYaw = 0;
      it.spin.vPitch = 0;
      el.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      toNdc(event);
      it.pointer.on = true;
      if (!it.drag.active) return;
      const dx = event.clientX - it.drag.lastX;
      const dy = event.clientY - it.drag.lastY;
      it.drag.lastX = event.clientX;
      it.drag.lastY = event.clientY;
      it.drag.moved += Math.abs(dx) + Math.abs(dy);
      it.spin.yaw += dx * 0.008;
      it.spin.pitch += dy * 0.006;
      // Carry the drag's speed into a fling when it's released.
      it.spin.vYaw = dx * 0.5;
      it.spin.vPitch = dy * 0.35;
    };
    const up = (event: PointerEvent) => {
      if (it.drag.active && it.drag.moved < 5) sculpture.scatter();
      it.drag.active = false;
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    };
    const leave = () => {
      if (!it.drag.active) it.pointer.on = false;
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={wrapper}
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
      aria-hidden
    >
      <Canvas
        key={generation}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            "webglcontextlost",
            (event) => {
              event.preventDefault();
              setGeneration((g) => g + 1);
            },
            { once: true },
          );
        }}
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true }}
        camera={{ position: [0, 0.35, 6.3], fov: 38 }}
      >
        <Particles onFirstFrame={onFirstFrame} />
      </Canvas>
    </div>
  );
}
