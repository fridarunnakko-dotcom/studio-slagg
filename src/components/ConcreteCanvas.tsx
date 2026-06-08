"use client";

import { useEffect, useRef } from "react";

// --- Noise ---
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

// Spackle height: large blobs + medium lumps + fine surface
function height(x: number, y: number): number {
  const a = vnoise(x,           y          );
  const b = vnoise(x * 2.8 + 3.1, y * 2.8 + 1.7) * 0.38;
  const c = vnoise(x * 7.0 + 7.2, y * 7.0 + 5.1) * 0.10;
  return Math.pow(a * 0.65 + b + c, 1.6);
}

const SCALE = 0.022; // texture zoom — larger = fewer, bigger blobs
const BUMP  = 5.5;   // normal map strength
const RATIO = 3;     // render resolution divisor (3 = 1/9 pixels, fast)

function buildNormals(w: number, h: number): Float32Array {
  const normals = new Float32Array(w * h * 3);
  const e = 1.0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const hL = height((x - e) * SCALE, y * SCALE);
      const hR = height((x + e) * SCALE, y * SCALE);
      const hD = height(x * SCALE, (y - e) * SCALE);
      const hU = height(x * SCALE, (y + e) * SCALE);
      const nx = (hL - hR) * BUMP;
      const ny = (hD - hU) * BUMP;
      const nz = 1.0;
      const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
      const i = (y * w + x) * 3;
      normals[i]   = nx / len;
      normals[i+1] = ny / len;
      normals[i+2] = nz / len;
    }
  }
  return normals;
}

// Base color — off-white stucco
const BR = 238, BG = 236, BB = 232;

function renderLight(
  ctx: CanvasRenderingContext2D,
  normals: Float32Array,
  w: number, h: number,
  lx: number, ly: number,   // light pos 0..1
) {
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  const lpx = lx * w, lpy = ly * h;
  const lpz = Math.max(w, h) * 0.55;            // light height above surface
  const maxDist2 = (w*w + h*h);
  const AMBIENT = 0.52, LIGHT = 0.62;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ni = (y * w + x) * 3;
      const nx = normals[ni], ny = normals[ni+1], nz = normals[ni+2];

      const dx = lpx - x, dy = lpy - y, dz = lpz;
      const invD = 1 / Math.sqrt(dx*dx + dy*dy + dz*dz);
      const diff = Math.max(0, (nx*dx + ny*dy + nz*dz) * invD);

      // Soft radial falloff
      const dist2 = dx*dx + dy*dy;
      const atten = 1 - Math.pow(dist2 / maxDist2, 0.55);

      const I = AMBIENT + diff * LIGHT * atten;

      const pi = (y * w + x) * 4;
      data[pi]   = Math.min(255, BR * I);
      data[pi+1] = Math.min(255, BG * I);
      data[pi+2] = Math.min(255, BB * I);
      data[pi+3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export function ConcreteCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<{
    normals: Float32Array;
    w: number; h: number;
  } | null>(null);
  const lightRef   = useRef({ x: 0.42, y: 0.35 });
  const dirtyRef   = useRef(false);
  const rafRef     = useRef(0);
  const builtRef   = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function setup() {
      if (!canvas) return;
      const w = Math.ceil(window.innerWidth  / RATIO);
      const h = Math.ceil(window.innerHeight / RATIO);
      canvas.width  = w;
      canvas.height = h;

      // Build normal map off the main thread tick so paint isn't blocked
      setTimeout(() => {
        const normals = buildNormals(w, h);
        stateRef.current = { normals, w, h };
        builtRef.current = true;
        dirtyRef.current = true;
      }, 0);
    }

    function loop() {
      if (dirtyRef.current && stateRef.current && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const { normals, w, h } = stateRef.current;
          renderLight(ctx, normals, w, h, lightRef.current.x, lightRef.current.y);
        }
        dirtyRef.current = false;
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    setup();
    rafRef.current = requestAnimationFrame(loop);

    function onMove(e: MouseEvent) {
      lightRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      dirtyRef.current = true;
    }

    function onResize() {
      builtRef.current = false;
      setup();
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        imageRendering: "auto",
      }}
    />
  );
}
