"use client";

import { useState } from "react";
import { HeroStamp } from "@/components/HeroStamp";
import { SelectedWorks } from "@/components/SelectedWorks";
import { Footer } from "@/components/Footer";
import { ThreeCanvas } from "@/components/ThreeCanvas";
import { ConcreteControls, defaultConcreteSettings } from "@/components/ConcreteControls";

export default function Home() {
  const [settings, setSettings] = useState(defaultConcreteSettings);

  return (
    <>
      <ThreeCanvas settings={settings} />

      <ConcreteControls settings={settings} onChange={setSettings} />

      {/* Hero — full viewport */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 gap-12">
        <HeroStamp />
      </section>

      {/* Selected works */}
      <div className="relative z-10" style={{ background: "var(--paper)" }}>
        <SelectedWorks />
        <Footer />
      </div>
    </>
  );
}
