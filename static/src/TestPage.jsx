import React, { useState } from "react";
import Results from "./components/Results.jsx";
import { C, GLOBAL_CSS, GlowBlob, OzenWordmark } from "./brand.jsx";

// ============================================================================
// OZEN — Test Page  (remove before sharing with users)
// Sends FormData to /scan exactly matching InputForm pydantic schema.
// ============================================================================

// Must match InputForm pydantic model field names exactly
const SAMPLE_ANSWERS = {
  age:              26,
  gender:           "m",
  ethnicity:        "Indian / South Asian",
  city:             "Dubai",
  primary_goal:     "General glow-up",
  skincare_routine: "Basic cleanser only",
  skin_issues:      "Oiliness",
  body_type:        "Average",
  height:           175,
  weight:           72,
  style_type:       "Minimal / Clean, Old Money",
  monthly_budget:   "AED 200-500",
  currency:         "aed",
  gym_fitness:      "3-4x per week",
  sleep_bed:        "23:30",
  sleep_wake:       "07:00",
  sleep_hours:      7.5,
};

export default function TestPage() {
  const [status,  setStatus]  = useState("idle");
  const [result,  setResult]  = useState(null);
  const [errMsg,  setErrMsg]  = useState("");

  const runTest = async () => {
    setStatus("loading");
    setErrMsg("");
    setResult(null);

    try {
      // Fetch sample.jpg served from dist/
      const imgResp = await fetch("/sample.jpg");
      if (!imgResp.ok) throw new Error(`Could not load sample.jpg (${imgResp.status})`);
      const imgBlob = await imgResp.blob();

      // Build FormData matching FastAPI's Form(...) + File(...) signature
      const formData = new FormData();
      formData.append("quiz_data", JSON.stringify(SAMPLE_ANSWERS));
      formData.append("images", imgBlob, "front_top.jpg");
      formData.append("images", imgBlob, "front_bottom.jpg");
      formData.append("images", imgBlob, "left_45.jpg");
      formData.append("images", imgBlob, "right_45.jpg");

      const resp = await fetch("/scan", {
        method: "POST",
        body:   formData,
      });

      const json = await resp.json();

      if (!resp.ok || json.error) {
        setErrMsg(json.error || json.message || `HTTP ${resp.status}`);
        setStatus("error");
        return;
      }

      setResult(json.result || json);
      setStatus("done");

    } catch (e) {
      setErrMsg(e.message);
      setStatus("error");
    }
  };

  // Hand off to real Results component
  if (status === "done" && result) {
    return <Results result={result} onReset={() => { setStatus("idle"); setResult(null); }} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, position: "relative" }}>
      <style>{GLOBAL_CSS}</style>
      <GlowBlob />

      <div style={{
        maxWidth: 440, margin: "0 auto", padding: "40px 24px",
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
        minHeight: "100vh", justifyContent: "center",
      }}>
        <OzenWordmark size={20} />

        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
            Results Preview
          </h1>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            Fires a real <code style={{ color: C.indigoBright }}>/scan</code> request with{" "}
            <code style={{ color: C.indigoBright }}>sample.jpg</code> × 4 and renders your Results page.
          </p>
        </div>

        {/* sample image */}
        <img
          src="/sample.jpg"
          alt="sample"
          style={{ width: 120, height: 120, borderRadius: 14, objectFit: "cover", border: `1.5px solid ${C.line}` }}
        />

        {/* quiz data preview */}
        <div style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 8 }}>SENDING TO /scan</div>
          {Object.entries(SAMPLE_ANSWERS).map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 10, marginBottom: 4, fontSize: 11 }}>
              <span style={{ color: C.muted, minWidth: 110, flexShrink: 0 }}>{k}</span>
              <span style={{ color: C.iceDim }}>{String(v)}</span>
            </div>
          ))}
        </div>

        {/* error */}
        {status === "error" && (
          <div style={{
            width: "100%", background: "#E08AA822", border: `1px solid #E08AA855`,
            borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#E08AA8", lineHeight: 1.6,
          }}>
            <strong>Error:</strong> {errMsg}
          </div>
        )}

        {/* button */}
        <button
          onClick={runTest}
          disabled={status === "loading"}
          style={{
            width: "100%",
            background: status === "loading" ? C.cardHi : C.indigo,
            color: status === "loading" ? C.muted : C.ice,
            border: "none", borderRadius: 14, padding: 18,
            fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif",
            cursor: status === "loading" ? "default" : "pointer",
            boxShadow: status === "loading" ? "none" : `0 8px 28px ${C.indigo}55`,
            transition: "all .2s ease",
          }}
        >
          {status === "loading" ? "Analysing… (15–30s)" : "Fire test request →"}
        </button>

        {status === "loading" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", margin: "0 auto 10px",
              border: `3px solid ${C.line}`, borderTopColor: C.indigoBright,
              animation: "spin 1s linear infinite",
            }} />
            <p style={{ fontSize: 12, color: C.muted }}>Sending to Claude… 15–30 seconds</p>
          </div>
        )}

        <p style={{ fontSize: 10, color: C.muted, textAlign: "center" }}>
          Dev tool · Remove before sharing · <code>localhost:8000?test</code>
        </p>
      </div>
    </div>
  );
}