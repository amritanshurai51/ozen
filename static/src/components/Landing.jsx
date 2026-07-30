import React from "react";
import { GLOBAL_CSS, LIGHT_SURFACE_BORDER, LIGHT_SURFACE_SHADOW } from "../brand.jsx";
import landingLogo from "../../../image/Logo blue transparent.png";

export default function Landing({ onStart }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #F7F7FA 0%, #F2F3F7 100%)",
      color: "#111111",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{GLOBAL_CSS + `
        @keyframes landingFloat { 0%,100%{transform:translate3d(0,0,0);} 50%{transform:translate3d(0,-10px,0);} }
      `}</style>

      <div style={{
        position: "absolute",
        inset: "auto auto 18% -90px",
        width: 220,
        height: 220,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(42,47,143,.12), rgba(42,47,143,0) 70%)",
        filter: "blur(8px)",
      }} />
      <div style={{
        position: "absolute",
        top: -50,
        right: -70,
        width: 230,
        height: 230,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(75,82,214,.18), rgba(75,82,214,0) 72%)",
        filter: "blur(6px)",
      }} />

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 18px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          border: `1px solid ${LIGHT_SURFACE_BORDER}`,
          borderRadius: 32,
          padding: "30px 22px 28px",
          boxShadow: LIGHT_SURFACE_SHADOW,
          animation: "rise .55s ease both",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <img
              src={landingLogo}
              alt="OZEN"
              style={{
                width: 125,
                maxWidth: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>

          <div style={{ padding: "2px 6px 0" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: 28, lineHeight: 1.12, fontWeight: 500 }}>
              Start your analysis
            </h1>
            <p style={{ margin: "0 0 26px", fontSize: 15, lineHeight: 1.6, color: "#000000", fontWeight: 400 }}>
              Complete the journey, capture your photos, then sign in to unlock your result and save your progress.
            </p>

            <div style={{
              display: "grid",
              gap: 12,
              marginBottom: 24,
              padding: 18,
              borderRadius: 22,
              background: "#F8F8FC",
              border: `1px solid ${LIGHT_SURFACE_BORDER}`,
            }}>
              {[
                "Answer the onboarding questions.",
                "Capture your guided face images.",
                "Sign in after capture to continue to disclaimer and results.",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#202A95",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    •
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: "#4B5563" }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onStart}
              style={{
                width: "100%",
                minHeight: 54,
                border: "none",
                borderRadius: 16,
                background: "#202A95",
                color: "#FFFFFF",
                fontSize: 17,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: LIGHT_SURFACE_SHADOW,
              }}
            >
              Start journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
