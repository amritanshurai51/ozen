import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { GLOBAL_CSS, scoreColor10 } from "../brand.jsx";
import OzenResult from "../../../image/Logo blue transparent 8.svg";

const LABELS = {
  eyes: "Eyes",
  eyebrows: "Eyebrows",
  jawline: "Jaw & Face Definition",
  hair: "Hair & Grooming",
  skin_quality: "Skin Quality",
  facial_hair: "Facial Hair",
};

const CARD_ORDER = ["eyes", "eyebrows", "jawline", "hair", "skin_quality", "facial_hair"];

function reportScoreColor(score) {
  const value = Number(score) || 0;
  if (value < 4.5) return "#EF4444";
  if (value <= 6.5) return "#F2A100";
  return "#32B56A";
}

function Ring({ score, size = 80, strokeWidth = 6, track = "#ECECF4", color }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(10, score)) / 10) * c;
  const ringColor = color || reportScoreColor(score);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={ringColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function titleCase(value = "") {
  return String(value)
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function getVisibleScoreEntries(result) {
  const scores = result.scores || {};
  const isMale =
    (result.gender || "").toLowerCase() === "m" ||
    (result.quiz_data?.gender || "").toLowerCase() === "m";

  return CARD_ORDER.filter((key) => {
    if (scores[key] == null) return false;
    if (key === "facial_hair" && !isMale) return false;
    return true;
  }).map((key) => ({
    key,
    label: LABELS[key] || titleCase(key),
    score: Number(scores[key]) || 0,
    observation: result.observations?.[key] || "",
  }));
}

function buildFocusAreas(result, scoreEntries) {
  if (Array.isArray(result.primary_focus_areas) && result.primary_focus_areas.length > 0) {
    return result.primary_focus_areas.map((item) => ({
      area: item.area || "Focus Area",
      score: Number(item.current_score) || 0,
      description: item.why_it_matters || "",
      steps: Array.isArray(item.action_steps) ? item.action_steps.map((step) => step.step).filter(Boolean) : [],
    }));
  }

  return [...scoreEntries]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => ({
      area: item.label,
      score: item.score,
      description: item.observation || "This area has strong upside with a more consistent routine and better day-to-day habits.",
      steps: [
        "Build a simple routine and stay consistent for at least 30 days.",
        "Track progress weekly under similar lighting and angles.",
        "Focus on one or two high-impact improvements instead of changing everything at once.",
      ],
    }));
}

function buildProtocol(result, focusAreas) {
  if (Array.isArray(result["30_day_protocol"]) && result["30_day_protocol"].length > 0) {
    return result["30_day_protocol"];
  }

  return [
    "Morning: gentle cleanser, moisturiser, and broad-spectrum SPF 30+ every day.",
    "Evening: cleanse thoroughly and keep your barrier routine simple and consistent.",
    "Hydrate well and reduce excess sodium and processed foods where possible.",
    "Sleep consistently and aim for a repeatable bedtime and wake time.",
    "Use weekly progress photos to judge what is actually improving.",
    `Prioritize your lowest-scoring area first: ${focusAreas[0]?.area || "overall consistency"}.`,
  ];
}

function ProgressBar({ score, color }) {
  return (
    <div style={{ height: 12, borderRadius: 999, background: "#E9EBF2", overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, (score / 10) * 100))}%`,
          height: "100%",
          borderRadius: 999,
          background: color,
        }}
      />
    </div>
  );
}

function CircularCheckbox() {
  return (
    <span
      style={{
        position: "relative",
        width: 27,
        height: 27,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <input
        type="checkbox"
        checked
        readOnly
        aria-label="Completed step"
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          width: 27,
          height: 27,
          margin: 0,
          border: "none",
          borderRadius: "50%",
          background: "#5C3FF1",
          cursor: "default",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 12,
          height: 7,
          borderLeft: "3px solid #FFFFFF",
          borderBottom: "3px solid #FFFFFF",
          transform: "translateY(-1px) rotate(-45deg)",
          pointerEvents: "none",
        }}
      />
    </span>
  );
}

function ResultsPreviewCard({ result, cardRef, onExpand }) {
  const overall = Number(result.overall_score) || 0;
  const visibleScores = getVisibleScoreEntries(result).slice(0, 6);
  const overallColor = reportScoreColor(overall);

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

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <img src={OzenResult} alt="Ozen" height={18} />
        <span style={{ fontSize: 10, letterSpacing: 2.5, color: "#6D708C" }}>FACIAL ANALYSIS</span>
      </div>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 }}>
        <div style={{ position: "relative", width: 164, height: 164, marginBottom: 14 }}>
          <Ring score={overall} size={164} strokeWidth={8} color={overallColor} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 42, fontWeight: 500, color: overallColor, lineHeight: 1 }}>{overall.toFixed(1)}</span>
            <span style={{ marginTop: 10, fontSize: 11, letterSpacing: 2.4, color: "#8B8CA3" }}>OUT OF 10</span>
          </div>
        </div>
        <span style={{ fontSize: 12, letterSpacing: 3.2, color: "#6D708C" }}>OVERALL SCORE</span>
      </div>

      <div style={{ height: 1, background: "#ECECF4", marginBottom: 18 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
        {visibleScores.map((item) => (
          <div
            key={item.key}
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
              <Ring score={item.score} size={52} strokeWidth={4} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: reportScoreColor(item.score) }}>{item.score.toFixed(1)}</span>
              </div>
            </div>
            <span style={{ fontSize: 11, color: "#6D708C", textAlign: "center" }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#8B8CA3" }}>ozen.ae</span>
        <button
          onClick={onExpand}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            fontSize: 10,
            fontWeight: 600,
            color: "#2E36C6",
            letterSpacing: 1.4,
            cursor: "pointer",
          }}
        >
          GET YOUR SCORE →
        </button>
      </div>
    </div>
  );
}

function ReportCard({ children, style }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #EEF0F7",
        borderRadius: 28,
        padding: 22,
        boxShadow: "0 28px 80px rgba(114, 100, 255, 0.10)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function FullResultsReport({ result, onReset, onDashboard }) {
  const overall = Number(result.overall_score) || 0;
  const scoreEntries = getVisibleScoreEntries(result);
  const focusAreas = buildFocusAreas(result, scoreEntries);
  const protocol = buildProtocol(result, focusAreas);
  const topStrengths = Array.isArray(result.strengths) ? result.strengths.slice(0, 2) : [];
  const topWeakness = [...scoreEntries].sort((a, b) => a.score - b.score)[0];
  const overallColor = reportScoreColor(overall);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #F7F9FF 0%, #F0EEFF 42%, #FFFFFF 100%)",
        color: "#24304B",
        padding: "24px 16px 56px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <img src={OzenResult} alt="Ozen" height={22} />
          <button
            onClick={onReset}
            style={{
              border: "1px solid #E6EAF5",
              background: "#FFFFFF",
              color: "#4C556A",
              borderRadius: 999,
              minHeight: 34,
              padding: "0 14px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            
            Start over
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#8A97B6", marginBottom: 12 }}>FACIAL ANALYSIS</div>
          <div style={{ position: "relative", width: 184, height: 184, margin: "0 auto 16px" }}>
            <Ring score={overall} size={184} strokeWidth={8} color={overallColor} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 52, fontWeight: 700, color: overallColor, lineHeight: 1 }}>{overall.toFixed(1)}</div>
              <div style={{ marginTop: 8, fontSize: 11, letterSpacing: 3, color: "#8C95AF" }}>OUT OF 10</div>
            </div>
          </div>
          <div style={{ fontSize: 12, letterSpacing: 3, color: "#4D556C", fontWeight: 700 }}>
            {overall >= 7 ? "STRONG POTENTIAL · TOP 30 %" : overall >= 5.5 ? "ABOVE AVERAGE · TOP 40 %" : "EARLY STAGE · HIGH UPSIDE"}
          </div>
        </div>

        <ReportCard style={{ marginBottom: 18, background: "#FFF7E6", borderColor: "#F5D98F", boxShadow: "none" }}>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "#7B5A16" }}>
            {result.disclaimer || "Results are indicative and subject to image quality, lighting and angle. This is not medical advice and should be used only as a directional grooming and skincare guide."}
          </div>
        </ReportCard>

        <ReportCard style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#26324C" }}>Overall Score</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: overallColor }}>{overall.toFixed(1)}</div>
          </div>
          <ProgressBar score={overall} color={reportScoreColor(overall)} />
          <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.55, color: "#8B93AB" }}>
            Analysis is based on a single front-facing photo across multiple weighted facial dimensions and normalized against a peer reference set.
          </div>
        </ReportCard>

        <ReportCard style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: 2.4, color: "#8B97B8", fontWeight: 700, marginBottom: 12 }}>SUMMARY</div>
          <div style={{ fontSize: 13, lineHeight: 1.75, color: "#33415E" }}>
            {topStrengths.length > 0 ? (
              <p style={{ margin: "0 0 14px" }}>
                <strong style={{ color: "#1F2B46" }}>What works for you:</strong> {topStrengths.join(", ")}.
              </p>
            ) : null}
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#1F2B46" }}>What holds you back:</strong> {topWeakness?.observation || "Your lowest-scoring areas are largely routine-driven, which means they should improve with more consistent habits and better execution."}
            </p>
          </div>
        </ReportCard>

        <ReportCard style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 10, letterSpacing: 2.4, color: "#8B97B8", fontWeight: 700, marginBottom: 14 }}>CATEGORY BREAKDOWN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {scoreEntries.map((item) => (
              <div key={item.key}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#24304B" }}>{item.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: reportScoreColor(item.score) }}>{item.score.toFixed(1)}</span>
                  </div>
                  <ProgressBar score={item.score} color={reportScoreColor(item.score)} />
                </div>
              </div>
            ))}
          </div>
        </ReportCard>

        <div style={{ fontSize: 14, letterSpacing: 5, color: "#8C99B7", margin: "0 0 14px 10px" }}>FOCUS AREAS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 24 }}>
          {focusAreas.map((area, index) => {
            const color = reportScoreColor(area.score);
            return (
              <ReportCard key={`${area.area}-${index}`} style={{ padding: 26 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#24304B", letterSpacing: "-0.04em" }}>{area.area}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color }}>{area.score.toFixed(1)}</div>
                </div>
                <ProgressBar score={area.score} color={color} />
                <div style={{ marginTop: 22, fontSize: 13, lineHeight: 1.75, color: "#4B5B79" }}>{area.description}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 26 }}>
                  {area.steps.slice(0, 3).map((step, stepIndex) => (
                    <div key={stepIndex} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <CircularCheckbox />
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.55, color: "#44536F" }}>{step}</div>
                    </div>
                  ))}
                </div>
              </ReportCard>
            );
          })}
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #25235E 0%, #2D2A6F 44%, #4239A1 100%)",
            borderRadius: 20,
            padding: "24px 24px 20px",
            color: "#EDF0FF",
            marginBottom: 28,
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#A7B2F4", fontWeight: 700, marginBottom: 18 }}>YOUR SIX-STEP PROTOCOL</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {protocol.slice(0, 6).map((step, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #7065FF 0%, #8D68FF 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.55, color: "#E7EBFF", paddingTop: 2 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {onDashboard ? (
          <button
            onClick={onDashboard}
            style={{
              width: "100%",
              minHeight: 54,
              borderRadius: 15,
              border: "none",
              background: "linear-gradient(90deg, #4E47F8 0%, #6C2BFF 100%)",
              color: "#FFFFFF",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "rgba(22, 0.2, 55, 0.2) 0px 9px 9px;",
              marginBottom: 20,
            }}
          >
            View my dashboard →
          </button>
        ) : null}

        <button
          onClick={onReset}
          style={{
            width: "100%",
            minHeight: 54,
            borderRadius: 15,
            border: "1px solid #DCE1EE",
            background: "#FFFFFF",
            color: "#394764",
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 18px 40px rgba(45, 52, 80, 0.10)",
          }}
        >
          Start over
        </button>
      </div>
    </div>
  );
}

export default function Results({ result, onReset, onDashboard }) {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  if (expanded) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <FullResultsReport result={result} onReset={onReset} onDashboard={onDashboard} />
      </>
    );
  }

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
          <ResultsPreviewCard result={result} cardRef={cardRef} onExpand={() => setExpanded(true)} />
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
