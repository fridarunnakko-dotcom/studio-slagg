"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// ─── Camera waypoints ─────────────────────────────────────────────────────────
// Each waypoint: position (x,y,z) + lookAt target (x,y,z)
// Gallery is ~1200×1200×550 cm, Z axis = depth, door at z≈-1210
export const WAYPOINTS = [
  // 0 — Front exterior, looking at entrance
  { pos: [0, 170, 1600],     target: [0, 170, 0] },
  // 1 — Just inside entrance, looking into gallery
  { pos: [0, 170, -900],     target: [0, 170, -1800] },
  // 2 — Center of gallery, looking toward back wall
  { pos: [0, 200, -500],     target: [0, 180, -1200] },
  // 3 — Left side, looking across the space
  { pos: [-500, 200, -600],  target: [500, 180, -600] },
  // 4 — Right side, looking across the space
  { pos: [500, 200, -600],   target: [-500, 180, -600] },
];

// ─── Materials ────────────────────────────────────────────────────────────────
function buildMaterials() {
  return {
    "inside walls":       new THREE.MeshStandardMaterial({ color: 0xf0ede8, roughness: 0.9, metalness: 0 }),
    "outside walls":      new THREE.MeshStandardMaterial({ color: 0xe2dfd8, roughness: 0.95, metalness: 0 }),
    "inside floor":       new THREE.MeshStandardMaterial({ color: 0xc8c4bc, roughness: 0.7, metalness: 0 }),
    "ceiling main house": new THREE.MeshStandardMaterial({ color: 0xf5f3f0, roughness: 0.9, metalness: 0 }),
    "ceiling - pillars":  new THREE.MeshStandardMaterial({ color: 0xf5f3f0, roughness: 0.9, metalness: 0 }),
    "pillars":            new THREE.MeshStandardMaterial({ color: 0xdedad2, roughness: 0.8, metalness: 0 }),
    "window":             new THREE.MeshStandardMaterial({ color: 0xb8cfd8, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35 }),
    "doors":              new THREE.MeshStandardMaterial({ color: 0x6b665e, roughness: 0.6, metalness: 0 }),
  };
}

function assignMaterials(obj: THREE.Object3D, materials: Record<string, THREE.Material>) {
  obj.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const name = child.name.toLowerCase();
    for (const [key, mat] of Object.entries(materials)) {
      if (name.includes(key)) { child.material = mat; return; }
    }
  });
}

// ─── Lerp helpers ─────────────────────────────────────────────────────────────
function lerpV3(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  return new THREE.Vector3().lerpVectors(a, b, t);
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function GalleryScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [waypoint, setWaypoint] = useState(0);
  const waypointRef = useRef(0);
  const animRef = useRef<{ from: { pos: THREE.Vector3; target: THREE.Vector3 }; to: { pos: THREE.Vector3; target: THREE.Vector3 }; t: number } | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const currentPosRef = useRef(new THREE.Vector3(...(WAYPOINTS[0].pos as [number, number, number])));
  const currentTargetRef = useRef(new THREE.Vector3(...(WAYPOINTS[0].target as [number, number, number])));

  function goTo(idx: number) {
    const clamped = Math.max(0, Math.min(WAYPOINTS.length - 1, idx));
    const from = {
      pos: currentPosRef.current.clone(),
      target: currentTargetRef.current.clone(),
    };
    const wp = WAYPOINTS[clamped];
    const to = {
      pos: new THREE.Vector3(...(wp.pos as [number, number, number])),
      target: new THREE.Vector3(...(wp.target as [number, number, number])),
    };
    animRef.current = { from, to, t: 0 };
    waypointRef.current = clamped;
    setWaypoint(clamped);
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ede8);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 8000);
    const wp0 = WAYPOINTS[0];
    camera.position.set(...(wp0.pos as [number, number, number]));
    camera.lookAt(...(wp0.target as [number, number, number]));
    cameraRef.current = camera;

    // ── Lighting ──────────────────────────────────────────────────────────────
    // Soft ambient
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.5));

    // Main overhead light (simulates skylight through roof)
    const sky = new THREE.DirectionalLight(0xfff5e8, 0.9);
    sky.position.set(0, 800, 200);
    sky.castShadow = true;
    sky.shadow.mapSize.set(2048, 2048);
    sky.shadow.camera.near = 10;
    sky.shadow.camera.far = 3000;
    sky.shadow.camera.left = -800;
    sky.shadow.camera.right = 800;
    sky.shadow.camera.top = 800;
    sky.shadow.camera.bottom = -800;
    scene.add(sky);

    // Fill light from windows (left & right)
    const fillL = new THREE.PointLight(0xe8f0ff, 0.4, 2000);
    fillL.position.set(-900, 450, -600);
    scene.add(fillL);

    const fillR = new THREE.PointLight(0xe8f0ff, 0.4, 2000);
    fillR.position.set(900, 450, -600);
    scene.add(fillR);

    // Subtle warm accent from entrance
    const entrance = new THREE.PointLight(0xfff0d8, 0.3, 1500);
    entrance.position.set(0, 300, 800);
    scene.add(entrance);

    // ── Load model ────────────────────────────────────────────────────────────
    const materials = buildMaterials();
    const loader = new OBJLoader();
    loader.load("/models/gallery.obj", (obj) => {
      obj.traverse((child) => { if (child instanceof THREE.Mesh) child.castShadow = child.receiveShadow = true; });
      assignMaterials(obj, materials);
      scene.add(obj);
    });

    // ── Animate ───────────────────────────────────────────────────────────────
    const TRANSITION_SPEED = 0.022; // t increment per frame (~45 frames @ 60fps)
    let rafId: number;

    function animate() {
      rafId = requestAnimationFrame(animate);

      if (animRef.current) {
        const anim = animRef.current;
        anim.t = Math.min(1, anim.t + TRANSITION_SPEED);
        const e = easeInOut(anim.t);
        const pos = lerpV3(anim.from.pos, anim.to.pos, e);
        const tgt = lerpV3(anim.from.target, anim.to.target, e);
        camera.position.copy(pos);
        camera.lookAt(tgt);
        currentPosRef.current.copy(pos);
        currentTargetRef.current.copy(tgt);
        if (anim.t >= 1) animRef.current = null;
      }

      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh", scrollSnapAlign: "start" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Navigation */}
      <nav
        className="fixed bottom-8 left-1/2 z-30 flex items-center gap-3"
        style={{ transform: "translateX(-50%)" }}
      >
        <button
          onClick={() => goTo(waypointRef.current - 1)}
          disabled={waypoint === 0}
          className="cursor-cross"
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: waypoint === 0 ? "var(--dust)" : "var(--ink)",
            background: "var(--paper)",
            border: "1px solid var(--line-strong)",
            padding: "8px 16px",
          }}
        >
          ← Prev
        </button>

        <div className="flex gap-2">
          {WAYPOINTS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="cursor-cross"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i === waypoint ? "var(--ink)" : "var(--line-strong)",
                border: "none",
                padding: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(waypointRef.current + 1)}
          disabled={waypoint === WAYPOINTS.length - 1}
          className="cursor-cross"
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: waypoint === WAYPOINTS.length - 1 ? "var(--dust)" : "var(--ink)",
            background: "var(--paper)",
            border: "1px solid var(--line-strong)",
            padding: "8px 16px",
          }}
        >
          Next →
        </button>
      </nav>
    </div>
  );
}
