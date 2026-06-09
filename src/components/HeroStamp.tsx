"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { type StampSettings } from "./StampControls";

function buildMask(svgEl: SVGSVGElement): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const rect = svgEl.getBoundingClientRect();
    const W = window.innerWidth, H = window.innerHeight;

    // Sharp mask: white background, black letters
    const sharp = document.createElement("canvas");
    sharp.width = W; sharp.height = H;
    const sCtx = sharp.getContext("2d")!;
    sCtx.fillStyle = "white";
    sCtx.fillRect(0, 0, W, H);

    const serialized  = new XMLSerializer().serializeToString(svgEl);
    const withBlack   = serialized.replace(/fill="currentColor"/g, 'fill="black"');
    const blob = new Blob([withBlack], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      sCtx.drawImage(img, rect.left, rect.top, rect.width, rect.height);
      URL.revokeObjectURL(url);

      // Blur to create smooth gradient at letter edges → proper rounded bevel normals
      // Radius proportional to letter height so it scales with viewport
      const bevelPx = Math.max(6, Math.round(rect.height * 0.18));
      const blurred = document.createElement("canvas");
      blurred.width = W; blurred.height = H;
      const bCtx = blurred.getContext("2d")!;
      bCtx.filter = `blur(${bevelPx}px)`;
      bCtx.drawImage(sharp, 0, 0);

      resolve(blurred);
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
        buildMask(svgRef.current).then((mask) => {
          onLanded(mask);
          // Logo fades out as the emboss fades in — only the surface remains
          setTimeout(() => {
            logoControls.start({
              opacity: 0,
              transition: { duration: 0.6, ease: "easeInOut" },
            });
          }, 200);
        });
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
