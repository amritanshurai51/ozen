import React, { useState, useEffect } from "react";
import { C, GLOBAL_CSS, OzenLogo, scoreColor10 } from "../brand.jsx";
import { supabase } from "../supabase.js";
import OzenResult from "../../../image/Logo blue transparent 8.svg";


function ScoreRing({ score, size = 48 }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 10) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#242D7B" strokeOpacity="0.2" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#242D7B" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset .8s ease" }}
      />
    </svg>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
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
    <div style={{ minHeight: "100vh", background: "#F6F7FB", color: "#111111" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth: 420, minHeight: "100vh", margin: "0 auto", background: "#FFFFFF", padding: "26px 20px 48px" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 42, animation: "rise .5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
             <img src={OzenResult} alt="Ozen"  height={18}  />
          </div>
          <button onClick={onSignOut} style={{
            background: "#FFFFFF",
            border: "1px solid #ECECF2",
            color: "#444857",
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 10,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
          }}>
            Sign out
          </button>
        </div>

        {/* welcome */}
        <div style={{ marginBottom: 26, animation: "rise .5s ease .05s both" }}>
          <h1 style={{ fontSize: 24, lineHeight: 1.15, fontWeight: 500, margin: "0 0 8px", color: "#111111" }}>
            Hey, {name.split(" ")[0]}
          </h1>
          <p style={{ fontSize: 14, fontWeight: 400, color: "#000000", margin: 0 }}>
            {scans.length > 0
              ? `You have ${scans.length} scan${scans.length > 1 ? "s" : ""} on record.`
              : "No scans yet — take your first one."}
          </p>
        </div>

        {/* new scan CTA */}
        <button onClick={onNewScan} style={{
          width: "100%", background: "#202A95", color: "#FFFFFF",
          border: "none", borderRadius: 14, minHeight: 54,
          padding: "0 18px",
          fontSize: 22, fontWeight: 600, cursor: "pointer",
          marginBottom: 28, animation: "rise .5s ease .1s both",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}>
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>+</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>New Scan</span>
        </button>

        {/* scans list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: 80, background: "#FFFFFF", borderRadius: 18,
                border: "1px solid #DADDE6", opacity: 0.5,
                animation: `glowpulse 1.5s ease ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
        ) : err ? (
          <div style={{ background: "#FFF3F6", border: "1px solid #F0C8D4", borderRadius: 16, padding: 16, fontSize: 13, color: "#B35679" }}>
            {err}
            <button onClick={fetchScans} style={{ display: "block", marginTop: 10, background: "none", border: "none", color: "#2332A1", cursor: "pointer", fontSize: 13 }}>
              Try again
            </button>
          </div>
        ) : scans.length === 0 ? (
          <div style={{
            background: "#FFFFFF", border: "1px solid #E7E7EC", borderRadius: 18,
            padding: 32, textAlign: "center", animation: "rise .5s ease .15s both",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📷</div>
            <p style={{ fontSize: 14, color: "#6B7082", lineHeight: 1.6, margin: 0 }}>
              No scans yet. Hit "New scan" above to get your first analysis.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, color: "#282C39", marginBottom: 2 }}>Your Scans</div>
            {scans.map((scan, i) => (
              <div
                key={scan.id}
                onClick={() => onViewScan(scan.full_result)}
                style={{
                  background: "#FFFFFF",
                  border: "1.2px solid #202020",
                  borderRadius: 16,
                  padding: "14px 14px",
                  display: "flex", alignItems: "center", gap: 16,
                  cursor: "pointer", transition: "border-color .2s ease",
                  animation: `rise .4s ease ${0.15 + i * 0.07}s both`,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#3344C9"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#202020"}
              >
                {/* ring */}
                <div style={{ position: "relative", width: 48, height: 48 }}>
                  <ScoreRing score={scan.overall_score} />
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#242D7B",
                  }}>
                    {Math.round(Number(scan.overall_score) || 0)}
                  </div>
                </div>

                {/* info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#17181F", marginBottom: 2 }}>
                    Scan {i + 1}
                  </div>
                  <div style={{ fontSize: 13, color: "#17181F" }}>
                    {formatDate(scan.created_at)}
                  </div>
                </div>

                {/* potential */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#17181F", marginBottom: 3 }}>Potential</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#7FA8FF" }}>
                    {Number(scan.potential_score || 0).toFixed(1)}
                  </div>
                </div>

                <span style={{ color: "#31374A", fontSize: 18, lineHeight: 1 }}>›</span>
              </div>
            ))}
          </div>
        )}

        {/* footer */}
        <p style={{ fontSize: 10, color: "#8D92A3", textAlign: "center", marginTop: 32, lineHeight: 1.6 }}>
          ozen.ae · Beta · Not a medical product
        </p>
      </div>
    </div>
  );
}
