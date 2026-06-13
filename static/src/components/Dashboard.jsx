import React, { useState, useEffect } from "react";
import { C, OzenWordmark, GlowBlob, GLOBAL_CSS, scoreColor10 } from "../brand.jsx";
import { supabase } from "../supabase.js";

// ============================================================================
// OZEN — Dashboard
// Shows past scans for logged-in user. Click any scan to view full results.
// ============================================================================

function ScoreRing({ score, size = 48 }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 10) * c;
  const color = scoreColor10(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.line} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset .8s ease" }}
      />
    </svg>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function Dashboard({ user, onViewScan, onNewScan, onSignOut }) {
  const [scans,   setScans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState("");

  useEffect(() => {
    fetchScans();
  }, [user]);

  async function fetchScans() {
    setLoading(true);
    setErr("");
    const { data, error } = await supabase
      .from("scans")
      .select("id, overall_score, potential_score, created_at, full_result")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setErr("Could not load your scans. Try again.");
      console.error(error);
    } else {
      setScans(data || []);
    }
    setLoading(false);
  }

  const name = user.user_metadata?.name || user.email;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, position: "relative" }}>
      <style>{GLOBAL_CSS}</style>
      <GlowBlob />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "22px 18px 60px", position: "relative", zIndex: 1 }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, animation: "rise .5s ease" }}>
          <OzenWordmark size={16} />
          <button onClick={onSignOut} style={{
            background: "none", border: `1px solid ${C.line}`,
            color: C.muted, borderRadius: 20, padding: "6px 14px",
            fontSize: 12, cursor: "pointer",
          }}>
            Sign out
          </button>
        </div>

        {/* welcome */}
        <div style={{ marginBottom: 28, animation: "rise .5s ease .05s both" }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>
            Hey, {name.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            {scans.length > 0
              ? `You have ${scans.length} scan${scans.length > 1 ? "s" : ""} on record.`
              : "No scans yet — take your first one."}
          </p>
        </div>

        {/* new scan CTA */}
        <button onClick={onNewScan} style={{
          width: "100%", background: C.indigo, color: C.ice,
          border: "none", borderRadius: 14, padding: 16,
          fontSize: 16, fontWeight: 700, cursor: "pointer",
          fontFamily: "'Syne', sans-serif", letterSpacing: 0.5,
          boxShadow: `0 8px 28px ${C.indigo}55`,
          marginBottom: 28, animation: "rise .5s ease .1s both",
        }}>
          + New scan
        </button>

        {/* scans list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: 80, background: C.card, borderRadius: 14,
                border: `1px solid ${C.line}`, opacity: 0.5,
                animation: `glowpulse 1.5s ease ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
        ) : err ? (
          <div style={{ background: "#E08AA822", border: `1px solid #E08AA855`, borderRadius: 12, padding: 16, fontSize: 13, color: "#E08AA8" }}>
            {err}
            <button onClick={fetchScans} style={{ display: "block", marginTop: 10, background: "none", border: "none", color: C.indigoBright, cursor: "pointer", fontSize: 13 }}>
              Try again
            </button>
          </div>
        ) : scans.length === 0 ? (
          <div style={{
            background: C.card, border: `1px solid ${C.line}`, borderRadius: 16,
            padding: 32, textAlign: "center", animation: "rise .5s ease .15s both",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📷</div>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, margin: 0 }}>
              No scans yet. Hit "New scan" above to get your first analysis.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 4 }}>YOUR SCANS</div>
            {scans.map((scan, i) => (
              <div
                key={scan.id}
                onClick={() => onViewScan(scan.full_result)}
                style={{
                  background: C.card, border: `1px solid ${C.line}`,
                  borderRadius: 14, padding: "16px 18px",
                  display: "flex", alignItems: "center", gap: 16,
                  cursor: "pointer", transition: "border-color .2s ease",
                  animation: `rise .4s ease ${0.15 + i * 0.07}s both`,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.indigoBright}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.line}
              >
                {/* ring */}
                <div style={{ position: "relative", width: 48, height: 48 }}>
                  <ScoreRing score={scan.overall_score} />
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: scoreColor10(scan.overall_score),
                    fontFamily: "'Syne', sans-serif",
                  }}>
                    {Number(scan.overall_score).toFixed(1)}
                  </div>
                </div>

                {/* info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>
                    Scan {scans.length - i}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {formatDate(scan.created_at)}
                  </div>
                </div>

                {/* potential */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 2 }}>POTENTIAL</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.good, fontFamily: "'Syne', sans-serif" }}>
                    {Number(scan.potential_score).toFixed(1)}
                  </div>
                </div>

                <span style={{ color: C.muted, fontSize: 16 }}>›</span>
              </div>
            ))}
          </div>
        )}

        {/* footer */}
        <p style={{ fontSize: 10, color: C.muted, textAlign: "center", marginTop: 32, lineHeight: 1.6 }}>
          ozen.ae · Beta · Not a medical product
        </p>
      </div>
    </div>
  );
}