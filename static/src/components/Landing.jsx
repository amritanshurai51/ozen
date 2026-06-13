import React from "react";
import { C, OzenLogo, GLOBAL_CSS } from "../brand.jsx";


export default function Landing({ onStart, onAuthClick }) {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      <style>{GLOBAL_CSS + `
        @keyframes floatY { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        @keyframes expandIn { from{transform:scale(.92);opacity:0;} to{transform:scale(1);opacity:1;} }
      `}</style>

      {/* atmospheric background blobs */}
      <div style={{
        position: "fixed", top: -160, left: "50%", transform: "translateX(-50%)",
        width: 520, height: 520,
        background: `radial-gradient(circle, ${C.indigo}50, transparent 70%)`,
        filter: "blur(60px)", animation: "glowpulse 6s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: -100, right: -80,
        width: 360, height: 360,
        background: `radial-gradient(circle, ${C.indigoBright}22, transparent 70%)`,
        filter: "blur(50px)", animation: "glowpulse 8s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 28px 60px",
        position: "relative", zIndex: 1,
        maxWidth: 480, margin: "0 auto", width: "100%",
      }}>

        {/* logo mark — floating */}
        <div style={{ animation: "floatY 5s ease-in-out infinite, expandIn .8s ease forwards", marginBottom: 32 }}>
          <svg width="90" height="90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill={C.ice} />
            <path d="M50 14 a36 36 0 0 1 0 72 a26 26 0 0 0 0 -52 a18 18 0 0 1 0 36 Z" fill={C.indigo} />
          </svg>
        </div>

        {/* wordmark */}
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 42, fontWeight: 800,
          letterSpacing: 10,
          color: C.text,
          animation: "rise .7s ease .1s both",
          marginBottom: 12,
        }}>
          OZEN
        </div>

        {/* tagline */}
        <p style={{
          fontSize: 15, color: C.iceDim, textAlign: "center",
          lineHeight: 1.65, maxWidth: 280,
          animation: "rise .7s ease .2s both",
          marginBottom: 8,
        }}>
          Your face. Scored. Improved.
        </p>
        <p style={{
          fontSize: 12, color: C.muted, textAlign: "center",
          lineHeight: 1.6, maxWidth: 260,
          animation: "rise .7s ease .28s both",
          marginBottom: 48,
        }}>
          AI-powered facial analysis
        </p>

        {/* divider dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 48, animation: "fade .8s ease .3s both" }}>
          {[C.indigo, C.indigoBright, C.ice].map((col, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: col }} />
          ))}
        </div>

        {/* primary CTA */}
        <button onClick={onStart} style={{
          width: "100%", maxWidth: 340,
          background: C.indigo, color: C.ice,
          border: "none", borderRadius: 16, padding: "17px 24px",
          fontSize: 17, fontWeight: 700,
          fontFamily: "'Syne', sans-serif", letterSpacing: 1,
          cursor: "pointer",
          boxShadow: `0 12px 40px ${C.indigo}66`,
          animation: "rise .6s ease .35s both",
          transition: "transform .15s ease, box-shadow .15s ease",
        }}
          onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 16px 48px ${C.indigo}88`; }}
          onMouseLeave={(e) => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 12px 40px ${C.indigo}66`; }}
        >
          Get my analysis →
        </button>

        {/* secondary — login placeholder */}
        <button style={{
          width: "100%", maxWidth: 340, marginTop: 12,
          background: "none", color: C.muted,
          border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 24px",
          fontSize: 14, fontWeight: 500, cursor: "pointer",
          animation: "rise .6s ease .42s both",
        }} onClick={onAuthClick}>
          Sign in to an existing account or create one
        </button>

        {/* small print */}
        <p style={{
          fontSize: 10, color: C.muted, textAlign: "center",
          lineHeight: 1.6, maxWidth: 280, marginTop: 36,
          animation: "fade .8s ease .5s both",
        }}>
          Beta · Private testing · Not a medical product
        </p>
      </div>
    </div>
  );
}