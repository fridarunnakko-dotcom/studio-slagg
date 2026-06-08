"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// --- Noise (same algorithm as canvas prototype) ---
function hash(x: number, y: number): number {
  let h = (x * 1619 + y * 31337 + 1013904223) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  return (h >>> 0) / 0xffffffff;
}

function vnoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return (
    hash(ix,   iy  ) * (1-ux) * (1-uy) +
    hash(ix+1, iy  ) * ux     * (1-uy) +
    hash(ix,   iy+1) * (1-ux) * uy     +
    hash(ix+1, iy+1) * ux     * uy
  );
}

function spackleHeight(x: number, y: number): number {
  const a = vnoise(x, y);
  const b = vnoise(x * 2.8 + 3.1, y * 2.8 + 1.7) * 0.38;
  const c = vnoise(x * 7.0 + 7.2, y * 7.0 + 5.1) * 0.10;
  return Math.pow(a * 0.65 + b + c, 1.6);
}

const TEX_SIZE  = 512;
const TEX_SCALE = 0.055; // blob density
const BUMP      = 10;    // normal map strength

function buildNormalMap(): THREE.DataTexture {
  const data = new Uint8Array(TEX_SIZE * TEX_SIZE * 4);
  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      const hL = spackleHeight((x - 1) * TEX_SCALE, y * TEX_SCALE);
      const hR = spackleHeight((x + 1) * TEX_SCALE, y * TEX_SCALE);
      const hD = spackleHeight(x * TEX_SCALE, (y - 1) * TEX_SCALE);
      const hU = spackleHeight(x * TEX_SCALE, (y + 1) * TEX_SCALE);
      let nx = (hL - hR) * BUMP;
      let ny = (hD - hU) * BUMP;
      let nz = 1.0;
      const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
      nx /= len; ny /= len; nz /= len;
      const i = (y * TEX_SIZE + x) * 4;
      data[i]   = Math.round((nx * 0.5 + 0.5) * 255); // R = X
      data[i+1] = Math.round((ny * 0.5 + 0.5) * 255); // G = Y
      data[i+2] = Math.round((nz * 0.5 + 0.5) * 255); // B = Z
      data[i+3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, TEX_SIZE, TEX_SIZE, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

export function ThreeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Camera — ortho, plane fills it exactly
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // Scene
    const scene = new THREE.Scene();

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0xffffff, 8, 0, 2);
    pointLight.position.set(0, 0.2, 0.6);
    scene.add(pointLight);

    // Build normal map (runs once, ~100ms)
    const normalMap = buildNormalMap();

    // Plane with PBR material
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0xe7ec68,
      normalMap,
      normalScale: new THREE.Vector2(1, 1),
      roughness: 1.0,
      metalness: 0.0,
    });
    scene.add(new THREE.Mesh(geometry, material));

    // Mouse → point light
    function onMouseMove(e: MouseEvent) {
      pointLight.position.set(
        (e.clientX / window.innerWidth)  *  2 - 1,
        (e.clientY / window.innerHeight) * -2 + 1,
        0.6,
      );
    }
    window.addEventListener("mousemove", onMouseMove);

    // RAF loop
    let rafId: number;
    function animate() {
      rafId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    function onResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
      normalMap.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />
  );
}
