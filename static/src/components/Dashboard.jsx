import React, { useState, useEffect, useRef } from "react";
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

export default function Dashboard({
  user,
  onViewScan,
  onNewScan,
  scansRemaining,
  showBuyButton,
  onBuyScans,
  buyingScans,
  onSignOut,
}) {
  const [scans,   setScans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || "");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setAvatarUrl(user.user_metadata?.avatar_url || "");
  }, [user]);

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
  const firstName = name.split(" ")[0];
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "U";
  const phone = user.user_metadata?.phone || user.phone || "+91 98765 43210";
  const email = user.email || "Not provided";
  async function updateAvatar(nextAvatarUrl) {
    setAvatarBusy(true);
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        avatar_url: nextAvatarUrl,
      },
    });

    setAvatarBusy(false);

    if (error) {
      setErr("Could not update profile image. Please try again.");
      return false;
    }

    setAvatarUrl(data.user?.user_metadata?.avatar_url || nextAvatarUrl || "");
    setErr("");
    return true;
  }

  function readImageAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("file-read-failed"));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("image-load-failed"));
      image.src = source;
    });
  }

  async function compressAvatar(file) {
    const source = await readImageAsDataUrl(file);
    const image = await loadImage(source);
    const maxSize = 512;
    const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.82);
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      event.target.value = "";
      return;
    }

    try {
      const compressedAvatar = await compressAvatar(file);
      await updateAvatar(compressedAvatar);
    } catch (error) {
      console.error(error);
      setErr("Could not process this image. Please try another one.");
    }

    event.target.value = "";
  }

  async function handleRemoveAvatar() {
    await updateAvatar("");
  }

  if (showProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#F6F7FB", color: "#111111" }}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ maxWidth: 420, minHeight: "100vh", margin: "0 auto", background: "#FFFFFF", padding: "26px 20px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
            <button
              onClick={() => setShowProfile(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                border: "1px solid #E6E8F0",
                background: "#FFFFFF",
                color: "#7FA8FF",
                fontSize: 18,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
              }}
            >
              ‹
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ fontSize: 30, fontWeight: 500, margin: "0 0 8px", color: "#1A1D29" }}>
              My Profile
            </h1>
            <p style={{ fontSize: 14, color: "#9AA0B4", margin: 0 }}>
              Manage your personal information
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
            <div style={{ position: "relative" }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.10)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #202A95 0%, #7FA8FF 100%)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.10)",
                  }}
                >
                  {initials}
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: -8, marginBottom: 26 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarBusy}
              style={{
                minHeight: 40,
                borderRadius: 999,
                border: "1px solid #DCE3F7",
                background: "#EEF3FF",
                color: "#2D3CB3",
                padding: "0 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: avatarBusy ? "default" : "pointer",
                opacity: avatarBusy ? 0.7 : 1,
              }}
            >
              {avatarBusy ? "Updating..." : "Upload image"}
            </button>
            {avatarUrl ? (
              <button
                onClick={handleRemoveAvatar}
                disabled={avatarBusy}
                style={{
                  minHeight: 40,
                  borderRadius: 999,
                  border: "1px solid #F0D7DF",
                  background: "#FFF5F7",
                  color: "#B35679",
                  padding: "0 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: avatarBusy ? "default" : "pointer",
                  opacity: avatarBusy ? 0.7 : 1,
                }}
              >
                Remove
              </button>
            ) : null}
          </div>

          {err ? (
            <div style={{ marginBottom: 18, textAlign: "center", fontSize: 12, color: "#B35679" }}>{err}</div>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Full Name", value: name },
              { label: "Mobile Number", value: phone },
              { label: "Email Address", value: email },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 18,
                  padding: "16px 16px",
                  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.07)",
                  border: "1px solid #F0F2F7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "#A1A7B8", marginBottom: 6 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 20, color: "#2A2E3B", fontWeight: 400 }}>
                    {item.value}
                  </div>
                </div>
                <span style={{ color: "#8CA8FF", fontSize: 18, lineHeight: 1 }}>✎</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 44 }}>
            <button
              onClick={onSignOut}
              style={{
                background: "#202A95",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                padding: "11px 18px",
                fontSize: 18,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(32, 42, 149, 0.24)",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7FB", color: "#111111" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth: 420, minHeight: "100vh", margin: "0 auto", background: "#FFFFFF", padding: "26px 20px 48px" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 42, animation: "rise .5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
             <img src={OzenResult} alt="Ozen"  height={18}  />
          </div>
          <button
            onClick={() => setShowProfile(true)}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "1px solid #ECECF2",
              background: avatarUrl ? "#FFFFFF" : "linear-gradient(135deg, #202A95 0%, #7FA8FF 100%)",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              overflow: "hidden",
            }}
            aria-label="Open profile"
            title="Profile"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 13, fontWeight: 700 }}>{initials}</span>
            )}
          </button>
        </div>

        {/* welcome */}
        <div style={{ marginBottom: 26, animation: "rise .5s ease .05s both" }}>
          <h1 style={{ fontSize: 24, lineHeight: 1.15, fontWeight: 500, margin: "0 0 8px", color: "#111111" }}>
            Hey, {firstName}
          </h1>
          <p style={{ fontSize: 14, fontWeight: 400, color: "#000000", margin: 0 }}>
            {scans.length > 0
              ? `You have ${scans.length} scan${scans.length > 1 ? "s" : ""} on record.`
              : "No scans yet — take your first one."}
          </p>
          {scansRemaining !== null && (
            <p style={{ fontSize: 13, color: scansRemaining > 0 ? "#5F657A" : "#B35679", margin: "8px 0 0" }}>
              {scansRemaining} scan{scansRemaining === 1 ? "" : "s"} remaining
            </p>
          )}
        </div>

        {showBuyButton && (
          <button onClick={onBuyScans} style={{
            width: "100%", background: "#EEF4FF", color: "#1C3FAA",
            border: "1px solid #C7D8FF", borderRadius: 14, minHeight: 50,
            padding: "0 18px", fontSize: 16, fontWeight: 700,
            cursor: buyingScans ? "wait" : "pointer", marginBottom: 14,
            animation: "rise .5s ease .08s both", opacity: buyingScans ? 0.7 : 1,
          }}>
            {buyingScans ? "Redirecting..." : "Buy 2 More Scans"}
          </button>
        )}

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
