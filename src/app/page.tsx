"use client";

import { useState } from "react";
import { HeroStamp } from "@/components/HeroStamp";
import { SelectedWorks } from "@/components/SelectedWorks";
import { Footer } from "@/components/Footer";
import { ConcreteCanvas } from "@/components/ConcreteCanvas";
import { ConcreteControls, defaultConcreteSettings, type ConcreteSettings } from "@/components/ConcreteControls";

export default function Home() {
  const [concrete, setConcrete] = useState<ConcreteSettings>(defaultConcreteSettings);

  return (
    <>
      <ConcreteCanvas settings={concrete} />

      {/* Hero — full viewport */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 gap-12">
        <p
          className="text-xs tracking-widest uppercase"
          style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
        >
          Skrap. Yta. Rum.
        </p>

        <HeroStamp />

        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16"
            style={{ height: "1px", background: "var(--line-strong)" }}
          />
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-body)", color: "var(--dust)" }}
          >
            info@studioslagg.se
          </p>
        </div>
      </section>

      {/* Selected works */}
      <div className="relative z-10" style={{ background: "var(--paper)" }}>
        <SelectedWorks />
        <Footer />
      </div>

      <ConcreteControls settings={concrete} onChange={setConcrete} />
    </>
  );
}
