import React, { useState } from "react";
import { C, OzenWordmark, GlowBlob, GLOBAL_CSS } from "../brand.jsx";

const SECTIONS = [
  {
    title: "1. Beta Software",
    body: "This application is currently under development. It may contain bugs, errors, or unexpected behaviour.",
    bold: "under development",
  },
  {
    title: "2. How Your Data Is Processed",
    body: null, // custom render below
  },
  {
    title: "3. Limited Beta Testing",
    body: "This app is being shared with a small, private circle of approximately 20–30 people for the sole purpose of gathering feedback. It is not a publicly released product.",
  },
  {
    title: "4. Consent",
    body: null, // custom render below
  },
];

export default function Disclaimer({ onAccept, onBack }) {
  const [checked1, setChecked1] = useState(false); // read & understood
  const [checked2, setChecked2] = useState(false); // 18+
  const canContinue = checked1 && checked2;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, position: "relative" }}>
      <style>{GLOBAL_CSS}</style>
      <GlowBlob />

      <div style={{
        maxWidth: 480, margin: "0 auto",
        padding: "22px 20px 48px",
        position: "relative", zIndex: 1,
      }}>

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, animation: "rise .5s ease" }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", color: C.muted,
            fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1,
          }}>←</button>
          <OzenWordmark size={16} />
        </div>

        {/* title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, animation: "rise .5s ease .05s both" }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>
            Disclaimer & Consent
          </h1>
        </div>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 28, animation: "rise .5s ease .08s both" }}>
          Please read carefully before continuing.
        </p>

        {/* section 1 */}
        <Section title="1. Beta Software" delay={100}>
          <p style={bodyStyle}>
            This application is currently{" "}
            <strong style={{ color: C.text }}>under development</strong>.
            {" "}It may contain bugs, errors, or unexpected behaviour. Use it at your own discretion.
          </p>
        </Section>

        {/* section 2 */}
        <Section title="2. How Your Data Is Processed" delay={140}>
          <p style={{ ...bodyStyle, marginBottom: 10 }}>
            We want to be fully transparent about what happens with your data:
          </p>
         <BulletItem>
            <strong style={{ color: C.text }}>Analysis (Anthropic):</strong>{" "}
            Your input data and images are sent to Anthropic's Claude API for generating your personalised analysis.
            This data is processed on Anthropic's servers, which may be located in any region globally.{" "}
            <strong style={{ color: C.warn }}>Anthropic may retain API inputs and outputs for a period of time in accordance with their data policies.</strong>{" "}
            We recommend reviewing{" "}
            <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.indigoBright }}>
              Anthropic's Privacy Policy
            </a>{" "}
            for full details on data retention and usage.
          </BulletItem>
          <BulletItem>
            <strong style={{ color: C.text }}>No Personal Storage:</strong>{" "}
            We do not store your personal information, images, or analysis results on our servers beyond what is needed to process your request.
          </BulletItem>
        </Section>

        {/* section 3 */}
        <Section title="3. Limited Beta Testing" delay={180}>
          <p style={bodyStyle}>
            This app is being shared with a small, private circle of approximately{" "}
            <strong style={{ color: C.text }}>20–30 people</strong>{" "}
            for the sole purpose of gathering feedback. It is not a publicly released product.
          </p>
        </Section>

        {/* section 4 */}
        <Section title="5. Analysis Limitations & Health Notice" delay={200}>
          <p style={{ ...bodyStyle, marginBottom: 10 }}>
            Please read the following before acting on your results:
          </p>
          <BulletItem>
            <strong style={{ color: C.text }}>Results are indicative, not definitive.</strong>{" "}
            Analysis accuracy is directly affected by image quality, lighting conditions, camera angle, and photo resolution. Results may vary across different scans of the same person.
          </BulletItem>
          <BulletItem>
            <strong style={{ color: C.text }}>Patch test all products.</strong>{" "}
            Before using any skincare product recommended in your analysis, always perform a patch test on a small area of skin and wait 24 hours to check for adverse reactions.
          </BulletItem>
          <BulletItem>
            <strong style={{ color: C.text }}>Consult a professional.</strong>{" "}
            This analysis is not a substitute for advice from a qualified dermatologist, doctor, or healthcare professional. Always seek professional guidance before making significant changes to your skincare, diet, or health routine.
          </BulletItem>
        </Section>

        {/* section 5 */}
        <Section title="4. Consent" delay={220}>
          <p style={{ ...bodyStyle, marginBottom: 10 }}>
            By proceeding, you acknowledge and consent to the following:
          </p>
          <BulletItem>Your images and input data will be sent to and processed by Anthropic's servers, which may be located in any region globally.</BulletItem>
          <BulletItem>Anthropic may temporarily retain submitted data in accordance with their data retention policy.</BulletItem>
          <BulletItem>Your quiz responses and analysis results (not images) will be stored by OZEN to power your dashboard and scan history.</BulletItem>
          <BulletItem>This is beta software and may contain some errors.</BulletItem>
          <BulletItem>Anthropic may retain data submitted via their API in accordance with their privacy policy, which we encourage you to review.</BulletItem>
          {/* <BulletItem>You are voluntarily participating in a private development test with a small, closed group.</BulletItem> */}
        </Section>

        {/* checkboxes */}
        <div style={{
          background: C.card, border: `1px solid ${C.line}`, borderRadius: 14,
          padding: 18, marginTop: 24, marginBottom: 24,
          animation: "rise .5s ease .28s both",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <CheckRow
            checked={checked1}
            onChange={() => setChecked1((v) => !v)}
            label="I have read and understood the above, and I consent to my data being processed as described."
          />
          <div style={{ height: 1, background: C.line }} />
          <CheckRow
            checked={checked2}
            onChange={() => setChecked2((v) => !v)}
            label={<>I confirm that I am <strong style={{ color: C.text }}>18 years of age or older</strong>.</>}
          />
        </div>

        {/* CTA */}
        <button
          onClick={canContinue ? onAccept : undefined}
          disabled={!canContinue}
          style={{
            width: "100%",
            background: canContinue ? C.indigo : C.cardHi,
            color: canContinue ? C.ice : C.muted,
            border: "none", borderRadius: 14, padding: 16,
            fontSize: 16, fontWeight: 700,
            fontFamily: "'Syne', sans-serif",
            cursor: canContinue ? "pointer" : "not-allowed",
            boxShadow: canContinue ? `0 8px 28px ${C.indigo}55` : "none",
            transition: "all .25s ease",
            animation: "rise .5s ease .32s both",
          }}
        >
          {canContinue ? "Continue to App →" : "Tick both boxes to continue"}
        </button>

        <p style={{ fontSize: 10, color: C.muted, textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
          ozen.ae · Private beta · Not a medical product
        </p>
      </div>
    </div>
  );
}

// ── sub-components ───────────────────────────────────────────────────────────

function Section({ title, children, delay = 0 }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.line}`,
      borderRadius: 14, padding: "16px 18px", marginBottom: 12,
      animation: `rise .5s ease ${delay}ms both`,
    }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
        color: C.text, marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}

function BulletItem({ children }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
      <span style={{ color: C.indigoBright, fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>·</span>
      <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{children}</span>
    </div>
  );
}

function CheckRow({ checked, onChange, label }) {
  return (
    <div
      onClick={onChange}
      style={{ display: "flex", gap: 14, alignItems: "flex-start", cursor: "pointer" }}
    >
      {/* custom checkbox */}
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
        background: checked ? C.indigo : C.cardHi,
        border: `1.5px solid ${checked ? C.indigoBright : C.line}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .18s ease",
        boxShadow: checked ? `0 0 0 3px ${C.indigo}44` : "none",
      }}>
        {checked && <span style={{ color: C.ice, fontSize: 13, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: C.iceDim, lineHeight: 1.6, userSelect: "none" }}>{label}</span>
    </div>
  );
}

const bodyStyle = {
  fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0,
};