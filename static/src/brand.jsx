import logoImage from "./logo.jpeg";

// ── Brand tokens 
export const C = {
  indigo:       "#2A2F8F",
  indigoBright: "#4B52D6",
  ice:          "#DCE3F0",
  iceDim:       "#AEB8CE",
  bg:           "#16181D",
  card:         "#1D2027",
  cardHi:       "#252934",
  line:         "#2C313B",
  text:         "#EEF1F6",
  muted:        "#7B8294",
  good:         "#7FA8FF",
  warn:         "#C9A0E8",
  red:          "#E08AA8",
};

export const LIGHT_SURFACE_BORDER = "#EBEBEB";
export const LIGHT_SURFACE_SHADOW = "0 3px 10px rgba(0, 0, 0, 0.15)";

// Score → colour on a red→yellow→green gradient (0–10 scale)
export function scoreColor10(s) {
  const n = Number(s) || 0;
  if (n >= 7.5) return "#4ADE80";
  if (n >= 6.5) return "#7FA8FF";  // good blue
  if (n >= 5.0) return "#FACC15";  // yellow
  if (n >= 3.5) return "#FB923C";  // orange
  return "#EF4444";                 // red
}

// Score bar fill % for 0-10 scores
export function barPct(s) { return Math.min(100, Math.max(0, (Number(s) || 0) * 10)); }

// Animated score bar component
export function ScoreBar({ score, delay = 0 }) {
  const color = scoreColor10(score);
  const pct   = barPct(score);
  return (
    <div style={{ width: "100%", height: 6, background: C.line, borderRadius: 4, overflow: "hidden" }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        borderRadius: 4,
        background: `linear-gradient(90deg, #EF4444 0%, #FACC15 40%, #4ADE80 100%)`,
        backgroundSize: `${1000 / pct * 100}% 100%`,
        backgroundPosition: `${100 - pct}% 0`,
        transition: `width 1.2s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }} />
    </div>
  );
}

// Reusable logo mark
export function OzenLogo({ size = 24 }) {
  return (
    <img
      src={logoImage}
      alt="OZEN"
      width={size}
      height={size}
      style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
    />
  );
}

export { logoImage };

// Wordmark
export function OzenWordmark({ size = 20 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <OzenLogo size={size + 4} />
      <span style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: size,
        fontWeight: 700,
        letterSpacing: 3,
        color: C.text,
      }}>OZEN</span>
    </div>
  );
}

// Ambient glow blob (background decoration)
export function GlowBlob() {
  return (
    <div style={{
      position: "fixed", top: -140, left: "50%", transform: "translateX(-50%)",
      width: 480, height: 480,
      background: `radial-gradient(circle, ${C.indigo}40, transparent 70%)`,
      filter: "blur(55px)",
      animation: "glowpulse 6s ease-in-out infinite",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

// Global keyframes injected once
export const GLOBAL_CSS = `
  @keyframes glowpulse { 0%,100%{opacity:.3;} 50%{opacity:.65;} }
  @keyframes rise { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:none;} }
  @keyframes fade { from{opacity:0;} to{opacity:1;} }
  @keyframes spin  { to{transform:rotate(360deg);} }
  @keyframes spinR { to{transform:rotate(-360deg);} }
  @keyframes slideInR { from{opacity:0;transform:translateX(40px);} to{opacity:1;transform:none;} }
  @keyframes slideInL { from{opacity:0;transform:translateX(-40px);} to{opacity:1;transform:none;} }
  * { box-sizing:border-box; }
  button { font-family: inherit; }
  input  { font-family: inherit; }
`;
