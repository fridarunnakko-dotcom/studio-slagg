"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { type ConcreteSettings } from "./ConcreteControls";
import { type EmbossSettings } from "./EmbossControls";

const vert = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const frag = /* glsl */`
precision highp float;
varying vec2 vUv;

uniform vec2      uResolution;
uniform vec3      uLight;
uniform float     uAmbient;
uniform float     uIntensity;
uniform float     uBump;
uniform float     uScale;
uniform float     uRoughness;  // micro-noise on normals
uniform float     uColorVar;   // peak/valley color contrast
uniform float     uFalloff;    // light distance falloff
uniform sampler2D uLogoMask;
uniform float     uEmboss;     // 0 → 1 fade-in
uniform float     uBevel;      // bevel sharpness
uniform float     uAO;         // AO darkening strength
uniform float     uHasLogo;    // 0 or 1

float hash2(int ix, int iy) {
  uint x = uint(ix);
  uint y = uint(iy);
  uint h = (x * 1619u + y * 31337u + 1013904223u);
  h ^= (h >> 16u); h = h * 0x45d9f3bu;
  h ^= (h >> 16u); h = h * 0x45d9f3bu;
  return float(h) / float(0xffffffffu);
}

float vnoise(float px, float py) {
  int ix = int(floor(px)); int iy = int(floor(py));
  float fx = px - float(ix); float fy = py - float(iy);
  float ux = fx*fx*(3.0-2.0*fx); float uy = fy*fy*(3.0-2.0*fy);
  return
    hash2(ix,   iy  )*(1.0-ux)*(1.0-uy) +
    hash2(ix+1, iy  )*ux      *(1.0-uy) +
    hash2(ix,   iy+1)*(1.0-ux)*uy       +
    hash2(ix+1, iy+1)*ux      *uy;
}

float spackle(float x, float y) {
  float a = vnoise(x, y);
  float b = vnoise(x*2.8+3.1, y*2.8+1.7)*0.38;
  float c = vnoise(x*7.0+7.2, y*7.0+5.1)*0.10;
  return pow(a*0.65+b+c, 1.6);
}

void main() {
  vec2 px = vUv * uResolution;
  float s = uScale;

  // --- Macro spackle normal (blobs) ---
  float hC  = spackle(px.x*s,       px.y*s);
  float hL  = spackle((px.x-1.0)*s, px.y*s);
  float hR  = spackle((px.x+1.0)*s, px.y*s);
  float hD  = spackle(px.x*s, (px.y-1.0)*s);
  float hU  = spackle(px.x*s, (px.y+1.0)*s);
  vec3 N = normalize(vec3((hL-hR)*uBump, (hD-hU)*uBump, 1.0));

  // --- Micro-roughness: fine grain noise breaks up the "3D model" look ---
  float ms = s * 9.0;
  float mhL = vnoise((px.x-0.5)*ms, px.y*ms);
  float mhR = vnoise((px.x+0.5)*ms, px.y*ms);
  float mhD = vnoise(px.x*ms, (px.y-0.5)*ms);
  float mhU = vnoise(px.x*ms, (px.y+0.5)*ms);
  vec3 N_micro = normalize(vec3((mhL-mhR)*2.5, (mhD-mhU)*2.5, 1.0));
  N = normalize(mix(N, N_micro, uRoughness));

  // --- Color variation: darker cement paste in valleys, lighter aggregate peaks ---
  // hC: 0=valley, 1=peak
  vec3 baseColor = vec3(0.906, 0.925, 0.408);
  // Valleys shift slightly warmer/darker, peaks stay neon
  vec3 color = mix(baseColor - vec3(uColorVar*1.2, uColorVar*0.8, uColorVar*0.3),
                   baseColor + vec3(uColorVar*0.3, uColorVar*0.4, 0.0),
                   hC);

  // --- Emboss: multi-sample gradient for real bevel normals ---
  // Sample the sharp mask at 4 distances; averaging gives a smooth gradient
  // over the bevel width while letter corners stay blocky (no blur rounding).
  // We only tilt N at the edge — inside letters the spackle texture is preserved
  // so the surface looks physically impressed rather than painted on.
  if (uHasLogo > 0.5) {
    float rx = 1.0 / uResolution.x;
    float ry = 1.0 / uResolution.y;
    float d1 = uBevel * 0.25, d2 = uBevel * 0.5, d3 = uBevel * 0.75, d4 = uBevel;
    float gx =
      (texture2D(uLogoMask, vUv + vec2(-d1*rx, 0)).r - texture2D(uLogoMask, vUv + vec2( d1*rx, 0)).r) +
      (texture2D(uLogoMask, vUv + vec2(-d2*rx, 0)).r - texture2D(uLogoMask, vUv + vec2( d2*rx, 0)).r) +
      (texture2D(uLogoMask, vUv + vec2(-d3*rx, 0)).r - texture2D(uLogoMask, vUv + vec2( d3*rx, 0)).r) +
      (texture2D(uLogoMask, vUv + vec2(-d4*rx, 0)).r - texture2D(uLogoMask, vUv + vec2( d4*rx, 0)).r);
    float gy =
      (texture2D(uLogoMask, vUv + vec2(0, -d1*ry)).r - texture2D(uLogoMask, vUv + vec2(0,  d1*ry)).r) +
      (texture2D(uLogoMask, vUv + vec2(0, -d2*ry)).r - texture2D(uLogoMask, vUv + vec2(0,  d2*ry)).r) +
      (texture2D(uLogoMask, vUv + vec2(0, -d3*ry)).r - texture2D(uLogoMask, vUv + vec2(0,  d3*ry)).r) +
      (texture2D(uLogoMask, vUv + vec2(0, -d4*ry)).r - texture2D(uLogoMask, vUv + vec2(0,  d4*ry)).r);
    gx /= 4.0; gy /= 4.0;

    // Negate gradient → normals slope INTO the depression (impressed, not embossed)
    vec3 N_bevel = normalize(vec3(-gx * 3.0, -gy * 3.0, 1.0));
    float edgeStrength = clamp(length(vec2(gx, gy)) * 5.0, 0.0, 1.0) * uEmboss;
    N = normalize(mix(N, N_bevel, edgeStrength));

    // Subtle shadow inside the depression (much softer than before)
    float depression = (1.0 - texture2D(uLogoMask, vUv).r) * uEmboss;
    N = normalize(mix(N, vec3(0.0, 0.0, 1.0), depression * uAO * 0.5));
  }

  // --- Lighting ---
  vec2 lightPx = uLight.xy * uResolution;
  float lightZ  = uLight.z  * max(uResolution.x, uResolution.y);
  vec3 L = normalize(vec3(lightPx - px, lightZ));

  float diff  = max(0.0, dot(N, L));
  float dist2 = dot(lightPx - px, lightPx - px);
  float maxD2 = dot(uResolution, uResolution);
  float atten = 1.0 - pow(dist2/maxD2, uFalloff);

  float diffWrapped = diff * 0.8 + 0.2 * (1.0 - diff) * 0.2;
  float I = uAmbient + diffWrapped * uIntensity * atten;

  gl_FragColor = vec4(clamp(color * I, 0.0, 1.0), 1.0);
}
`;


export function ThreeCanvas({
  settings,
  emboss,
  logoMask,
}: {
  settings: ConcreteSettings;
  emboss: EmbossSettings;
  logoMask: HTMLCanvasElement | null;
}) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const settingsRef   = useRef(settings);
  const embossRef     = useRef(emboss);
  const uniformsRef   = useRef<{
    uResolution: { value: THREE.Vector2 };
    uLight:      { value: THREE.Vector3 };
    uAmbient:    { value: number };
    uIntensity:  { value: number };
    uBump:       { value: number };
    uScale:      { value: number };
    uRoughness:  { value: number };
    uColorVar:   { value: number };
    uFalloff:    { value: number };
    uLogoMask:   { value: THREE.Texture };
    uEmboss:     { value: number };
    uBevel:      { value: number };
    uAO:         { value: number };
    uHasLogo:    { value: number };
  } | null>(null);
  const embossStartRef = useRef<number | null>(null);
  const logoMaskRef    = useRef(logoMask);

  // Sync settings into uniforms
  useEffect(() => {
    settingsRef.current = settings;
    const u = uniformsRef.current;
    if (!u) return;
    u.uAmbient.value    = settings.ambient;
    u.uIntensity.value  = settings.light;
    u.uBump.value       = settings.bump;
    u.uScale.value      = settings.scale;
    u.uRoughness.value  = settings.roughness;
    u.uColorVar.value   = settings.colorVar;
    u.uFalloff.value    = settings.falloff;
  }, [settings]);

  useEffect(() => {
    embossRef.current = emboss;
    const u = uniformsRef.current;
    if (!u) return;
    u.uBevel.value = emboss.bevel;
    u.uAO.value    = emboss.ao;
  }, [emboss]);

  // When logoMask arrives, upload as texture and start emboss fade-in
  useEffect(() => {
    logoMaskRef.current = logoMask;
    const u = uniformsRef.current;
    if (!u || !logoMask) return;
    const tex = new THREE.CanvasTexture(logoMask);
    u.uLogoMask.value = tex;
    u.uHasLogo.value  = 1;
    embossStartRef.current = performance.now();
  }, [logoMask]);

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
      uRoughness:  { value: s.roughness },
      uColorVar:   { value: s.colorVar },
      uFalloff:    { value: s.falloff },
      uLogoMask:   { value: new THREE.Texture() },
      uEmboss:     { value: 0 },
      uBevel:      { value: embossRef.current.bevel },
      uAO:         { value: embossRef.current.ao },
      uHasLogo:    { value: 0 },
    };
    uniformsRef.current = uniforms;

    // If mask was already provided before mount (HMR), wire it up now
    if (logoMaskRef.current) {
      const tex = new THREE.CanvasTexture(logoMaskRef.current);
      uniforms.uLogoMask.value = tex;
      uniforms.uHasLogo.value  = 1;
      embossStartRef.current   = performance.now();
    }

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

    const EMBOSS_DURATION = () => embossRef.current.duration;
    let rafId: number;
    function animate() {
      rafId = requestAnimationFrame(animate);
      // Animate emboss strength
      if (embossStartRef.current !== null) {
        const t = (performance.now() - embossStartRef.current) / EMBOSS_DURATION();
        uniforms.uEmboss.value = Math.min(1, t);
        if (t >= 1) embossStartRef.current = null;
      }
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />
  );
}
