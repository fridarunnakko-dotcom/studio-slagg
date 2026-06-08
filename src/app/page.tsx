"use client";

import { useState } from "react";
import { HeroStamp } from "@/components/HeroStamp";
import { StampControls, defaultSettings, type StampSettings } from "@/components/StampControls";

export default function Home() {
  const [settings, setSettings] = useState<StampSettings>(defaultSettings);
  const [replayKey, setReplayKey] = useState(0);

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 gap-12">
      <p
        className="text-xs tracking-widest uppercase"
        style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
      >
        Skrap. Yta. Rum.
      </p>

      <HeroStamp settings={settings} replayKey={replayKey} />

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
        <p
          className="text-xs"
          style={{ fontFamily: "var(--font-ui)", color: "var(--concrete)" }}
        >
          Benjamin was here &lt;3
        </p>
      </div>

      <StampControls
        settings={settings}
        onChange={(s) => {
          setSettings(s);
          setReplayKey((k) => k + 1);
        }}
        onReplay={() => setReplayKey((k) => k + 1)}
      />
    </main>
  );
}
