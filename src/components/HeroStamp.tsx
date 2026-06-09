"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { type StampSettings } from "./StampControls";

function buildMask(svgEl: SVGSVGElement): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const rect = svgEl.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const serialized  = new XMLSerializer().serializeToString(svgEl);
    const withBlack   = serialized.replace(/fill="currentColor"/g, 'fill="black"');
    const blob = new Blob([withBlack], { type: "image/svg+xml" });
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

export function HeroStamp({
  settings,
  replayKey,
  onLanded,
}: {
  settings: StampSettings;
  replayKey: number;
  onLanded?: (mask: HTMLCanvasElement) => void;
}) {
  const logoControls = useAnimation();
  const svgRef       = useRef<SVGSVGElement>(null);
  const timerRef     = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    logoControls.stop();
    logoControls.set({
      scale:   settings.initialScale,
      opacity: 0,
      filter:  `blur(${settings.blur}px)`,
    });

    timerRef.current = setTimeout(async () => {
      await logoControls.start({
        scale:   [settings.initialScale, settings.squish, 1],
        opacity: [0, 1, 1],
        filter:  [`blur(${settings.blur}px)`, "blur(0px)", "blur(0px)"],
        transition: {
          duration: settings.duration,
          times:    [0, 0.88, 1],
          ease:     [...settings.ease],
        },
      });

      if (svgRef.current && onLanded) {
        buildMask(svgRef.current).then(onLanded);
      }
    }, settings.delay);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [replayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center justify-center w-full max-w-2xl">
      <motion.div animate={logoControls} style={{ width: "100%", color: "var(--ink)" }}>
        <Logo ref={svgRef} style={{ width: "100%", height: "auto" }} />
      </motion.div>
    </div>
  );
}
