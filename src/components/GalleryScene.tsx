"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function GalleryScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f0);

    // Camera inside the gallery — cm units, gallery is ~1200x1200x550
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      5000,
    );
    camera.position.set(0, 170, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 170, -400);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.minPolarAngle = Math.PI * 0.15;
    controls.enablePan = false;
    controls.update();

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(200, 500, 100);
    scene.add(dirLight);

    // Gallery materials
    const materials: Record<string, THREE.Material> = {
      "inside walls": new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.9 }),
      "outside walls": new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.95 }),
      "inside floor": new THREE.MeshStandardMaterial({ color: 0xd4d0c8, roughness: 0.8 }),
      "ceiling main house": new THREE.MeshStandardMaterial({ color: 0xfafaf7, roughness: 0.9 }),
      "ceiling - pillars": new THREE.MeshStandardMaterial({ color: 0xfafaf7, roughness: 0.9 }),
      "pillars": new THREE.MeshStandardMaterial({ color: 0xe0ddd5, roughness: 0.85 }),
      "window": new THREE.MeshStandardMaterial({ color: 0xc8dde8, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.4 }),
      "doors": new THREE.MeshStandardMaterial({ color: 0x8b8578, roughness: 0.7 }),
    };

    const loader = new OBJLoader();
    loader.load("/models/gallery.obj", (obj) => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const name = child.name.toLowerCase();
          for (const [key, mat] of Object.entries(materials)) {
            if (name.includes(key)) {
              child.material = mat;
              break;
            }
          }
        }
      });
      scene.add(obj);
    });

    let rafId: number;
    function animate() {
      rafId = requestAnimationFrame(animate);
      controls.update();
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
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full cursor-cross"
      style={{ height: "100vh", scrollSnapAlign: "start" }}
    />
  );
}
