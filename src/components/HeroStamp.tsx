"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { type StampSettings } from "./StampControls";

interface HeroStampProps {
  settings: StampSettings;
  replayKey: number;
}

export function HeroStamp({ settings, replayKey }: HeroStampProps) {
  const logoControls = useAnimation();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    logoControls.set({
      scale: settings.initialScale,
      opacity: 0,
      filter: `blur(${settings.blur}px)`,
    });

    timerRef.current = setTimeout(async () => {
      await logoControls.start({
        scale: [settings.initialScale, settings.squish, 1],
        opacity: [0, 1, 1],
        filter: [`blur(${settings.blur}px)`, "blur(0px)", "blur(0px)"],
        transition: {
          duration: settings.duration,
          times: [0, 0.88, 1],
          ease: [0.755, 0.05, 0.855, 0.06],
        },
      });
    }, settings.delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [replayKey, settings, logoControls]);

  return (
    <div className="flex items-center justify-center w-full max-w-2xl">
      <motion.div animate={logoControls} style={{ width: "100%", color: "var(--ink)" }}>
        <Logo style={{ width: "100%", height: "auto" }} />
      </motion.div>
    </div>
  );
}
