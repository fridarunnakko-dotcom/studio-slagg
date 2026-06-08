"use client";

import { useEffect, useRef } from "react";
import { type ConcreteSettings } from "./ConcreteControls";

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

function spackleHeight(x: number, y: number): number {
  const a = vnoise(x, y);
  const b = vnoise(x * 2.8 + 3.1, y * 2.8 + 1.7) * 0.38;
  const c = vnoise(x * 7.0 + 7.2, y * 7.0 + 5.1) * 0.10;
  return Math.pow(a * 0.65 + b + c, 1.6);
}

const RATIO = 3;
// --neon: #e7ec68
const BR = 231, BG = 236, BB = 104;

function buildNormals(w: number, h: number, scale: number, bump: number): Float32Array {
  const normals = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const hL = spackleHeight((x - 1) * scale, y * scale);
      const hR = spackleHeight((x + 1) * scale, y * scale);
      const hD = spackleHeight(x * scale, (y - 1) * scale);
      const hU = spackleHeight(x * scale, (y + 1) * scale);
      const nx = (hL - hR) * bump;
      const ny = (hD - hU) * bump;
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

function renderLight(
  ctx: CanvasRenderingContext2D,
  normals: Float32Array,
  w: number, h: number,
  lx: number, ly: number,
  settings: ConcreteSettings,
) {
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  const lpx = lx * w, lpy = ly * h;
  const lpz = Math.max(w, h) * settings.lightHeight;
  const maxDist2 = w*w + h*h;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ni = (y * w + x) * 3;
      const nx = normals[ni], ny = normals[ni+1], nz = normals[ni+2];
      const dx = lpx - x, dy = lpy - y, dz = lpz;
      const invD = 1 / Math.sqrt(dx*dx + dy*dy + dz*dz);
      const diff = Math.max(0, (nx*dx + ny*dy + nz*dz) * invD);
      const dist2 = dx*dx + dy*dy;
      const atten = 1 - Math.pow(dist2 / maxDist2, settings.falloff);
      const I = settings.ambient + diff * settings.light * atten;
      const pi = (y * w + x) * 4;
      data[pi]   = Math.min(255, BR * I);
      data[pi+1] = Math.min(255, BG * I);
      data[pi+2] = Math.min(255, BB * I);
      data[pi+3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export function ConcreteCanvas({ settings }: { settings: ConcreteSettings }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const normalsRef   = useRef<Float32Array | null>(null);
  const sizeRef      = useRef({ w: 0, h: 0 });
  const lightRef     = useRef({ x: 0.42, y: 0.35 });
  const dirtyRef     = useRef(false);
  const rafRef       = useRef(0);
  const settingsRef  = useRef(settings);
  const buildKeyRef  = useRef("");

  // Keep settingsRef in sync and mark dirty on every change
  useEffect(() => {
    settingsRef.current = settings;
    const key = `${settings.scale}-${settings.bump}`;
    if (key !== buildKeyRef.current) {
      // Rebuild normals
      buildKeyRef.current = key;
      const { w, h } = sizeRef.current;
      if (w > 0 && h > 0) {
        setTimeout(() => {
          normalsRef.current = buildNormals(w, h, settings.scale, settings.bump);
          dirtyRef.current = true;
        }, 0);
      }
    } else {
      dirtyRef.current = true;
    }
  }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function setup() {
      if (!canvas) return;
      const w = Math.ceil(window.innerWidth  / RATIO);
      const h = Math.ceil(window.innerHeight / RATIO);
      canvas.width  = w;
      canvas.height = h;
      sizeRef.current = { w, h };
      const { scale, bump } = settingsRef.current;
      buildKeyRef.current = `${scale}-${bump}`;
      setTimeout(() => {
        normalsRef.current = buildNormals(w, h, scale, bump);
        dirtyRef.current = true;
      }, 0);
    }

    function loop() {
      if (dirtyRef.current && normalsRef.current && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const { w, h } = sizeRef.current;
          renderLight(ctx, normalsRef.current, w, h,
            lightRef.current.x, lightRef.current.y, settingsRef.current);
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

    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", setup);
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
