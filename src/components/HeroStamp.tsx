"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { Logo } from "./Logo";

const SETTINGS = {
  initialScale: 5,
  duration: 0.55,
  blur: 8,
  squish: 0.91,
  delay: 850,
  ease: [0.87, -0.0, 0.81, 1.0] as const,
};

export function HeroStamp() {
  const logoControls = useAnimation();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    logoControls.set({
      scale: SETTINGS.initialScale,
      opacity: 0,
      filter: `blur(${SETTINGS.blur}px)`,
    });

    timerRef.current = setTimeout(async () => {
      await logoControls.start({
        scale: [SETTINGS.initialScale, SETTINGS.squish, 1],
        opacity: [0, 1, 1],
        filter: [`blur(${SETTINGS.blur}px)`, "blur(0px)", "blur(0px)"],
        transition: {
          duration: SETTINGS.duration,
          times: [0, 0.88, 1],
          ease: [...SETTINGS.ease],
        },
      });
    }, SETTINGS.delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [logoControls]);

  return (
    <div className="flex items-center justify-center w-full max-w-2xl">
      <motion.div animate={logoControls} style={{ width: "100%", color: "var(--ink)" }}>
        <Logo style={{ width: "100%", height: "auto" }} />
      </motion.div>
    </div>
  );
}
