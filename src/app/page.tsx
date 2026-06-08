"use client";

import { useState } from "react";
import { HeroStamp } from "@/components/HeroStamp";
import { SelectedWorks } from "@/components/SelectedWorks";
import { Footer } from "@/components/Footer";
import { ConcreteCanvas } from "@/components/ConcreteCanvas";
import { defaultConcreteSettings } from "@/components/ConcreteControls";

export default function Home() {
  return (
    <>
      <ConcreteCanvas settings={defaultConcreteSettings} />

      {/* Hero — full viewport */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 gap-12">
        <p
          className="text-xs tracking-widest uppercase"
          style={{ fontFamily: "var(--font-ui)", color: "var(--ink)" }}
        >
          Skrap. Yta. Rum.
        </p>

        <HeroStamp />

        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16"
            style={{ height: "1px", background: "var(--ink)" }}
          />
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-body)", color: "var(--ink)" }}
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
    </>
  );
}
