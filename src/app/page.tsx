"use client";

import { useState, useCallback } from "react";
import { HeroStamp } from "@/components/HeroStamp";
import { SelectedWorks } from "@/components/SelectedWorks";
import { Footer } from "@/components/Footer";
import { ThreeCanvas } from "@/components/ThreeCanvas";
import { defaultConcreteSettings } from "@/components/ConcreteControls";

export default function Home() {
  const [logoMask, setLogoMask] = useState<HTMLCanvasElement | null>(null);
  const onLanded = useCallback((mask: HTMLCanvasElement) => setLogoMask(mask), []);

  return (
    <>
      <ThreeCanvas settings={defaultConcreteSettings} logoMask={logoMask} />

      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <HeroStamp onLanded={onLanded} />
      </div>

      <div style={{ height: "100vh" }} />

      <div className="relative z-20" style={{ background: "var(--paper)" }}>
        <SelectedWorks />
        <Footer />
      </div>
    </>
  );
}
