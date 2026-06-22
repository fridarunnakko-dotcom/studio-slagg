"use client";

import { useState, useCallback } from "react";
import { HeroStamp } from "@/components/HeroStamp";
import { Footer } from "@/components/Footer";
import { ThreeCanvas } from "@/components/ThreeCanvas";
import { GalleryScene } from "@/components/GalleryScene";
import { ConcreteControls, defaultConcreteSettings } from "@/components/ConcreteControls";
import { StampControls, defaultSettings as defaultStampSettings } from "@/components/StampControls";
import { EmbossControls, defaultEmbossSettings } from "@/components/EmbossControls";

export default function Home() {
  const [concrete, setConcrete] = useState(defaultConcreteSettings);
  const [stamp,    setStamp]    = useState(defaultStampSettings);
  const [emboss,   setEmboss]   = useState(defaultEmbossSettings);
  const [replayKey,    setReplayKey]    = useState(0);
  const [logoMask,     setLogoMask]     = useState<HTMLCanvasElement | null>(null);
  const [lightLocked,  setLightLocked]  = useState(true);
  const [showPanels,   setShowPanels]   = useState(false);

  const onLanded = useCallback((mask: HTMLCanvasElement) => {
    setLogoMask(mask);
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

      <div className="relative z-20" style={{ scrollSnapAlign: "start" }}>
        <GalleryScene />
      </div>

      <button
        onClick={() => setShowPanels(p => !p)}
        className="fixed z-50 cursor-cross"
        style={{
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--paper)",
          border: "1px solid var(--line-strong)",
          padding: "8px 16px",
          fontFamily: "var(--font-ui)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--void)",
        }}
      >
        {showPanels ? "Hide panels" : "Show panels"}
      </button>

      {showPanels && (
        <>
          <ConcreteControls settings={concrete} onChange={setConcrete} />
          <EmbossControls settings={emboss} onChange={setEmboss} />
          <StampControls settings={stamp} onChange={setStamp} onReplay={onReplay} />
        </>
      )}
    </>
  );
}
