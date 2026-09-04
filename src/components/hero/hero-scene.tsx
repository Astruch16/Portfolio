"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  PMREMGenerator,
  type Group,
  type Mesh,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { Laptop } from "@/components/hero/laptop";
import {
  createContactShadow,
  createGlowBand,
  createSurfaceNoise,
} from "@/lib/surface-noise";
import { createTerminalTexture } from "@/lib/terminal-texture";

/**
 * The hero object: a laptop running a build, sitting on a floating plinth, with
 * a glossy black sphere beside it.
 *
 * Built as a studio product set rather than a generic platform — a thick stone
 * slab over a thinner dark one, with a purple light trapped in the gap between
 * them. No `drei`: the scene needs an environment probe, five lights and a
 * handful of meshes, and pulling in a helper library for that would cost more
 * bytes than it saves. Everything animated is driven from `useFrame` against a
 * ref, so the React tree renders once.
 */

// A long lens from a three-quarter position, the way a product shot is taken:
// high enough to show the deck, low enough that it never reads as isometric.
// Fixed — see `onCreated` below.
const CAMERA = { x: 3.05, y: 2.7, z: 8.3 } as const;
// Aimed at the laptop rather than the centre of the set, so the plinth runs
// off to the right instead of sitting politely inside the frame.
const LOOK_AT = { x: 0.05, y: 0.3, z: 0.05 } as const;

const SPHERE_RADIUS = 0.49;

/** Scales the 1.5-unit placeholder laptop up to dominate the set. */
const LAPTOP_SCALE = 1.42;

/** Studio probe so the aluminium and the sphere read as real materials. */
function EnvironmentProbe() {
  const gl = useThree((state) => state.gl);

  const texture = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);

    room.dispose();
    pmrem.dispose();
    return target.texture;
  }, [gl]);

  useEffect(() => () => texture.dispose(), [texture]);

  return <primitive object={texture} attach="environment" />;
}

/**
 * Stone over shadow, with the light caught between them. The stepped widths are
 * what make it read as a set piece rather than a box: each layer is inset from
 * the one above, so the glow escapes as a band rather than a seam.
 */
function Plinth() {
  // Two passes of the same generator: a low-contrast tile that breaks up the
  // albedo into aggregate, and a high-contrast one so the sheen varies across
  // the surface. Uniform roughness is what makes a lit slab read as CG.
  const grain = useMemo(() => createSurfaceNoise(256, 0.32, [5, 4], true), []);
  const roughness = useMemo(() => createSurfaceNoise(256, 0.55, [6, 5]), []);
  const glow = useMemo(() => createGlowBand(), []);

  useEffect(() => {
    return () => {
      grain.dispose();
      roughness.dispose();
      glow.dispose();
    };
  }, [grain, roughness, glow]);

  return (
    <group>
      <mesh position={[0, -0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.6, 0.5, 3]} />
        <meshStandardMaterial
          color="#bcb7ae"
          map={grain}
          roughness={0.94}
          roughnessMap={roughness}
          metalness={0.02}
        />
      </mesh>

      {/* The light itself. Unlit material so it stays a clean band at any
          exposure instead of blowing out. */}
      <mesh position={[0, -0.54, 0]}>
        <boxGeometry args={[4.38, 0.17, 2.85]} />
        <meshBasicMaterial color="#8f79ff" toneMapped={false} />
      </mesh>

      <mesh position={[0, -0.78, 0]} receiveShadow>
        <boxGeometry args={[4.25, 0.24, 2.72]} />
        <meshStandardMaterial color="#121215" roughness={0.46} metalness={0.38} />
      </mesh>

      {/* Fills the cavity so the underside of the stone and the top of the dark
          slab both catch colour. */}
      {/* Bloom on the source itself, on the front face only and kept inside
          the slab's silhouette. Everything else — including the right face — is
          lit by the real lights below, because an additive plane seen at a
          glancing angle collapses into a streak up the corner. */}
      <mesh position={[0, -0.54, 1.53]}>
        <planeGeometry args={[4.45, 0.46]} />
        <meshBasicMaterial
          map={glow}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          opacity={0.85}
        />
      </mesh>

      {/* Sat well forward in the cavity so the purple falls on the faces the
          camera can actually see, and falls off with the geometry rather than
          with a texture's edges. */}
      {[-1.75, -0.6, 0.6, 1.75].map((x) => (
        <pointLight
          key={x}
          position={[x, -0.54, 1.3]}
          color="#7257ff"
          intensity={15}
          distance={3.6}
          decay={2}
        />
      ))}
    </group>
  );
}

/** Where the sphere sits at rest, and how far it rolls either side of that. */
// Sat forward on the stone rather than at the back edge: it keeps the sphere
// clear of the identity module in the corner above it at every viewport height.
const SPHERE_HOME = { x: 1.15, z: 1 } as const;
const ROLL_DISTANCE = 0.22;
const ROLL_PERIOD = 11;

function GlossSphere() {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!group.current || !mesh.current) return;

    const offset =
      Math.sin((clock.elapsedTime * Math.PI * 2) / ROLL_PERIOD) * ROLL_DISTANCE;

    // Rolling without slipping: the roll angle is the distance travelled
    // divided by the radius, so the surface never skates across the stone.
    group.current.position.x = SPHERE_HOME.x + offset;
    mesh.current.rotation.z = -offset / SPHERE_RADIUS;
  });

  return (
    <group ref={group} position={[SPHERE_HOME.x, 0, SPHERE_HOME.z]}>
      <mesh ref={mesh} position={[0, SPHERE_RADIUS, 0]} castShadow>
        <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
        <meshStandardMaterial color="#050505" metalness={1} roughness={0.06} />
      </mesh>
      {/* Travels with the sphere rather than staying pinned to the stone. */}
      <ContactShadow position={[0, 0.005, 0]} scale={1.5} />
    </group>
  );
}

/**
 * Tight darkening right where an object meets the stone, which a shadow map at
 * this size cannot resolve on its own.
 */
function ContactShadow({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  const map = useMemo(() => createContactShadow(), []);
  useEffect(() => () => map.dispose(), [map]);

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[scale, scale]} />
      <meshBasicMaterial map={map} transparent opacity={0.85} depthWrite={false} />
    </mesh>
  );
}

/**
 * Reports upward once the renderer has genuinely put a frame on the screen.
 *
 * `useFrame` callbacks run *before* `gl.render()`, so the second pass is the
 * first moment a drawn frame exists. The container above uses this to fade the
 * set in, instead of trusting a timer and risking an empty box.
 */
function FirstFrame({ onFirstFrame }: { onFirstFrame?: () => void }) {
  const frames = useRef(0);

  useFrame(() => {
    if (frames.current > 1) return;
    frames.current += 1;
    if (frames.current > 1) onFirstFrame?.();
  });

  return null;
}

function TerminalPlayback({ terminal }: { terminal: TerminalHandle }) {
  useFrame(({ clock }) => terminal.update(clock.elapsedTime * 1000));
  return null;
}

type TerminalHandle = ReturnType<typeof createTerminalTexture>;

export function HeroScene({
  active,
  onFirstFrame,
}: {
  active: boolean;
  onFirstFrame?: () => void;
}) {
  // One canvas and one texture for the life of the scene.
  const terminal = useMemo(() => createTerminalTexture(), []);
  useEffect(() => () => terminal.dispose(), [terminal]);

  return (
    <Canvas
      // Parked entirely when the hero leaves the viewport.
      frameloop={active ? "always" : "never"}
      shadows="percentage"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, toneMapping: ACESFilmicToneMapping }}
      camera={{ position: [CAMERA.x, CAMERA.y, CAMERA.z], fov: 28 }}
      // Aimed once at creation. The set is deliberately fixed: nothing here
      // tracks the pointer, so once it has settled it stays put.
      onCreated={({ camera }) => camera.lookAt(LOOK_AT.x, LOOK_AT.y, LOOK_AT.z)}
      style={{ pointerEvents: "none" }}
    >
      <EnvironmentProbe />
      <TerminalPlayback terminal={terminal} />
      <FirstFrame onFirstFrame={onFirstFrame} />

      <ambientLight intensity={0.32} />
      <directionalLight
        position={[-2.6, 4.4, 3.2]}
        intensity={1.75}
        castShadow
        // 1024 is ample at this object size and costs a quarter of the fill
        // of 2048 on the very first frame, which is when it matters most.
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={16}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-left={-5.5}
        shadow-camera-right={5.5}
        shadow-bias={-0.0005}
      />
      {/* Broad fill from the left, and a cool rim from behind the right to draw
          the edge of the sphere and the lid. */}
      <pointLight position={[-3.6, 1.3, 2.6]} intensity={3.4} distance={13} decay={2} />
      <pointLight
        position={[2.9, 1.7, -2.3]}
        color="#d8dcff"
        intensity={9}
        distance={11}
        decay={2}
      />
      {/* Bounce off the glow, catching the front underside of both objects. */}
      <pointLight
        position={[0.3, -0.05, 3]}
        color="#7257ff"
        intensity={8}
        distance={7}
        decay={2}
      />

      <Plinth />

      <group position={[-0.6, 0, 0.15]} rotation={[0, 0.12, 0]} scale={LAPTOP_SCALE}>
        <Laptop screenTexture={terminal.texture} />
      </group>

      <ContactShadow position={[-0.6, 0.005, 0.15]} scale={3.2} />

      <GlossSphere />
    </Canvas>
  );
}
