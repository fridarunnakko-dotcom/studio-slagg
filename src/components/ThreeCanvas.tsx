"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { type ConcreteSettings } from "./ConcreteControls";

// Vertex shader — passes UV and clip-space position through
const vert = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader — procedural spackle normal + Phong lighting, per pixel
const frag = /* glsl */`
precision highp float;
varying vec2 vUv;

uniform vec2  uResolution;   // viewport in CSS pixels
uniform vec3  uLight;        // light position in UV space (z = height fraction)
uniform float uAmbient;
uniform float uIntensity;
uniform float uBump;
uniform float uScale;        // noise scale (blobs per pixel)

// --- Integer hash (matches JS prototype) ---
float hash2(int ix, int iy) {
  uint x = uint(ix);
  uint y = uint(iy);
  uint h = (x * 1619u + y * 31337u + 1013904223u);
  h ^= (h >> 16u); h = h * 0x45d9f3bu;
  h ^= (h >> 16u); h = h * 0x45d9f3bu;
  return float(h) / float(0xffffffffu);
}

float vnoise(float px, float py) {
  int ix = int(floor(px));
  int iy = int(floor(py));
  float fx = px - float(ix);
  float fy = py - float(iy);
  float ux = fx*fx*(3.0 - 2.0*fx);
  float uy = fy*fy*(3.0 - 2.0*fy);
  return
    hash2(ix,   iy  ) * (1.0-ux) * (1.0-uy) +
    hash2(ix+1, iy  ) * ux       * (1.0-uy) +
    hash2(ix,   iy+1) * (1.0-ux) * uy       +
    hash2(ix+1, iy+1) * ux       * uy;
}

float spackle(float x, float y) {
  float a = vnoise(x, y);
  float b = vnoise(x*2.8+3.1, y*2.8+1.7) * 0.38;
  float c = vnoise(x*7.0+7.2, y*7.0+5.1) * 0.10;
  return pow(a*0.65 + b + c, 1.6);
}

void main() {
  // Map UV → pixel coords (consistent scale across any viewport)
  vec2 px = vUv * uResolution;
  float s = uScale;

  // Finite-difference normal
  float hL = spackle((px.x - 1.0)*s, px.y*s);
  float hR = spackle((px.x + 1.0)*s, px.y*s);
  float hD = spackle(px.x*s, (px.y - 1.0)*s);
  float hU = spackle(px.x*s, (px.y + 1.0)*s);
  vec3 N = normalize(vec3((hL - hR)*uBump, (hD - hU)*uBump, 1.0));

  // Light vector (uLight.xy in UV space, z is height in UV units)
  vec2 lightPx = uLight.xy * uResolution;
  float lightZ  = uLight.z  * max(uResolution.x, uResolution.y);
  vec3 L = normalize(vec3(lightPx - px, lightZ));

  float diff   = max(0.0, dot(N, L));
  float dist2  = dot(lightPx - px, lightPx - px);
  float maxD2  = dot(uResolution, uResolution);
  float atten  = 1.0 - pow(dist2 / maxD2, 1.15);
  float I      = uAmbient + diff * uIntensity * atten;

  // Neon surface color #e7ec68
  vec3 color = vec3(0.906, 0.925, 0.408) * I;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

export function ThreeCanvas({ settings }: { settings: ConcreteSettings }) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const settingsRef   = useRef(settings);
  const uniformsRef   = useRef<Record<string, { value: unknown }> | null>(null);

  // Sync settings into uniforms without re-running the effect
  useEffect(() => {
    settingsRef.current = settings;
    const u = uniformsRef.current;
    if (!u) return;
    (u.uAmbient   as { value: number }).value   = settings.ambient;
    (u.uIntensity as { value: number }).value   = settings.light;
    (u.uBump      as { value: number }).value   = settings.bump;
    (u.uScale     as { value: number }).value   = settings.scale;
  }, [settings]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    const scene = new THREE.Scene();

    const s = settingsRef.current;
    const uniforms = {
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uLight:      { value: new THREE.Vector3(0.5, 0.5, s.lightHeight) },
      uAmbient:    { value: s.ambient },
      uIntensity:  { value: s.light },
      uBump:       { value: s.bump },
      uScale:      { value: s.scale },
    };
    uniformsRef.current = uniforms as Record<string, { value: unknown }>;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
    scene.add(new THREE.Mesh(geometry, material));

    function onMouseMove(e: MouseEvent) {
      uniforms.uLight.value.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight,
        settingsRef.current.lightHeight,
      );
    }
    window.addEventListener("mousemove", onMouseMove);

    let rafId: number;
    function animate() {
      rafId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
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
