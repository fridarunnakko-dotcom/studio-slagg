"use client";

import { useState } from "react";

export interface ConcreteSettings {
  scale: number;
  bump: number;
  roughness: number;
  colorVar: number;
  ambient: number;
  light: number;
  lightHeight: number;
  falloff: number;
  baseColor: string;
  varColor: string;
}

export const defaultConcreteSettings: ConcreteSettings = {
  scale: 0.06,
  bump: 9,
  roughness: 0.41,
  colorVar: 0.025,
  ambient: 0.14,
  light: 1.5,
  lightHeight: 0.25,
  falloff: 1.05,
  baseColor: "#f2f2f2",
  varColor: "#8b7a5e",
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  rebuilds,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  rebuilds?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <div
        className="flex justify-between text-xs"
        style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}
      >
        <span>
          {label}
          {rebuilds && (
            <span style={{ color: "var(--dust)", marginLeft: 4 }}>↺</span>
          )}
        </span>
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

export function ConcreteControls({
  settings,
  onChange,
}: {
  settings: ConcreteSettings;
  onChange: (s: ConcreteSettings) => void;
}) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof ConcreteSettings) => (v: number) =>
    onChange({ ...settings, [key]: v });

  return (
    <div
      className="fixed bottom-6 left-6 z-50 rounded-sm shadow-lg cursor-cross"
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line-strong)",
        width: 260,
        fontFamily: "var(--font-ui)",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest"
        style={{ color: "var(--void)" }}
      >
        <span>Concrete</span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div
          className="flex flex-col gap-4 px-4 pb-4"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <div className="pt-4 flex flex-col gap-4">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--dust)" }}
            >
              Texture — ↺ rebuilds
            </p>
            <Slider
              label="Scale"
              value={settings.scale}
              min={0.005}
              max={0.06}
              step={0.001}
              onChange={set("scale")}
              rebuilds
            />
            <Slider
              label="Relief"
              value={settings.bump}
              min={1}
              max={12}
              step={0.5}
              onChange={set("bump")}
              rebuilds
            />
            <Slider
              label="Roughness"
              value={settings.roughness}
              min={0}
              max={1}
              step={0.01}
              onChange={set("roughness")}
            />
            <Slider
              label="Color var"
              value={settings.colorVar}
              min={0}
              max={0.2}
              step={0.005}
              onChange={set("colorVar")}
            />
            <label className="flex flex-col gap-1">
              <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}>
                <span>Color</span>
                <span style={{ color: "var(--ink)" }}>{settings.baseColor}</span>
              </div>
              <input
                type="color"
                value={settings.baseColor}
                onChange={(e) => onChange({ ...settings, baseColor: e.target.value })}
                className="w-full h-8 cursor-pointer rounded-sm"
                style={{ border: "1px solid var(--line)", background: "none" }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-ui)", color: "var(--void)" }}>
                <span>Var tint</span>
                <span style={{ color: "var(--ink)" }}>{settings.varColor}</span>
              </div>
              <input
                type="color"
                value={settings.varColor}
                onChange={(e) => onChange({ ...settings, varColor: e.target.value })}
                className="w-full h-8 cursor-pointer rounded-sm"
                style={{ border: "1px solid var(--line)", background: "none" }}
              />
            </label>
          </div>

          <div
            className="flex flex-col gap-4"
            style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}
          >
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--dust)" }}
            >
              Light
            </p>
            <Slider
              label="Ambient"
              value={settings.ambient}
              min={0}
              max={1}
              step={0.01}
              onChange={set("ambient")}
            />
            <Slider
              label="Intensity"
              value={settings.light}
              min={0}
              max={1.5}
              step={0.01}
              onChange={set("light")}
            />
            <Slider
              label="Height"
              value={settings.lightHeight}
              min={0.1}
              max={2}
              step={0.05}
              onChange={set("lightHeight")}
            />
            <Slider
              label="Falloff"
              value={settings.falloff}
              min={0.1}
              max={1.5}
              step={0.05}
              onChange={set("falloff")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
