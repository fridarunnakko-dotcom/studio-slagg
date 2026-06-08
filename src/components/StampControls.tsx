"use client";

import { useState } from "react";
import { BezierEditor } from "./BezierEditor";

type Bezier = [number, number, number, number];

export interface StampSettings {
  initialScale: number;
  duration: number;
  blur: number;
  squish: number;
  delay: number;
  ease: Bezier;
}

export const defaultSettings: StampSettings = {
  initialScale: 5,
  duration: 0.55,
  blur: 8,
  squish: 0.91,
  delay: 850,
  ease: [0.87, -0.0, 0.81, 1.0],
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}>
        <span>{label}</span>
        <span style={{ color: "var(--ink)" }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-ink"
        style={{ accentColor: "var(--ink)" }}
      />
    </label>
  );
}

export function StampControls({
  settings,
  onChange,
  onReplay,
}: {
  settings: StampSettings;
  onChange: (s: StampSettings) => void;
  onReplay: () => void;
}) {
  const [open, setOpen] = useState(true);

  const set = (key: keyof StampSettings) => (v: number) =>
    onChange({ ...settings, [key]: v });

  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-sm shadow-lg"
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line-strong)",
        width: 260,
        fontFamily: "var(--font-ui)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest"
        style={{ color: "var(--void)" }}
      >
        <span>Animation</span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 px-4 pb-4" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="pt-4 flex flex-col gap-4">
            <Slider label="Initial scale" value={settings.initialScale} min={1.5} max={8} step={0.5} onChange={set("initialScale")} />
            <Slider label="Duration (s)" value={settings.duration} min={0.1} max={2} step={0.05} onChange={set("duration")} />
            <Slider label="Blur (px)" value={settings.blur} min={0} max={40} step={1} onChange={set("blur")} />
            <Slider label="Squish" value={settings.squish} min={0.7} max={1} step={0.01} onChange={set("squish")} />
            <Slider label="Delay (ms)" value={settings.delay} min={0} max={2000} step={50} onChange={set("delay")} />
          </div>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--void)" }}>
              Easing curve
            </p>
            <BezierEditor
              value={settings.ease}
              onChange={(ease) => onChange({ ...settings, ease })}
            />
          </div>

          <button
            onClick={onReplay}
            className="w-full py-2 text-xs uppercase tracking-widest"
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              fontFamily: "var(--font-ui)",
            }}
          >
            Replay
          </button>
        </div>
      )}
    </div>
  );
}
