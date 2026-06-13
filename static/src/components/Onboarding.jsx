import React, { useState, useEffect } from "react";
import { C, OzenWordmark, GlowBlob, GLOBAL_CSS } from "../brand.jsx";

const STEPS = [
  {
    id: "identity", type: "identity", title: "The basics",
    sub: "This calibrates scoring norms to your background.",
  },
  {
    id: "climate", type: "select", title: "Where are you based?",
    sub: "Climate completely changes your skincare protocol.",
    options: ["Abu Dhabi", "Dubai", "Sharjah", "Riyadh", "Jeddah", "Doha", "Bengaluru", "Mumbai", "Delhi", "Kochi", "Other"],
  },
  {
    id: "routine", type: "routine", title: "Your current skincare",
    sub: "So we don't over- or under-prescribe.",
    routineOptions: ["None", "Basic cleanser only", "3-step", "5+ step"],
    issueOptions: ["Acne", "Pigmentation", "Dullness", "Oiliness", "Dryness", "None"],
  },
  {
    id: "body", type: "body", title: "Body type & height",
    sub: "Drives outfit fit, proportion and physique guidance.",
    options: ["Slim", "Average", "Athletic", "Soft / overweight", "Muscular"],
  },
  {
    id: "style", type: "multi2", title: "Your style direction",
    sub: "Pick up to 2. This is who you want to become.",
    options: ["Minimal / Clean", "Streetwear", "Formal / Sharp", "Old Money", "Rugged / Masculine", "Soft / Approachable"],
  },
  {
    id: "budget", type: "select", title: "Monthly grooming budget",
    sub: "So you get products you'd actually buy.",
    options: ["Under AED 200", "AED 200 – 500", "AED 500 – 1500", "AED 1500+"],
  },
  {
    id: "fitness", type: "select", title: "Training frequency",
    sub: "Changes your physique timeline and outfit advice.",
    options: ["Not training", "1–2× per week", "3–4× per week", "5+ days, serious"],
  },
  {
    id: "sleep", type: "sleep", title: "Sleep schedule",
    sub: "The biggest free variable in skin quality.",
  },
];

// ── shared sub-components ───────────────────────────────────────────────────
function Progress({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 5, marginBottom: 30 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i <= step ? C.indigoBright : C.line,
          transition: "background .35s ease",
        }} />
      ))}
    </div>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left",
      background: active ? C.indigo : C.card,
      color: active ? C.ice : C.text,
      border: `1px solid ${active ? C.indigoBright : C.line}`,
      borderRadius: 12, padding: "15px 16px",
      fontSize: 15, fontWeight: 500, cursor: "pointer",
      transition: "all .18s ease",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      boxShadow: active ? `0 6px 20px ${C.indigo}44` : "none",
    }}>
      {label}
      {active && <span style={{ color: C.ice, fontSize: 13 }}>✓</span>}
    </button>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 10 }}>
      {String(children).toUpperCase()}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: C.card, border: `1px solid ${C.line}`,
  borderRadius: 12, padding: "14px 16px", fontSize: 16, color: C.text,
  outline: "none",
};

const chip = (active) => ({
  background: active ? C.indigo : C.card, color: active ? C.ice : C.text,
  border: `1px solid ${active ? C.indigoBright : C.line}`, borderRadius: 999,
  padding: "10px 16px", fontSize: 14, cursor: "pointer", transition: "all .18s ease",
});

// ── step renderers ──────────────────────────────────────────────────────────
function IdentityStep({ value, set }) {
  const v = value || {};
  const ethnicities = ["Indian / South Asian", "Arab / Khaleeji", "Persian / Afghan", "East Asian", "Other"];
  const genders = ["Male", "Female"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Label>Age</Label>
        <input type="number" placeholder="e.g. 26" value={v.age || ""}
          onChange={(e) => set({ ...v, age: e.target.value })} style={inputStyle} />
      </div>
      <div>
        <Label>Gender</Label>
        <div style={{ display: "flex", gap: 8 }}>
          {genders.map((g) => (
            <button key={g} onClick={() => set({ ...v, gender: g })} style={{ ...chip(v.gender === g), flex: 1 }}>{g}</button>
          ))}
        </div>
      </div>
      <div>
        <Label>Ethnicity</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ethnicities.map((e) => (
            <Pill key={e} label={e} active={v.ethnicity === e} onClick={() => set({ ...v, ethnicity: e })} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SelectStep({ step, value, set }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {step.options.map((o) => <Pill key={o} label={o} active={value === o} onClick={() => set(o)} />)}
    </div>
  );
}

function Multi2Step({ step, value, set }) {
  const v = value || [];
  const toggle = (o) => {
    if (v.includes(o)) set(v.filter((x) => x !== o));
    else if (v.length < 2) set([...v, o]);
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {step.options.map((o) => {
          const active = v.includes(o);
          return (
            <button key={o} onClick={() => toggle(o)} style={{
              background: active ? C.indigo : C.card, color: active ? C.ice : C.text,
              border: `1px solid ${active ? C.indigoBright : C.line}`, borderRadius: 12,
              padding: "18px 12px", fontSize: 14, fontWeight: 500, cursor: "pointer",
              transition: "all .18s ease", minHeight: 72,
            }}>{o}</button>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 10, textAlign: "center" }}>{v.length}/2 selected</div>
    </div>
  );
}

function RoutineStep({ step, value, set }) {
  const v = value || { routine: null, issues: [] };
  const toggleIssue = (o) => {
    const has = v.issues.includes(o);
    set({ ...v, issues: has ? v.issues.filter((x) => x !== o) : [...v.issues, o] });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Label>Current routine</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {step.routineOptions.map((o) => (
            <Pill key={o} label={o} active={v.routine === o} onClick={() => set({ ...v, routine: o })} />
          ))}
        </div>
      </div>
      <div>
        <Label>Active issues (select all that apply)</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {step.issueOptions.map((o) => (
            <button key={o} onClick={() => toggleIssue(o)} style={chip(v.issues.includes(o))}>{o}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BodyStep({ step, value, set }) {
  const v = value || {};
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Label>Body type</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {step.options.map((o) => (
            <Pill key={o} label={o} active={v.type === o} onClick={() => set({ ...v, type: o })} />
          ))}
        </div>
      </div>
      <div>
        <Label>Height (cm)</Label>
        <input type="number" placeholder="e.g. 175" min="120" max="240" value={v.height || ""}
          onChange={(e) => set({ ...v, height: e.target.value })} style={inputStyle} />
      </div>
      <div>
        <Label>Weight (kg)</Label>
        <input 
          type="number" 
          placeholder="e.g. 72" 
          min="30"
          max="200"
          value={v.weight || ""}
          onChange={(e) => set({ ...v, weight: e.target.value })} 
          style={inputStyle} 
        />
      </div>
    </div>
  );
}

function SleepStep({ value, set }) {
  const v = value || {};
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <Label>Usually sleep at</Label>
        <input type="time" value={v.bed || ""} onChange={(e) => set({ ...v, bed: e.target.value })} style={inputStyle} />
      </div>
      <div>
        <Label>Usually wake at</Label>
        <input type="time" value={v.wake || ""} onChange={(e) => set({ ...v, wake: e.target.value })} style={inputStyle} />
      </div>
    </div>
  );
}

// ── validation ──────────────────────────────────────────────────────────────
function isValid(step, val) {
  if (!val) return false;
  switch (step.type) {
    case "identity": return !!(val.age && val.gender && val.ethnicity);
    case "select":   return !!val;
    case "multi2":   return val.length >= 1;
    case "routine":  return !!(val.routine && val.issues?.length >= 1);
    case "body": return !!(val.type && val.height && val.weight);
    case "sleep":    return !!(val.bed && val.wake);
    default:         return false;
  }
}

// ── main export ─────────────────────────────────────────────────────────────
export default function Onboarding({ onComplete, onBack }) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [dir, setDir]         = useState(1);

  const cur   = STEPS[step];
  const val   = answers[cur.id];
  const valid = isValid(cur, val);
  const setVal = (v) => setAnswers((a) => ({ ...a, [cur.id]: v }));

  const next = () => {
    if (step === STEPS.length - 1) { onComplete(answers); return; }
    setDir(1); setStep((s) => s + 1);
  };
  const back = () => { if (step === 0) return; setDir(-1); setStep((s) => s - 1); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: "column", position: "relative" }}>
      <style>{GLOBAL_CSS}</style>
      <GlowBlob />

      <div style={{ maxWidth: 480, width: "100%", margin: "0 auto", padding: "22px 20px 32px", position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          {step > 0 ? (
            <button onClick={back} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
          ) : onBack ? (
            <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
          ) : <span style={{ width: 22 }} />}
          <OzenWordmark size={16} />
          <span style={{ marginLeft: "auto", fontSize: 12, color: C.muted }}>{step + 1} / {STEPS.length}</span>
        </div>
        
        <Progress step={step} total={STEPS.length} />

        {/* question body */}
        <div key={step} style={{
          flex: 1,
          animation: `${dir > 0 ? "slideInR" : "slideInL"} .38s cubic-bezier(.22,1,.36,1)`,
        }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, margin: "0 0 8px", letterSpacing: -0.5 }}>{cur.title}</h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, margin: "0 0 26px" }}>{cur.sub}</p>

          {cur.type === "identity" && <IdentityStep value={val} set={setVal} />}
          {cur.type === "select"   && <SelectStep   step={cur} value={val} set={setVal} />}
          {cur.type === "multi2"   && <Multi2Step   step={cur} value={val} set={setVal} />}
          {cur.type === "routine"  && <RoutineStep  step={cur} value={val} set={setVal} />}
          {cur.type === "body"     && <BodyStep     step={cur} value={val} set={setVal} />}
          {cur.type === "sleep"    && <SleepStep    value={val} set={setVal} />}
        </div>

        {/* CTA */}
        <button onClick={next} disabled={!valid} style={{
          width: "100%", marginTop: 28,
          background: valid ? C.indigo : C.cardHi,
          color: valid ? C.ice : C.muted,
          border: "none", borderRadius: 14, padding: 16,
          fontSize: 16, fontWeight: 600, cursor: valid ? "pointer" : "not-allowed",
          transition: "all .2s ease",
          boxShadow: valid ? `0 8px 28px ${C.indigo}55` : "none",
        }}>
          {step === STEPS.length - 1 ? "Continue to photo capture →" : "Continue"}
        </button>
      </div>
    </div>
  );
}
