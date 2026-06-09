"use client";

import { useState } from "react";

export interface EmbossSettings {
  bevel: number;
  ao: number;
  smoothing: number; // how much bump+roughness is reduced inside letters (0–1)
  duration: number;
}

export const defaultEmbossSettings: EmbossSettings = {
  bevel:    2,
  ao:       0.05,
  smoothing: 0.7,
  duration: 2000,
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
        className="w-full"
        style={{ accentColor: "var(--ink)" }}
      />
    </label>
  );
}

export function EmbossControls({
  settings,
  onChange,
}: {
  settings: EmbossSettings;
  onChange: (s: EmbossSettings) => void;
}) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof EmbossSettings) => (v: number) =>
    onChange({ ...settings, [key]: v });

  return (
    <div
      className="fixed z-50 rounded-sm shadow-lg"
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line-strong)",
        width: 260,
        fontFamily: "var(--font-ui)",
        bottom: 24,
        right: 296,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest"
        style={{ color: "var(--void)" }}
      >
        <span>Deboss</span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 px-4 pb-4" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="pt-4 flex flex-col gap-4">
            <Slider label="Bevel (px)"  value={settings.bevel}     min={1}   max={40}   step={1}    onChange={set("bevel")} />
            <Slider label="AO"          value={settings.ao}        min={0}   max={0.5}  step={0.01} onChange={set("ao")} />
            <Slider label="Letter texture" value={settings.smoothing} min={0}   max={1}    step={0.01} onChange={set("smoothing")} />
            <Slider label="Fade (ms)"   value={settings.duration}  min={100} max={2000} step={50}   onChange={set("duration")} />
          </div>
        </div>
      )}
    </div>
  );
}
