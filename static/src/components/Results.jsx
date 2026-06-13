import React, { useState, useEffect } from "react";
import { C, OzenWordmark, GlowBlob, GLOBAL_CSS, scoreColor10 } from "../brand.jsx";
import ShareCard from "./ShareCard.jsx";

// ── disclaimer blob — commented out for MVP, re-enable for public launch ─────
// function DisclaimerBlob() {
//   return (
//     <div style={{
//       width: "100%",
//       background: "#18140A",
//       border: `1px solid #3a2e0e`,
//       borderRadius: 12,
//       padding: "12px 14px",
//       marginTop: 24,
//       display: "flex", gap: 10, alignItems: "flex-start",
//     }}>
//       <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1, opacity: 0.7 }}>⚠️</span>
//       <p style={{ fontSize: 11, color: "#7a6a3a", lineHeight: 1.6, margin: 0 }}>
//         AI-generated estimates only — not medical advice. Lighting, angle, and image quality affect
//         accuracy.{" "}
//         <strong style={{ color: "#9a8040" }}>Always consult a qualified professional</strong>{" "}
//         before acting on any recommendation. Face image processed via Anthropic API — not stored.
//       </p>
//     </div>
//   );
// }

// ── score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score, delay = 0, size = "md" }) {
  const [width, setWidth] = useState(0);
  const pct = Math.min(100, Math.max(0, (Number(score) || 0) * 10));
  const h   = size === "lg" ? 10 : size === "sm" ? 4 : 6;

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay + 80);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div style={{ width: "100%", height: h, background: C.line, borderRadius: h, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: h,
        background: "linear-gradient(90deg, #EF4444 0%, #FB923C 25%, #FACC15 45%, #7FA8FF 70%, #4ADE80 100%)",
        backgroundSize: `${10000 / (pct || 1)}% 100%`,
        width: `${width}%`,
        transition: `width 1.3s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }} />

    </div>
  );
}

// ── hero gauge ───────────────────────────────────────────────────────────────
// function HeroGauge({ score }) {
//   const [display, setDisplay] = useState(0);
//   const [offset,  setOffset]  = useState(1);
//   const size = 200, stroke = 12;
//   const r = (size - stroke) / 2;
//   const c = 2 * Math.PI * r;
//   const color = scoreColor10(score);

function PotentialRing({ score }) {
  const [offset, setOffset] = useState(1);
  const size = 64, stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = "#C9A0E8";

  useEffect(() => {
    const t = setTimeout(() => setOffset(c - (score / 10) * c), 600);
    return () => clearTimeout(t);
  }, [score, c]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.line} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1) .6s", filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif", color, lineHeight: 1 }}>
          {score.toFixed(1)}
        </div>
        <div style={{ fontSize: 7, letterSpacing: 1.5, color: C.muted, marginTop: 2 }}>POTENTIAL</div>
      </div>
    </div>
  );
}

function HeroGauge({ score, potential = 0 }) {
  const [display, setDisplay] = useState(0);
  const [offset,  setOffset]  = useState(1);
  const [potOffset, setPotOffset] = useState(1);
  const size = 200, stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = scoreColor10(score);

  // Potential ring — slightly larger, dashed purple
  const rp = r + stroke + 6;
  const cp = 2 * Math.PI * rp;

  useEffect(() => {
    const start = performance.now(), dur = 1400;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay((eased * score).toFixed(1));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score]);

  useEffect(() => {
    const t = setTimeout(() => setOffset(c - (score / 10) * c), 200);
    return () => clearTimeout(t);
  }, [score, c]);

  useEffect(() => {
    const t = setTimeout(() => setPotOffset(cp - (potential / 10) * cp), 400);
    return () => clearTimeout(t);
  }, [potential, cp]);

  const pad = 20; // padding for outer ring
  const total = size + pad * 2;

  return (
    <div style={{ position: "relative", width: total, height: total }}>
      {/* glow */}
      <div style={{
        position: "absolute",
        inset: pad + 16,
        borderRadius: "50%",
        background: `radial-gradient(circle at 50% 40%, ${color}18, transparent 70%)`,
      }} />

      <svg
        width={total}
        height={total}
        viewBox={`0 0 ${total} ${total}`}
        style={{ transform: "rotate(-90deg)", position: "relative" }}
      >
        {/* score track */}
        <circle cx={total/2} cy={total/2} r={r} fill="none" stroke={C.line} strokeWidth={stroke} />
        {/* score fill */}
        <circle cx={total/2} cy={total/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1), stroke .4s ease", filter: `drop-shadow(0 0 12px ${color}66)` }}
        />
        {/* potential track — faint */}
        {potential > 0 && (
          <circle cx={total/2} cy={total/2} r={rp} fill="none"
            stroke="#C9A0E822" strokeWidth={2} strokeDasharray={`4 4`}
          />
        )}
        {/* potential fill — dashed purple */}
        {potential > 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 8 }}>
            <PotentialRing score={potential} />
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1 }}>6–12 MONTH CEILING</div>
          </div>
        )}
      </svg>

      {/* center text */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 56, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: C.text, lineHeight: 1, letterSpacing: -2 }}>
          {display}
        </div>
        <div style={{ fontSize: 10, letterSpacing: 4, color: C.muted, marginTop: 5 }}>OUT OF 10</div>
      </div>
    </div>
  );
}

// Title case helper
function toTitleCase(str) {
  if (!str) return str;
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

// ── small ring ───────────────────────────────────────────────────────────────
function SmallRing({ score, delay = 0 }) {
  const [offset, setOffset] = useState(1);
  const size = 44, stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = scoreColor10(score);

  useEffect(() => {
    const t = setTimeout(() => setOffset(c - (score / 10) * c), delay);
    return () => clearTimeout(t);
  }, [score, c, delay]);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.line} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: `stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1) ${delay}ms` }}
      />
    </svg>
  );
}

// ── score meta — 5 core + 1 conditional (facial_hair, men only) ──────────────
const SCORE_META = {
  eyes:         { label: "Eyes",                      weight: "1.2×" },
  eyebrows:     { label: "Eyebrows",                  weight: "1.0×" },
  hair:         { label: "Hair",                      weight: "1.0×" },
  skin_quality: { label: "Skin Quality",              weight: "1.1×" },
  jawline:      { label: "Jawline & Face Definition", weight: "1.3×" },
  facial_hair:  { label: "Facial Hair",               weight: "0.9×" }, // men only
};

const ZONE_COLORS = { green: "#4ADE80", yellow: "#FACC15", red: "#EF4444" };

const PROMO_CODE = "MVP";

// ── parameter score card (accordion) ─────────────────────────────────────────
function ScoreCard({ paramKey, score, observation, index }) {
  const [open, setOpen] = useState(false);
  const meta   = SCORE_META[paramKey] || { label: paramKey, weight: "" };
  const color  = scoreColor10(score);
  const hasObs = !!observation;

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 14,
      overflow: "hidden",
      animation: `rise .4s ease ${0.16 + index * 0.04}s both`,
    }}>
      <div
        onClick={() => hasObs && setOpen((o) => !o)}
        style={{
          padding: "13px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: hasObs ? "pointer" : "default",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <SmallRing score={score} delay={300 + index * 60} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{meta.label}</span>
            <span style={{ fontSize: 10, color: C.muted }}>{meta.weight}</span>
          </div>
        </div>
        <span style={{
          fontSize: 20, fontWeight: 700,
          fontFamily: "'Syne', sans-serif",
          color, minWidth: 36, textAlign: "right",
        }}>
          {(Number(score) || 0).toFixed(1)}
        </span>
        {hasObs && (
          <span style={{
            color: C.muted, fontSize: 13,
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "none",
            marginLeft: 2,
          }}>▾</span>
        )}
      </div>

      {open && hasObs && (
        <div style={{
          padding: "0 16px 14px",
          animation: "fade .25s ease",
          borderTop: `1px solid ${C.line}`,
        }}>
          <div style={{ paddingTop: 12, marginBottom: 10 }}>
            <ScoreBar score={score} delay={0} />
          </div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0 }}>
            {observation}
          </p>
        </div>
      )}

    </div>
  );
}

// ── blurred placeholder card ──────────────────────────────────────────────────
function BlurredCard({ index }) {
  const placeholders = [
    { label: "Jawline", weight: "1.3×", score: "?.?" },
    { label: "Skin Quality", weight: "1.1×", score: "?.?" },
    { label: "Hair", weight: "1.0×", score: "?.?" },
    { label: "Eyebrows", weight: "1.0×", score: "?.?" },
    { label: "Nose", weight: "1.0×", score: "?.?" },
    { label: "Facial Hair", weight: "0.9×", score: "?.?" },
  ];
  const p = placeholders[index % placeholders.length];

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 14,
      overflow: "hidden",
      filter: "blur(6px)",
      userSelect: "none",
      pointerEvents: "none",
      opacity: 0.7,
    }}>
      <div style={{
        padding: "13px 16px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        {/* placeholder ring */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          border: `4px solid ${C.line}`,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{p.label}</span>
            <span style={{ fontSize: 10, color: C.muted }}>{p.weight}</span>
          </div>
        </div>
        <span style={{
          fontSize: 20, fontWeight: 700,
          fontFamily: "'Syne', sans-serif",
          color: C.muted, minWidth: 36, textAlign: "right",
        }}>{p.score}</span>
        <span style={{ color: C.muted, fontSize: 13, marginLeft: 2 }}>▾</span>
      </div>

    </div>
  );
}

// ── promo code gate ───────────────────────────────────────────────────────────
function PromoGate({ onUnlock }) {
  const [code, setCode]   = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const tryUnlock = () => {
    if (code.trim().toUpperCase() === PROMO_CODE) {
      localStorage.setItem('ozen_unlocked', 'true');
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      background: `linear-gradient(180deg, transparent 0%, ${C.bg}ee 30%, ${C.bg} 60%)`,
      borderRadius: 16,
      padding: "32px 20px 28px",
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 14,
      marginTop: -60,
      position: "relative", zIndex: 2,
    }}>
      <div style={{ fontSize: 22 }}>🔒</div>
      <div style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 17, fontWeight: 700, color: C.text, textAlign: "center",
      }}>
        Full analysis locked
      </div>
      <p style={{
        fontSize: 13, color: C.muted, textAlign: "center",
        lineHeight: 1.55, margin: 0, maxWidth: 260,
      }}>
        Enter your access code to unlock all parameters, focus areas, and your 30-day protocol.
      </p>

      {/* input row */}
      <div style={{
        display: "flex", gap: 10, width: "100%", maxWidth: 320,
        animation: shake ? "shake .4s ease" : "none",
      }}>
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
          placeholder="Enter promo code"
          style={{
            flex: 1,
            background: C.card,
            border: `1.5px solid ${error ? "#EF4444" : C.line}`,
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 15,
            color: C.text,
            outline: "none",
            fontFamily: "inherit",
            letterSpacing: 2,
            textTransform: "uppercase",
            transition: "border-color .2s",
          }}
        />
        <button
          onClick={tryUnlock}
          style={{
            background: C.indigo,
            color: C.ice,
            border: "none",
            borderRadius: 10,
            padding: "12px 18px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Syne', sans-serif",
            boxShadow: `0 6px 20px ${C.indigo}55`,
            transition: "opacity .2s",
          }}
        >
          Unlock
        </button>
      </div>

      {error && (
        <p style={{ fontSize: 12, color: "#EF4444", margin: 0 }}>
          Invalid code — try again
        </p>
      )}

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
      `}</style>

    </div>
  );
}

// ── focus area card (accordion) ───────────────────────────────────────────────
function FocusCard({ area, index }) {
  const [open, setOpen] = useState(index === 0);
  const zoneColor = ZONE_COLORS[area.zone] || C.indigoBright;

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderLeft: `3px solid ${zoneColor}`,
      borderRadius: 14,
      overflow: "hidden",
      animation: `rise .5s ease ${0.3 + index * 0.1}s both`,
    }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "14px 16px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", cursor: "pointer", gap: 12,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{toTitleCase(area.area)}</span>
            <span style={{
              fontSize: 9, letterSpacing: 1, color: zoneColor,
              border: `1px solid ${zoneColor}55`, borderRadius: 6, padding: "2px 7px",
            }}>{(area.zone || "").toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 19, fontWeight: 700, color: zoneColor, fontFamily: "'Syne', sans-serif" }}>
              {(Number(area.current_score) || 0).toFixed(1)}
            </span>
            <div style={{ flex: 1 }}>
              <ScoreBar score={area.current_score} delay={300 + index * 100} />
            </div>
          </div>
        </div>
        <span style={{
          color: C.muted, fontSize: 13,
          transition: "transform .2s",
          transform: open ? "rotate(180deg)" : "none",
          flexShrink: 0,
        }}>▾</span>
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px", animation: "fade .3s ease", borderTop: `1px solid ${C.line}` }}>
          {area.why_it_matters && (
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: "12px 0 12px" }}>
              {area.why_it_matters}
            </p>
          )}
          {area.action_steps?.map((step, j) => (
            <div key={j} style={{ background: C.cardHi, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
              {step.step && (
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, marginBottom: (step.products_or_options || step.products) ? 10 : 0 }}>
                  {step.step}
                </div>
              )}
              {(step.products_or_options || step.products) && (() => {
                const p = step.products_or_options || step.products;
                return (
                  <div style={{ fontSize: 11, color: C.iceDim, lineHeight: 1.8 }}>
                    {p.uae_budget   && <div><span style={{ color: C.muted }}>UAE: </span>{p.uae_budget} · {p.uae_mid} · {p.uae_premium}</div>}
                    {p.india_budget && <div><span style={{ color: C.muted }}>India: </span>{p.india_budget} · {p.india_mid} · {p.india_premium}</div>}
                    {p.budget       && !p.uae_budget && !p.india_budget && (
                      <div>{p.budget} · {p.mid} · {p.premium}</div>
                    )}
                  </div>
                );
              })()}
              {(step.timeframe_to_results || step.timeframe) && (
                <div style={{ fontSize: 11, color: C.indigoBright, marginTop: 8 }}>
                  ⏱ {step.timeframe_to_results || step.timeframe}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ── main Results ──────────────────────────────────────────────────────────────
export default function Results({ result, onReset, onDashboard }) {
  const scores       = result.scores       || {};
  const observations = result.observations || {};
  const overall      = Number(result.overall_score)  || 0;
  const potential    = Number(result.potential_score) || 0;
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem('ozen_unlocked') === 'true'
  );
  const [showShare, setShowShare] = useState(false);

  // Gender from result — used to conditionally show facial_hair
  const isMale = (result.gender || "").toLowerCase() === "m" ||
                 (result.quiz_data?.gender || "").toLowerCase() === "m";

  // Sort score entries by score descending — best first
  // facial_hair only shown for men
  const scoreEntries = Object.entries(scores)
    .filter(([key]) => {
      if (!SCORE_META[key]) return false;
      if (key === "facial_hair" && !isMale) return false;
      return true;
    })
    .sort(([, a], [, b]) => Number(b) - Number(a));

  // First 2 cards shown free, rest blurred until unlocked
  const FREE_COUNT = 2;
  const freeEntries   = scoreEntries.slice(0, FREE_COUNT);
  const lockedEntries = scoreEntries.slice(FREE_COUNT);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, position: "relative" }}>
      <style>{GLOBAL_CSS}</style>
      <GlowBlob />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 60px", position: "relative", zIndex: 1 }}>

        {/* ── header ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 24, animation: "rise .5s ease",
        }}>
          <OzenWordmark size={16} />
          <button
            onClick={onReset}
            style={{
              background: "none", border: `1px solid ${C.line}`,
              color: C.muted, borderRadius: 20,
              padding: "6px 14px", fontSize: 12, cursor: "pointer",
            }}
          >
            New scan
          </button>
        </div>

        {/* ── hero gauge ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24, animation: "rise .6s ease .06s both" }}>
          <HeroGauge score={overall} potential={potential} />
          <div style={{ marginTop: 14, textAlign: "center" }}>
            {(result.detected_ethnicity || result.face_shape) && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
                {[result.detected_ethnicity, result.face_shape && `${result.face_shape} face`]
                  .filter(Boolean)
                  .map((tag) => (
                    <span key={tag} style={{
                      fontSize: 11, color: C.iceDim, background: C.card,
                      border: `1px solid ${C.line}`, borderRadius: 999, padding: "4px 12px",
                    }}>{tag}</span>
                  ))}
              </div>
            )}
            {potential > 0 && (
              <div style={{ fontSize: 13, color: C.good }}>
                Potential: <strong style={{ fontFamily: "'Syne', sans-serif" }}>{potential.toFixed(1)}</strong> — your 6–12 month ceiling
              </div>
            )}

            {/* disclaimer — right after potential */}
            <div style={{
              background: "#2A1F0A",
              border: `1px solid #5A3E1B`,
              borderRadius: 12, padding: "14px 16px", marginTop: 12,
              display: "flex", gap: 8, alignItems: "flex-start",
              maxWidth: 340,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: 14, color: "#C9A06A", lineHeight: 1.6, margin: 0 }}>
                Results are indicative and subject to image quality, lighting, and angle. Always patch test recommended products before use. Consult a professional before significant changes.
              </p>
            </div>
          </div>
        </div>

        {/* ── overall score bar ── */}
        <div style={{
          background: C.card, border: `1px solid ${C.line}`,
          borderRadius: 14, padding: 18, marginBottom: 20,
          animation: "rise .5s ease .1s both",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 11, letterSpacing: 2, color: C.muted }}>OVERALL SCORE</span>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: scoreColor10(overall) }}>
              {overall.toFixed(1)}
            </span>
          </div>
          <ScoreBar score={overall} delay={200} size="lg" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 9, color: "#EF4444" }}>1.0</span>
            <span style={{ fontSize: 9, color: C.muted }}>5.0</span>
            <span style={{ fontSize: 9, color: "#4ADE80" }}>10.0</span>
          </div>
        </div>

        {/* ── image conditions ── */}
        {result.image_conditions && (
          <div style={{
            background: C.card, border: `1px solid ${C.line}`,
            borderRadius: 12, padding: "11px 14px", marginBottom: 18,
            fontSize: 12, color: C.muted, lineHeight: 1.55,
            animation: "rise .5s ease .12s both",
          }}>
            <span style={{ color: C.iceDim, fontWeight: 500 }}>Image conditions: </span>
            {typeof result.image_conditions === "string"
              ? result.image_conditions
              : [
                  result.image_conditions.lighting,
                  result.image_conditions.angle_quality || result.image_conditions.angle,
                  result.image_conditions.compensation_applied,
                ].filter(Boolean).join(" · ")}
          </div>
        )}

        {/* ── strengths ── */}
        {result.strengths?.length > 0 && (
          <div style={{
            background: `${C.good}12`, border: `1px solid ${C.good}44`,
            borderRadius: 14, padding: 18, marginBottom: 20,
            animation: "rise .5s ease .14s both",
          }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: C.good, marginBottom: 10 }}>YOUR STRENGTHS</div>
            {result.strengths.map((s, i) => (
              <div key={i} style={{
                fontSize: 14, color: C.text, lineHeight: 1.55,
                marginBottom: i < result.strengths.length - 1 ? 6 : 0,
              }}>· {s.charAt(0).toUpperCase() + s.slice(1)}</div>
            ))}
          </div>
        )}

        {/* ── ALL PARAMETERS ── */}
        {scoreEntries.length > 0 && (
          <div style={{ marginBottom: 22, animation: "rise .5s ease .16s both" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 10 }}>ALL PARAMETERS</div>

            {/* free card — always visible */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
              {freeEntries.map(([key, val], i) => (
                <ScoreCard
                  key={key}
                  paramKey={key}
                  score={Number(val) || 0}
                  observation={observations[key]}
                  index={i}
                />
              ))}
            </div>

            {/* locked section */}
            {!unlocked ? (
              <div style={{ position: "relative" }}>
                {/* blurred cards stack */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {lockedEntries.map(([key, val], i) => (
                    <BlurredCard key={key} index={i} />
                  ))}
                </div>

                {/* promo gate overlay */}
                <div style={{ position: "relative", marginTop: 0 }}>
                  <PromoGate onUnlock={() => setUnlocked(true)} />
                </div>
              </div>
            ) : (
              /* unlocked — show all remaining cards */
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lockedEntries.map(([key, val], i) => (
                  <ScoreCard
                    key={key}
                    paramKey={key}
                    score={Number(val) || 0}
                    observation={observations[key]}
                    index={FREE_COUNT + i}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── content below — only shown when unlocked ── */}
        {unlocked && (
          <>
            {/* focus areas */}
            {result.primary_focus_areas?.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 10 }}>FOCUS AREAS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.primary_focus_areas.map((area, i) => (
                    <FocusCard key={i} area={area} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* 30-day protocol */}
            {(result["30_day_protocol"] || result.thirty_day_protocol)?.length > 0 && (
              <div style={{
                background: `linear-gradient(135deg, ${C.indigo}33, ${C.card})`,
                border: `1px solid ${C.indigoBright}55`,
                borderRadius: 16, padding: 20, marginBottom: 22,
                animation: "rise .5s ease .35s both",
              }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                  Your 30-day protocol
                </div>
                {(result["30_day_protocol"] || result.thirty_day_protocol).map((item, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, marginBottom: 10,
                    fontSize: 13, color: C.text, lineHeight: 1.55,
                  }}>
                    <span style={{ color: C.indigoBright, fontWeight: 700, flexShrink: 0, fontFamily: "'Syne', sans-serif" }}>
                      {i + 1}.
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* facial metrics */}
            {result.metrics && (
              <div style={{
                background: C.card, border: `1px solid ${C.line}`,
                borderRadius: 14, padding: 18, marginBottom: 22,
                animation: "rise .5s ease .38s both",
              }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 12 }}>FACIAL METRICS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    ["fWHR",     result.metrics.fWHR],
                    ["Thirds",   result.metrics.facial_thirds],
                    ["Canthal",  result.metrics.canthal_tilt],
                    ["Symmetry", result.metrics.symmetry_deviation_pct != null
                      ? `${result.metrics.symmetry_deviation_pct}%`
                      : null],
                  ].filter(([, v]) => v).map(([label, val]) => (
                    <div key={label} style={{ background: C.cardHi, borderRadius: 10, padding: "11px 13px" }}>
                      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>
                        {label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 15, color: C.text, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── disclaimer — commented out for MVP, re-enable for public launch ── */}
        {/* <DisclaimerBlob /> */}

  

        {/* ── action buttons ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          <button
            onClick={() => setShowShare(true)}
            style={{
              width: "100%", background: "none",
              color: C.indigoBright,
              border: `1px solid ${C.indigoBright}66`, borderRadius: 14,
              padding: 14, fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            Share my score ↗
          </button>
          {onDashboard && (
            <button
              onClick={onDashboard}
              style={{
                width: "100%", background: C.indigo, color: C.ice,
                border: "none", borderRadius: 14, padding: 14,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                boxShadow: `0 6px 20px ${C.indigo}44`,
              }}
            >
              View my dashboard
            </button>
          )}
          <button
            onClick={onReset}
            style={{
              width: "100%", background: "none", color: C.muted,
              border: `1px solid ${C.line}`, borderRadius: 14,
              padding: 14, fontSize: 14, cursor: "pointer",
            }}
          >
            Start a new scan
          </button>
        </div>

      </div>

      {showShare && <ShareCard result={result} onClose={() => setShowShare(false)} />}
    </div>
  );
}


