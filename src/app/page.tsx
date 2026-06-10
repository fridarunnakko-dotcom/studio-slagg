"use client";

import { useState, useCallback } from "react";
import { HeroStamp } from "@/components/HeroStamp";
import { SelectedWorks } from "@/components/SelectedWorks";
import { Footer } from "@/components/Footer";
import { ThreeCanvas } from "@/components/ThreeCanvas";
import { defaultConcreteSettings } from "@/components/ConcreteControls";
import { defaultSettings as defaultStampSettings } from "@/components/StampControls";
import { defaultEmbossSettings } from "@/components/EmbossControls";

export default function Home() {
  const [concrete, setConcrete] = useState(defaultConcreteSettings);
  const [stamp,    setStamp]    = useState(defaultStampSettings);
  const [emboss,   setEmboss]   = useState(defaultEmbossSettings);
  const [replayKey,    setReplayKey]    = useState(0);
  const [logoMask,     setLogoMask]     = useState<HTMLCanvasElement | null>(null);
  const [lightLocked,  setLightLocked]  = useState(true);

  const onLanded = useCallback((mask: HTMLCanvasElement) => {
    setLogoMask(mask);
    // Unlock after logo fade-out finishes (200ms delay + 600ms fade)
    setTimeout(() => setLightLocked(false), 1500);
  }, []);
  const onReplay = useCallback(() => { setLogoMask(null); setLightLocked(true); setReplayKey(k => k + 1); }, []);

  return (
    <>
      <ThreeCanvas settings={concrete} emboss={emboss} logoMask={logoMask} lockLight={lightLocked} />

      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <HeroStamp settings={stamp} replayKey={replayKey} onLanded={onLanded} />
      </div>

      <div style={{ height: "100vh", scrollSnapAlign: "start" }} />

      <div className="relative z-20 cursor-cross" style={{ background: "var(--paper)", scrollSnapAlign: "start" }}>
        <SelectedWorks />
        <Footer />
      </div>


    </>
  );
}
