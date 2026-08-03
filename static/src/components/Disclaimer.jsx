import React, { useState } from "react";
import { GLOBAL_CSS, LIGHT_SURFACE_BORDER, LIGHT_SURFACE_SHADOW, OzenLogo } from "../brand.jsx";
import landingLogo from "../../../image/Logo blue transparent.png";

const SECTIONS = [
  {
    iconBg: "#EEE7FF",
    icon: "flask",
    title: "1. Beta Version",
    lines: [
      "This app is currently in beta. You may experience occasional bugs or unexpected behavior.",
    ],
  },
  {
    iconBg: "#E8F8F0",
    icon: "shield",
    title: "2. Data Processing",
    lines: [
      "To analyze your skin, we securely process your photos and questionnaire responses.",
      "Your data is only used to generate your personalized skin analysis.",
    ],
  },
  {
    iconBg: "#FCECF1",
    icon: "heart",
    title: "3. Your Consent",
    lines: [
      "By continuing, you agree that:",
      "Your photos and responses will be processed to provide your skin analysis.",
      "Anonymous usage data may be used to improve the app.",
      "You are at least 18 years old or have parental consent where applicable.",
    ],
  },
];

export default function Disclaimer({ onAccept, onBack }) {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const canContinue = checked1 && checked2;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #F7F7FA 0%, #F2F3F7 100%)",
      color: "#111111",
      padding: "28px 16px 36px",
    }}>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        background: "#FFFFFF",
        borderRadius: 32,
        padding: "26px 20px 28px",
        boxShadow: LIGHT_SURFACE_SHADOW,
        border: `1px solid ${LIGHT_SURFACE_BORDER}`,
        animation: "rise .45s ease both",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button
            onClick={onBack}
            style={{
              border: `1px solid ${LIGHT_SURFACE_BORDER}`,
              background: "#FFFFFF",
              color: "#5F6476",
              width: 36,
              height: 36,
              borderRadius: 12,
              fontSize: 18,
              cursor: "pointer",
              boxShadow: LIGHT_SURFACE_SHADOW,
              padding: "0px 0px 8px 0px",
            }}
            aria-label="Back"
          >
            ←
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, letterSpacing: 0.2 }}>
            <img src={landingLogo} alt="OZEN" style={{ width: 90, height: 50 }} />
          </div>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#FFF4D8",
            color: "#D19000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}>
          <svg width="111" height="98" viewBox="0 0 111 98" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M55.5 4.625L4.625 92.5H106.375L55.5 4.625Z" fill="url(#paint0_linear_192_920)" stroke="#F5BA50" stroke-width="9.25" stroke-linejoin="round"/>
          <path d="M55.5 74V76.3125M55.5 37L55.5185 60.125" stroke="black" stroke-width="9.25" stroke-linecap="round"/>
          <defs>
          <linearGradient id="paint0_linear_192_920" x1="55.5" y1="4.625" x2="55.5" y2="92.5" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FAE191"/>
          <stop offset="0.5" stop-color="#FEDD7C"/>
          <stop offset="1" stop-color="#F8CC3C"/>
          </linearGradient>
          </defs>
          </svg>

          </div>
          <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.15, fontWeight: 500 }}>
            Disclaimer & Consent
          </h1>
        </div>

        <p style={{ margin: "6px 0 22px", fontSize: 12, lineHeight: 1.5, color: "#000000", fontWeight: 400 }}>
          Please review the following before continuing.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SECTIONS.map((section, index) => (
            <Section key={section.title} section={section} delay={index * 60} />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
          <CheckRow
            checked={checked1}
            onChange={() => setChecked1((value) => !value)}
            label={
              <>
                I have read and agree to the
                {" "}
                <span style={{ color: "#5964CB" }}>Privacy Policy</span>
                {" "}
                and
                {" "}
                <span style={{ color: "#5964CB" }}>Terms of Use</span>.
              </>
            }
          />
          <CheckRow
            checked={checked2}
            onChange={() => setChecked2((value) => !value)}
            label="I confirm that I am 18 Years of age or older."
          />
        </div>

        <button
          onClick={canContinue ? onAccept : undefined}
          disabled={!canContinue}
          style={{
            width: "100%",
            minHeight: 52,
            marginTop: 18,
            border: `1px solid ${canContinue ? "#202A95" : LIGHT_SURFACE_BORDER}`,
            borderRadius: 18,
            background: canContinue ? "#202A95" : "#FFFFFF",
            color: canContinue ? "#FFFFFF" : "#6B7280",
            fontSize: 16,
            fontWeight: 700,
            cursor: canContinue ? "pointer" : "not-allowed",
            boxShadow: LIGHT_SURFACE_SHADOW,
          }}
        >
          Continue  ›
        </button>
      </div>
    </div>
  );
}

function Section({ section, delay }) {
  return (
    <div style={{
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
      padding: "16px 14px",
      borderRadius: 20,
      border: `1px solid ${LIGHT_SURFACE_BORDER}`,
      background: "#FFFFFF",
      boxShadow: LIGHT_SURFACE_SHADOW,
      animation: `rise .45s ease ${delay}ms both`,
    }}>
      <div style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: section.iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 2,
      }}>
        <SectionIcon type={section.icon} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#191A22", marginBottom: 8 }}>
          {section.title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {section.lines.map((line) => (
            <p key={line} style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#8C8FA1" }}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckRow({ checked, onChange, label }) {
  return (
    <label
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 12px",
        borderRadius: 16,
        border: `1px solid ${LIGHT_SURFACE_BORDER}`,
        background: "#FFFFFF",
        boxShadow: LIGHT_SURFACE_SHADOW,
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{
          width: 16,
          height: 16,
          margin: "2px 0 0",
          flexShrink: 0,
          accentColor: "#202A95",
          cursor: "pointer",
        }}
      />
      <div style={{
        marginTop: 2,
        minHeight: 16,
      }}>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.55, color: "#8C8FA1", userSelect: "none" }}>
        {label}
      </div>
    </label>
  );
}

function SectionIcon({ type }) {
  if (type === "flask") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10 3h4" stroke="#8E6BFF" strokeWidth="1.7" strokeLinecap="round"/>
        <path d="M10 3v5l-4.6 7.4A3 3 0 0 0 7.95 20h8.1a3 3 0 0 0 2.55-4.6L14 8V3" stroke="#8E6BFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.5 14h7" stroke="#8E6BFF" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 6.5 5v5.33c0 3.65 2.34 6.99 5.5 8.17 3.16-1.18 5.5-4.52 5.5-8.17V5L12 3Z" stroke="#61B989" strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="m9.8 11.9 1.55 1.55 3.05-3.2" stroke="#61B989" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s-6-3.4-6-8.4A3.6 3.6 0 0 1 12 9a3.6 3.6 0 0 1 6 2.6C18 16.6 12 20 12 20Z" stroke="#E590A4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
