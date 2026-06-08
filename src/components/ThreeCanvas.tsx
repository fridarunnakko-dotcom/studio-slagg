"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Orthographic camera — frustum exactly covers the plane
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // Scene
    const scene = new THREE.Scene();

    // Full-screen plane — 2×2 fills the (-1,1) ortho frustum exactly
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xe7ec68 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Render loop
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
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
    />
  );
}
