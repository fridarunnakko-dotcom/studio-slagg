"use client";

import { useRef } from "react";

type Bezier = [number, number, number, number];

const SIZE = 148;
const PAD = 16;
const TOTAL = SIZE + PAD * 2;

function bToSVG(bx: number, by: number) {
  return { x: PAD + bx * SIZE, y: PAD + (1 - by) * SIZE };
}

function svgToB(sx: number, sy: number) {
  return {
    x: Math.max(0, Math.min(1, (sx - PAD) / SIZE)),
    y: (1 - (sy - PAD) / SIZE),
  };
}

export function BezierEditor({
  value,
  onChange,
}: {
  value: Bezier;
  onChange: (v: Bezier) => void;
}) {
  const [x1, y1, x2, y2] = value;
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<1 | 2 | null>(null);

  const start = bToSVG(0, 0);
  const end = bToSVG(1, 1);
  const cp1 = bToSVG(x1, y1);
  const cp2 = bToSVG(x2, y2);

  function getSVGPos(e: React.PointerEvent) {
    const rect = svgRef.current!.getBoundingClientRect();
    return svgToB(e.clientX - rect.left, e.clientY - rect.top);
  }

  function onPointerDown(handle: 1 | 2) {
    return (e: React.PointerEvent<SVGCircleElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = handle;
    };
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging.current) return;
    const b = getSVGPos(e);
    if (dragging.current === 1) onChange([b.x, b.y, x2, y2]);
    else onChange([x1, y1, b.x, b.y]);
  }

  function onPointerUp() {
    dragging.current = null;
  }

  return (
    <div className="flex flex-col gap-2">
      <svg
        ref={svgRef}
        width={TOTAL}
        height={TOTAL}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ display: "block", touchAction: "none" }}
      >
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((t) => {
          const a = PAD + t * SIZE;
          return (
            <g key={t}>
              <line x1={a} y1={PAD} x2={a} y2={PAD + SIZE} stroke="var(--line)" strokeWidth="1" />
              <line x1={PAD} y1={a} x2={PAD + SIZE} y2={a} stroke="var(--line)" strokeWidth="1" />
            </g>
          );
        })}

        {/* Border */}
        <rect x={PAD} y={PAD} width={SIZE} height={SIZE} fill="none" stroke="var(--line-strong)" strokeWidth="1" />

        {/* Diagonal reference */}
        <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="var(--concrete)" strokeWidth="1" strokeDasharray="3 3" />

        {/* Control arm lines */}
        <line x1={start.x} y1={start.y} x2={cp1.x} y2={cp1.y} stroke="var(--dust)" strokeWidth="1" />
        <line x1={end.x} y1={end.y} x2={cp2.x} y2={cp2.y} stroke="var(--dust)" strokeWidth="1" />

        {/* Curve */}
        <path
          d={`M ${start.x} ${start.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${end.x} ${end.y}`}
          stroke="var(--ink)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Anchor dots */}
        <circle cx={start.x} cy={start.y} r="3" fill="var(--ink)" />
        <circle cx={end.x} cy={end.y} r="3" fill="var(--ink)" />

        {/* Handle 1 */}
        <circle
          cx={cp1.x}
          cy={cp1.y}
          r="6"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth="1.5"
          style={{ cursor: "grab" }}
          onPointerDown={onPointerDown(1)}
        />

        {/* Handle 2 */}
        <circle
          cx={cp2.x}
          cy={cp2.y}
          r="6"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth="1.5"
          style={{ cursor: "grab" }}
          onPointerDown={onPointerDown(2)}
        />
      </svg>

      <p
        className="text-center"
        style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--void)", letterSpacing: "0.05em" }}
      >
        cubic-bezier({x1.toFixed(2)}, {y1.toFixed(2)}, {x2.toFixed(2)}, {y2.toFixed(2)})
      </p>
    </div>
  );
}
