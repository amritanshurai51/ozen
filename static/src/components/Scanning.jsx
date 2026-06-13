import React, { useState, useEffect } from "react";
import { C, OzenWordmark, GLOBAL_CSS } from "../brand.jsx";

const STAGES = [
  "Detecting faces across all four angles",
  "Triangulating jaw & forehead geometry",
  "Measuring symmetry and proportions",
  "Calibrating to ethnic reference norms",
  "Scoring all parameters",
  "Building your 30-day protocol",
];

export default function Scanning() {
  const [pct,      setPct]      = useState(0);
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    // Eased progress — slows down as it approaches 94%
    // Covers a 15-30 second Claude response window naturally
    const iv = setInterval(() => {
      setPct((p) => {
        if (p >= 94) return p; // soft ceiling — never reaches 100 until real response
        // Slow down as we approach 94 — cubic easing
        const remaining = 94 - p;
        const increment = Math.max(0.08, remaining * 0.018);
        return Math.min(94, p + increment);
      });
    }, 120);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setStageIdx(Math.min(
      Math.floor((pct / 94) * STAGES.length),
      STAGES.length - 1
    ));
  }, [pct]);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 32, padding: 24,
    }}>
      <style>{GLOBAL_CSS}</style>

      <OzenWordmark size={18} />

      {/* spinner */}
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `3px solid ${C.line}`,
          borderTopColor: C.indigoBright,
          animation: "spin 1s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 20, borderRadius: "50%",
          border: `2.5px solid ${C.line}`,
          borderBottomColor: C.indigo,
          animation: "spinR 1.5s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="36" height="36" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill={C.ice} />
            <path d="M50 14 a36 36 0 0 1 0 72 a26 26 0 0 0 0 -52 a18 18 0 0 1 0 36 Z" fill={C.indigo} />
          </svg>
        </div>
      </div>

      {/* progress bar */}
      <div style={{ width: "100%", maxWidth: 300 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.muted }}>Analysing</span>
          <span style={{ fontSize: 12, color: C.indigoBright, fontFamily: "'Syne', sans-serif" }}>
            {Math.round(pct)}%
          </span>
        </div>
        <div style={{ height: 4, background: C.line, borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: `linear-gradient(90deg, ${C.indigo}, ${C.indigoBright})`,
            width: `${pct}%`,
            transition: "width .6s cubic-bezier(.22,1,.36,1)",
          }} />
        </div>
      </div>

      {/* current stage */}
      <div key={stageIdx} style={{
        fontSize: 14, color: C.iceDim, textAlign: "center",
        animation: "fade .4s ease",
      }}>
        {STAGES[stageIdx]}…
      </div>

      <p style={{ fontSize: 11, color: C.muted, textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>
        Analysing across all four angles simultaneously. This takes 15–30 seconds.
      </p>
    </div>
  );
}