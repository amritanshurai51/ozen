import React, { useRef, useState } from "react";
import { C, scoreColor10 } from "../brand.jsx";
import html2canvas from "html2canvas";

// ── Score ring for share card ─────────────────────────────────────────────────
function Ring({ score, size = 80, strokeWidth = 6 }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 10) * c;
  const color = scoreColor10(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2C313B" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
      />
    </svg>
  );
}

// ── The actual card that gets captured ───────────────────────────────────────
function Card({ result, cardRef }) {
  const overall  = Number(result.overall_score) || 0;
  const scores   = result.scores || {};
  const overallColor = scoreColor10(overall);

  const LABELS = {
    eyes:         "Eyes",
    eyebrows:     "Brows",
    hair:         "Hair",
    skin_quality: "Skin",
    jawline:      "Jawline",
    facial_hair:  "Facial Hair",
  };

  const scoreEntries = Object.entries(scores)
    .filter(([k]) => LABELS[k])
    .sort(([, a], [, b]) => Number(b) - Number(a));

  return (
    <div ref={cardRef} style={{
      width: 340,
      background: "#16181D",
      borderRadius: 24,
      padding: "32px 28px 28px",
      fontFamily: "'Syne', sans-serif",
      border: "1px solid #2C313B",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* ambient glow */}
      <div style={{
        position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
        width: 300, height: 300,
        background: `radial-gradient(circle, ${overallColor}22, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 28,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.jpeg" width={22} height={22} style={{ borderRadius: "50%", objectFit: "cover" }} />
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, color: "#EEF1F6" }}>OZEN</span>
        </div>
        <span style={{ fontSize: 10, color: "#7B8294", letterSpacing: 1 }}>FACIAL ANALYSIS</span>
      </div>

      {/* overall score — hero */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        <div style={{ position: "relative", width: 120, height: 120, marginBottom: 12 }}>
          <Ring score={overall} size={120} strokeWidth={8} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontSize: 40, fontWeight: 700, color: overallColor,
              lineHeight: 1, letterSpacing: -2,
            }}>{overall.toFixed(1)}</span>
            <span style={{ fontSize: 9, color: "#7B8294", letterSpacing: 3, marginTop: 4 }}>OUT OF 10</span>
          </div>
        </div>
        <div style={{
          fontSize: 11, color: "#7B8294", letterSpacing: 2, textTransform: "uppercase",
        }}>Overall Score</div>
      </div>

      {/* divider */}
      <div style={{ height: 1, background: "#2C313B", marginBottom: 20 }} />

      {/* sub scores grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 24,
      }}>
        {scoreEntries.map(([key, val]) => {
          const score = Number(val) || 0;
          const color = scoreColor10(score);
          return (
            <div key={key} style={{
              background: "#1D2027",
              borderRadius: 12,
              padding: "12px 8px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              border: "1px solid #2C313B",
            }}>
              <div style={{ position: "relative", width: 44, height: 44 }}>
                <Ring score={score} size={44} strokeWidth={3.5} />
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1 }}>
                    {score.toFixed(1)}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: 9, color: "#7B8294", letterSpacing: 0.5, textAlign: "center" }}>
                {LABELS[key]}
              </span>
            </div>
          );
        })}
      </div>

      {/* footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 10, color: "#7B8294" }}>ozen.ae</span>
        <span style={{ fontSize: 9, color: "#4B52D6", letterSpacing: 1 }}>GET YOUR SCORE →</span>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ShareCard({ result, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Dynamically load html2canvas
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#16181D",
        scale: 3, // high res
        useCORS: true,
        logging: false,
      });

      // Download
      const link = document.createElement("a");
      link.download = "ozen-score.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Share card error:", e);
      // Fallback — try native share if available
      alert("Download failed. Try screenshotting the card.");
    }
    setDownloading(false);
  };

  const handleNativeShare = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#16181D",
        scale: 3,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        const file = new File([blob], "ozen-score.png", { type: "image/png" });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "My OZEN Score",
            text: `I scored ${result.overall_score}/10 on OZEN facial analysis. Get yours at ozen.ae`,
            files: [file],
          });
        } else {
          // Fallback to download
          const link = document.createElement("a");
          link.download = "ozen-score.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
        setDownloading(false);
      });
    } catch (e) {
      console.error("Share error:", e);
      setDownloading(false);
    }
  };

  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20, padding: 24,
      }}>
        <div onClick={(e) => e.stopPropagation()}>
          <Card result={result} cardRef={cardRef} />
        </div>

        {/* action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 340 }}>
          <button
            onClick={handleNativeShare}
            disabled={downloading}
            style={{
              width: "100%",
              background: downloading ? "#252934" : "#2A2F8F",
              color: downloading ? "#7B8294" : "#DCE3F0",
              border: "none", borderRadius: 14, padding: 14,
              fontSize: 15, fontWeight: 700, cursor: downloading ? "default" : "pointer",
              fontFamily: "'Syne', sans-serif",
              boxShadow: downloading ? "none" : "0 6px 20px #2A2F8F55",
            }}
          >
            {downloading ? "Generating…" : "Share my score →"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              width: "100%",
              background: "none", color: "#7B8294",
              border: "1px solid #2C313B", borderRadius: 14, padding: 14,
              fontSize: 14, cursor: downloading ? "default" : "pointer",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            Download as image
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "#7B8294",
              fontSize: 13, cursor: "pointer", padding: 6,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}