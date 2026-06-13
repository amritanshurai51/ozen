import React, { useState } from "react";
import { C, OzenLogo } from "../brand.jsx";
import { supabase } from "../supabase.js";

// ============================================================================
// OZEN — Sign Up / Login Modal
//
// TO BYPASS DURING TESTING:
//   In App.jsx, set REQUIRE_SIGNUP = false
// ============================================================================

export default function SignupModal({ onSignup, onDismiss }) {
  const [mode,     setMode]     = useState("signup"); // "signup" | "login"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");

  const handleSubmit = async () => {
    if (!email || !password)             { setErr("Email and password required."); return; }
    if (mode === "signup" && !name)      { setErr("Name is required."); return; }
    if (password.length < 6)             { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    setErr("");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      // Supabase may require email confirmation depending on your settings
      // If email confirmation is OFF, data.user is available immediately
      if (data.user) {
        setLoading(false);
        onSignup({ id: data.user.id, email: data.user.email, name });
      } else {
        // Email confirmation is ON — tell user to check email
        setLoading(false);
        setErr("Check your email to confirm your account, then come back to log in.");
      }

    } else {
      // Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      onSignup({
        id:    data.user.id,
        email: data.user.email,
        name:  data.user.user_metadata?.name || email,
      });
    }
  };

  const inputStyle = {
    width: "100%", background: C.cardHi, border: `1px solid ${C.line}`,
    borderRadius: 11, padding: "14px 15px", fontSize: 16, color: C.text,
    outline: "none", transition: "border-color .2s ease",
  };

  return (
    <>
      {/* backdrop */}
      <div onClick={onDismiss} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.72)",
        backdropFilter: "blur(10px)", zIndex: 50,
      }} />

      {/* sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.card, borderRadius: "24px 24px 0 0",
        border: `1px solid ${C.line}`,
        padding: "28px 24px 40px",
        zIndex: 51,
        animation: "slideUp .35s cubic-bezier(.22,1,.36,1)",
        maxWidth: 480, margin: "0 auto",
      }}>
        <style>{`@keyframes slideUp { from{transform:translateY(100%);opacity:0;} to{transform:none;opacity:1;} }`}</style>

        {/* handle */}
        <div style={{ width: 40, height: 4, background: C.line, borderRadius: 2, margin: "0 auto 24px" }} />

        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <OzenLogo size={22} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>OZEN</span>
        </div>

        {/* title */}
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
          {mode === "signup" ? "Your results are ready" : "Welcome back"}
        </h2>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, margin: "0 0 20px" }}>
          {mode === "signup"
            ? "Create a free account to unlock your full analysis."
            : "Sign in to see your results and track your progress."}
        </p>

        {/* mode toggle */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, background: C.cardHi, borderRadius: 10, padding: 3 }}>
          {["signup", "login"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{
              flex: 1, padding: "9px 0", fontSize: 13, fontWeight: 600,
              border: "none", borderRadius: 8, cursor: "pointer",
              background: mode === m ? C.indigo : "none",
              color: mode === m ? C.ice : C.muted,
              transition: "all .2s ease",
            }}>
              {m === "signup" ? "Create account" : "Sign in"}
            </button>
          ))}
        </div>

        {/* error */}
        {err && (
          <div style={{ background: "#E08AA822", border: `1px solid #E08AA855`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#E08AA8", lineHeight: 1.5 }}>
            {err}
          </div>
        )}

        {/* fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "signup" && (
            <input
              type="text" placeholder="Your name"
              value={name} onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="email" placeholder="Email address"
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Password (min 6 chars)"
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* submit */}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", marginTop: 16,
          background: loading ? C.line : C.indigo, color: C.ice,
          border: "none", borderRadius: 14, padding: 16,
          fontSize: 16, fontWeight: 600, cursor: loading ? "default" : "pointer",
          boxShadow: loading ? "none" : `0 8px 28px ${C.indigo}55`,
          fontFamily: "'Syne', sans-serif", transition: "all .2s ease",
        }}>
          {loading
            ? (mode === "signup" ? "Creating account…" : "Signing in…")
            : (mode === "signup" ? "Create account & see results" : "Sign in")}
        </button>

        {/* dismiss */}
        <button onClick={onDismiss} style={{
          width: "100%", marginTop: 10,
          background: "none", color: C.muted,
          border: `1px solid ${C.line}`, borderRadius: 14, padding: "13px 16px",
          fontSize: 14, cursor: "pointer",
        }}>
          Maybe later
        </button>

        <p style={{ fontSize: 10, color: C.muted, textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
          By signing up you agree to our Terms of Service. Your face images are never stored.
        </p>
      </div>
    </>
  );
}