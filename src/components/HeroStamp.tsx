"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { Logo } from "./Logo";

const SETTINGS = {
  initialScale: 5.5,
  duration: 0.55,
  blur: 8,
  squish: 0.94,
  delay: 850,
  ease: [0.79, -0.01, 0.67, 1.0] as const,
};

function buildMask(svgEl: SVGSVGElement): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const rect = svgEl.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d")!;

    // White background = surface level; black letters = pressed in
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const serialized = new XMLSerializer().serializeToString(svgEl);
    const withBlackFill = serialized.replace(/fill="currentColor"/g, 'fill="black"');
    const blob = new Blob([withBlackFill], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.src = url;
  });
}

export function HeroStamp({ onLanded }: { onLanded?: (mask: HTMLCanvasElement) => void }) {
  const logoControls = useAnimation();
  const svgRef       = useRef<SVGSVGElement>(null);
  const timerRef     = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    logoControls.set({
      scale:  SETTINGS.initialScale,
      opacity: 0,
      filter: `blur(${SETTINGS.blur}px)`,
    });

    timerRef.current = setTimeout(async () => {
      await logoControls.start({
        scale:   [SETTINGS.initialScale, SETTINGS.squish, 1],
        opacity: [0, 1, 1],
        filter:  [`blur(${SETTINGS.blur}px)`, "blur(0px)", "blur(0px)"],
        transition: {
          duration: SETTINGS.duration,
          times:    [0, 0.88, 1],
          ease:     [...SETTINGS.ease],
        },
      });

      // Stamp has landed — build emboss mask from actual DOM rect
      if (svgRef.current && onLanded) {
        buildMask(svgRef.current).then(onLanded);
      }
    }, SETTINGS.delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [logoControls, onLanded]);

  return (
    <div className="flex items-center justify-center w-full max-w-2xl">
      <motion.div animate={logoControls} style={{ width: "100%", color: "var(--ink)" }}>
        <Logo ref={svgRef} style={{ width: "100%", height: "auto" }} />
      </motion.div>
    </div>
  );
}
