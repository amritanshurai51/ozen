import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { GLOBAL_CSS, logoImage, scoreColor10 } from "../brand.jsx";
import OzenResult from "../../../image/Logo blue transparent 8.svg";

const LABELS = {
  eyes: "Eyes",
  eyebrows: "Brows",
  jawline: "Jawline",
  hair: "Hair",
  skin_quality: "Skin",
  facial_hair: "Facial Hair",
};

const CARD_ORDER = ["eyes", "eyebrows", "jawline", "hair", "skin_quality", "facial_hair"];

function Ring({ score, size = 80, strokeWidth = 6, track = "#ECECF4" }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(10, score)) / 10) * c;
  const color = scoreColor10(score);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function ResultsPreviewCard({ result, cardRef }) {
  const overall = Number(result.overall_score) || 0;
  const scores = result.scores || {};
  const isMale =
    (result.gender || "").toLowerCase() === "m" ||
    (result.quiz_data?.gender || "").toLowerCase() === "m";

  const visibleScores = CARD_ORDER.filter((key) => {
    if (!scores[key]) return false;
    if (key === "facial_hair" && !isMale) return false;
    return true;
  }).slice(0, 6);

  return (
    <div
      ref={cardRef}
      style={{
        width: "100%",
        maxWidth: 420,
        background: "#FFFFFF",
        borderRadius: 22,
        padding: "24px 24px 18px",
        border: "1px solid #EAEAF1",
        boxShadow: "0 12px 40px rgba(29, 41, 57, 0.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "14% 18% auto",
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 190, 39, 0.22), rgba(245, 190, 39, 0) 70%)",
          filter: "blur(26px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src={OzenResult} alt="Ozen"  height={18}  />
          {/* <span style={{ fontSize: 12, fontWeight: 600, color: "#2A2F8F" }}>Ozen</span> */}
        </div>
        <span style={{ fontSize: 10, letterSpacing: 2.5, color: "#6D708C" }}>FACIAL ANALYSIS</span>
      </div>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 }}>
        <div style={{ position: "relative", width: 164, height: 164, marginBottom: 14 }}>
          <Ring score={overall} size={164} strokeWidth={8} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 42, fontWeight: 500, color: "#C28B00", lineHeight: 1 }}>
              {overall.toFixed(1)}
            </span>
            <span style={{ marginTop: 10, fontSize: 11, letterSpacing: 2.4, color: "#8B8CA3" }}>OUT OF 10</span>
          </div>
        </div>
        <span style={{ fontSize: 12, letterSpacing: 3.2, color: "#6D708C" }}>OVERALL SCORE</span>
      </div>

      <div style={{ height: 1, background: "#ECECF4", marginBottom: 18 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
        {visibleScores.map((key) => {
          const score = Number(scores[key]) || 0;
          const color = scoreColor10(score);
          return (
            <div
              key={key}
              style={{
                background: "#FBFBFE",
                border: "1px solid #E7E7F0",
                borderRadius: 14,
                padding: "14px 10px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 104,
              }}
            >
              <div style={{ position: "relative", width: 52, height: 52 }}>
                <Ring score={score} size={52} strokeWidth={4} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color }}>{score.toFixed(1)}</span>
                </div>
              </div>
              <span style={{ fontSize: 11, color: "#6D708C", textAlign: "center" }}>{LABELS[key]}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#8B8CA3" }}>ozen.ae</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#2E36C6", letterSpacing: 1.4 }}>GET YOUR SCORE →</span>
      </div>
    </div>
  );
}

export default function Results({ result, onReset }) {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const shareText = useMemo(() => {
    const score = (Number(result.overall_score) || 0).toFixed(1);
    return `I scored ${score}/10 on Ozen facial analysis.`;
  }, [result]);

  const createCanvas = async () => {
    if (!cardRef.current) return null;
    return html2canvas(cardRef.current, {
      backgroundColor: "#FFFFFF",
      scale: 3,
      useCORS: true,
      logging: false,
    });
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const canvas = await createCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "ozen-score.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const canvas = await createCanvas();
      if (!canvas) return;

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not create image blob");

      const file = new File([blob], "ozen-score.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "My Ozen Score",
          text: shareText,
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.download = "ozen-score.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } catch (error) {
      console.error("Share failed", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        color: "#1D1F33",
        display: "flex",
        justifyContent: "center",
        padding: "40px 16px 56px",
      }}
    >
      <style>{GLOBAL_CSS}</style>

      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <ResultsPreviewCard result={result} cardRef={cardRef} />
        </div>

        <button
          onClick={handleShare}
          disabled={busy}
          style={{
            width: "100%",
            minHeight: 45,
            borderRadius: 12,
            border: "none",
            background: "#2A31AD",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 500,
            cursor: busy ? "default" : "pointer",
            boxShadow: "0 8px 18px rgba(46, 54, 198, 0.22)",
            marginBottom: 10,
          }}
        >
          {busy ? "Preparing..." : "Share my score  →"}
        </button>

        <button
          onClick={handleDownload}
          disabled={busy}
          style={{
            width: "100%",
            minHeight: 45,
            borderRadius: 12,
            border: "1px solid #E7E7F0",
            background: "#FBFBFE",
            color: "#1D1F33",
            fontSize: 14,
            fontWeight: 500,
            cursor: busy ? "default" : "pointer",
            marginBottom: 12,
          }}
        >
          Download as image
        </button>

        <button
          onClick={onReset}
          style={{
            border: "none",
            background: "transparent",
            color: "#6F7187",
            fontSize: 15,
            cursor: "pointer",
            padding: "6px 10px",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
