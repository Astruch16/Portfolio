"use client";

import { useLoader } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Box3,
  Object3D,
  Vector3,
  type CanvasTexture,
  type InstancedMesh,
  type Mesh,
  type Group,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { laptopAsset } from "@/data/hero-model";

/**
 * The laptop, in two interchangeable forms behind one component.
 *
 * `<Laptop>` is the seam the rest of the scene talks to: it takes the terminal
 * texture and a group ref and does not care whether the geometry underneath is
 * the built-in placeholder or a loaded GLB. That ref is also where a future
 * hover/click affordance hangs — the group is already isolated, so adding an
 * "EXPLORE →" state later does not touch the scene composition.
 */

const OPEN_ANGLE = 0.244; // ~104° from the deck.
const SCREEN_WIDTH = 1.44;
const SCREEN_HEIGHT = 0.9;

type LaptopProps = {
  screenTexture: CanvasTexture;
  groupRef?: React.RefObject<Group | null>;
};

export function Laptop({ screenTexture, groupRef }: LaptopProps) {
  return (
    <group ref={groupRef} name="laptop">
      {laptopAsset.url ? (
        <LaptopModel url={laptopAsset.url} screenTexture={screenTexture} />
      ) : (
        <LaptopPlaceholder screenTexture={screenTexture} />
      )}
      {/* Screen spill onto the deck. Small radius so it does not light the
          whole plinth. */}
      <pointLight
        position={[0, 0.55, 0.18]}
        color="#9b8cff"
        intensity={0.7}
        distance={1.4}
        decay={2}
      />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Loaded asset                                                               */
/* -------------------------------------------------------------------------- */

function LaptopModel({
  url,
  screenTexture,
}: {
  url: string;
  screenTexture: CanvasTexture;
}) {
  const gltf = useLoader(GLTFLoader, url);

  const scene = useMemo(() => {
    const root = gltf.scene.clone(true);

    // Auto-fit: whatever units and origin the asset was exported with, it ends
    // up `targetWidth` across, centred on x/z, and resting on y = 0.
    const bounds = new Box3().setFromObject(root);
    const size = bounds.getSize(new Vector3());
    const centre = bounds.getCenter(new Vector3());
    const scale = laptopAsset.targetWidth / (size.x || 1);

    root.scale.setScalar(scale);
    root.position.set(
      -centre.x * scale,
      -bounds.min.y * scale,
      -centre.z * scale,
    );
    root.rotation.y = laptopAsset.yawCorrection;

    root.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (laptopAsset.screenMeshPattern.test(mesh.name)) {
        // Unlit, so the text stays crisp and legible regardless of how the
        // scene is lit or exposed — the same treatment the placeholder uses.
        mesh.material = new MeshBasicMaterial({
          map: screenTexture,
          toneMapped: false,
        });
        return;
      }

      // Retint the body so any sourced asset lands in our palette rather than
      // whatever finish it shipped with.
      const matte = laptopAsset.matteMeshPattern.test(mesh.name);
      mesh.material = new MeshStandardMaterial({
        color: matte ? "#0e0e10" : "#1c1d20",
        metalness: matte ? 0.3 : 0.62,
        roughness: matte ? 0.7 : 0.44,
      });
    });

    return root;
  }, [gltf, screenTexture]);

  return <primitive object={scene} />;
}

/* -------------------------------------------------------------------------- */
/* Placeholder                                                                */
/* -------------------------------------------------------------------------- */

const KEY_COLUMNS = 14;
const KEY_ROWS = 5;
const KEY_PITCH_X = 0.083;
const KEY_PITCH_Z = 0.08;

/**
 * Stand-in until a real model is supplied. Correct proportions, a real key
 * grid, a trackpad and thin bezels — enough to read as a laptop at hero scale,
 * but not an attempt at a photoreal model. `laptopAsset.url` retires it.
 */
function LaptopPlaceholder({ screenTexture }: { screenTexture: CanvasTexture }) {
  const keys = useRef<InstancedMesh>(null);

  const layout = useMemo(() => {
    const cells: [number, number][] = [];
    const originX = -((KEY_COLUMNS - 1) * KEY_PITCH_X) / 2;
    const originZ = -((KEY_ROWS - 1) * KEY_PITCH_Z) / 2;

    for (let row = 0; row < KEY_ROWS; row += 1) {
      for (let column = 0; column < KEY_COLUMNS; column += 1) {
        cells.push([originX + column * KEY_PITCH_X, originZ + row * KEY_PITCH_Z]);
      }
    }
    return cells;
  }, []);

  useLayoutEffect(() => {
    const mesh = keys.current;
    if (!mesh) return;

    const dummy = new Object3D();
    layout.forEach(([x, z], index) => {
      dummy.position.set(x, 0, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [layout]);

  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.026, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.052, 1.02]} />
        <meshStandardMaterial color="#1c1d20" metalness={0.62} roughness={0.44} />
      </mesh>

      {/* Recessed deck */}
      <mesh position={[0, 0.0525, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.38, 0.9]} />
        <meshStandardMaterial color="#0f0f11" metalness={0.4} roughness={0.7} />
      </mesh>

      {/* Keys */}
      <instancedMesh
        ref={keys}
        args={[undefined, undefined, KEY_COLUMNS * KEY_ROWS]}
        position={[0, 0.0555, -0.1]}
        castShadow
      >
        <boxGeometry args={[0.07, 0.008, 0.062]} />
        <meshStandardMaterial color="#08080a" metalness={0.15} roughness={0.82} />
      </instancedMesh>

      {/* Trackpad */}
      <mesh position={[0, 0.0535, 0.32]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.46, 0.3]} />
        <meshStandardMaterial color="#17171a" metalness={0.4} roughness={0.26} />
      </mesh>

      {/* Hinge barrel */}
      <mesh position={[0, 0.05, -0.48]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.019, 0.019, 1.24, 20]} />
        <meshStandardMaterial color="#131417" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Lid */}
      <group position={[0, 0.05, -0.49]} rotation={[-OPEN_ANGLE, 0, 0]}>
        <mesh position={[0, 0.5, -0.014]} castShadow>
          <boxGeometry args={[1.5, 1, 0.026]} />
          <meshStandardMaterial color="#1c1d20" metalness={0.62} roughness={0.44} />
        </mesh>
        {/* Bezel face — sits just proud of the shell so the screen insets. */}
        <mesh position={[0, 0.5, 0.0005]}>
          <planeGeometry args={[1.5, 1]} />
          <meshStandardMaterial color="#0a0a0c" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.505, 0.002]} name="screen">
          <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
          <meshBasicMaterial map={screenTexture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
