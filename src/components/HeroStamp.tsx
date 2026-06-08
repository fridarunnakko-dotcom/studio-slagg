"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { Logo } from "./Logo";

const STAMP_DURATION = 0.55;

export function HeroStamp() {
  const logoControls = useAnimation();

  useEffect(() => {
    async function run() {
      logoControls.set({
        scale: 4,
        opacity: 0,
        filter: "blur(16px)",
      });

      await logoControls.start({
        scale: [4, 0.96, 1],
        opacity: [0, 1, 1],
        filter: ["blur(16px)", "blur(0px)", "blur(0px)"],
        transition: {
          duration: STAMP_DURATION,
          times: [0, 0.88, 1],
          ease: [0.755, 0.05, 0.855, 0.06],
        },
      });

    }

    const timer = setTimeout(run, 200);
    return () => clearTimeout(timer);
  }, [logoControls]);

  return (
    <div className="relative flex items-center justify-center w-full max-w-2xl">
      <motion.div
        animate={logoControls}
        style={{ width: "100%", color: "var(--ink)" }}
      >
        <Logo style={{ width: "100%", height: "auto" }} />
      </motion.div>

    </div>
  );
}
