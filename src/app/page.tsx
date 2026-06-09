"use client";

import { useState, useCallback } from "react";
import { HeroStamp } from "@/components/HeroStamp";
import { SelectedWorks } from "@/components/SelectedWorks";
import { Footer } from "@/components/Footer";
import { ThreeCanvas } from "@/components/ThreeCanvas";
import { ConcreteControls, defaultConcreteSettings } from "@/components/ConcreteControls";
import { StampControls, defaultSettings as defaultStampSettings } from "@/components/StampControls";
import { EmbossControls, defaultEmbossSettings } from "@/components/EmbossControls";

export default function Home() {
  const [concrete, setConcrete] = useState(defaultConcreteSettings);
  const [stamp,    setStamp]    = useState(defaultStampSettings);
  const [emboss,   setEmboss]   = useState(defaultEmbossSettings);
  const [replayKey, setReplayKey] = useState(0);
  const [logoMask,  setLogoMask]  = useState<HTMLCanvasElement | null>(null);

  const onLanded  = useCallback((mask: HTMLCanvasElement) => setLogoMask(mask), []);
  const onReplay  = useCallback(() => { setLogoMask(null); setReplayKey(k => k + 1); }, []);

  return (
    <>
      <ThreeCanvas settings={concrete} emboss={emboss} logoMask={logoMask} />

      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <HeroStamp settings={stamp} replayKey={replayKey} onLanded={onLanded} />
      </div>

      <div style={{ height: "100vh" }} />

      <div className="relative z-20" style={{ background: "var(--paper)" }}>
        <SelectedWorks />
        <Footer />
      </div>

      <ConcreteControls settings={concrete} onChange={setConcrete} />
      <EmbossControls   settings={emboss}   onChange={setEmboss} />
      <StampControls    settings={stamp}    onChange={setStamp} onReplay={onReplay} />
    </>
  );
}
