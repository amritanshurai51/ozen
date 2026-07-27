import React, { useState } from "react";
import { GLOBAL_CSS, LIGHT_SURFACE_BORDER, LIGHT_SURFACE_SHADOW, OzenLogo } from "../brand.jsx";
import { supabase } from "../supabase.js";

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7.5C4 6.67 4.67 6 5.5 6h13c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-13C4.67 18 4 17.33 4 16.5v-9Z" stroke="#9CA3AF" strokeWidth="1.7"/>
      <path d="m5 8 7 5 7-5" stroke="#9CA3AF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 10V8a5 5 0 1 1 10 0v2" stroke="#9CA3AF" strokeWidth="1.7" strokeLinecap="round"/>
      <rect x="4" y="10" width="16" height="10" rx="2.5" stroke="#9CA3AF" strokeWidth="1.7"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3" stroke="#9CA3AF" strokeWidth="1.7"/>
      <path d="M5 18c1.4-2.67 4.05-4 7-4s5.6 1.33 7 4" stroke="#9CA3AF" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}

function EyeIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.75 12S6.5 6.75 12 6.75 21.25 12 21.25 12 17.5 17.25 12 17.25 2.75 12 2.75 12Z" stroke="#9CA3AF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="2.5" stroke="#9CA3AF" strokeWidth="1.7"/>
      {!open && <path d="M4 20 20 4" stroke="#9CA3AF" strokeWidth="1.7" strokeLinecap="round"/>}
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.71 12.63c.02 2.25 1.98 3 2 3.01-.02.05-.31 1.08-1.02 2.14-.61.92-1.25 1.83-2.25 1.85-.98.02-1.29-.58-2.41-.58-1.12 0-1.47.56-2.38.6-.97.04-1.71-.97-2.33-1.88-1.26-1.82-2.22-5.15-.93-7.39.64-1.11 1.79-1.81 3.04-1.83.95-.02 1.84.63 2.41.63.57 0 1.65-.78 2.78-.67.47.02 1.8.19 2.65 1.44-.07.05-1.58.92-1.56 2.68ZM14.72 5.63c.51-.62.86-1.49.76-2.35-.74.03-1.64.49-2.17 1.11-.48.55-.89 1.43-.78 2.27.82.06 1.67-.42 2.19-1.03Z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.52c-.24 1.26-.96 2.33-2.04 3.06l3.3 2.56c1.92-1.77 3.02-4.38 3.02-7.49 0-.73-.07-1.44-.19-2.12H12Z"/>
      <path fill="#34A853" d="M12 22c2.73 0 5.02-.91 6.69-2.46l-3.3-2.56c-.91.61-2.08.97-3.39.97-2.63 0-4.86-1.78-5.66-4.18l-3.42 2.64A10.1 10.1 0 0 0 12 22Z"/>
      <path fill="#4A90E2" d="M6.34 13.77a6.07 6.07 0 0 1 0-3.54L2.92 7.59a10.07 10.07 0 0 0 0 8.82l3.42-2.64Z"/>
      <path fill="#FBBC05" d="M12 6.05c1.49 0 2.82.51 3.88 1.52l2.91-2.91C17 3.04 14.72 2 12 2a10.1 10.1 0 0 0-9.08 5.59l3.42 2.64C7.14 7.83 9.37 6.05 12 6.05Z"/>
    </svg>
  );
}

function Field({ icon, type, placeholder, value, onChange, trailing }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      minHeight: 54,
      padding: "0 16px",
      borderRadius: 16,
      border: `1px solid ${LIGHT_SURFACE_BORDER}`,
      background: "#FFFFFF",
      boxShadow: LIGHT_SURFACE_SHADOW,
    }}>
      <div style={{ width: 20, display: "flex", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 16,
          color: "#111111",
        }}
      />
      {trailing ? <div style={{ display: "flex", alignItems: "center" }}>{trailing}</div> : null}
    </div>
  );
}

export default function Landing({ onStart, onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const isLogin = mode === "login";

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErr("");
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setErr("Email and password required.");
      return;
    }
    if (!isLogin && !name) {
      setErr("Name is required.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErr("");

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      onAuthSuccess({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email,
      });
      return;
    }

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

    if (data.user) {
      setLoading(false);
      onAuthSuccess({
        id: data.user.id,
        email: data.user.email,
        name,
      });
      return;
    }

    setLoading(false);
    setErr("Check your email to confirm your account, then come back to log in.");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #F7F7FA 0%, #F2F3F7 100%)",
      color: "#111111",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{GLOBAL_CSS + `
        @keyframes landingFloat { 0%,100%{transform:translate3d(0,0,0);} 50%{transform:translate3d(0,-10px,0);} }
      `}</style>

      <div style={{
        position: "absolute",
        inset: "auto auto 18% -90px",
        width: 220,
        height: 220,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(42,47,143,.12), rgba(42,47,143,0) 70%)",
        filter: "blur(8px)",
      }} />
      <div style={{
        position: "absolute",
        top: -50,
        right: -70,
        width: 230,
        height: 230,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(75,82,214,.18), rgba(75,82,214,0) 72%)",
        filter: "blur(6px)",
      }} />

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 18px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          border: `1px solid ${LIGHT_SURFACE_BORDER}`,
          borderRadius: 32,
          padding: "28px 22px 24px",
          boxShadow: LIGHT_SURFACE_SHADOW,
          animation: "rise .55s ease both",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ animation: "landingFloat 5s ease-in-out infinite" }}>
              <OzenLogo size={34} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, color: "#151515" }}>OZEN</div>
          </div>

          <div style={{ padding: "2px 6px 0" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: 24, lineHeight: 1.15, fontWeight: 500 }}>
              {isLogin ? "Welcome back" : "Your results are ready"}
            </h1>
            <p style={{ margin: "0 0 26px", fontSize: 15, lineHeight: 1.6, color: "#000000", fontWeight: 400 }}>
              {isLogin
                ? "Sign in to see your results and track your progress."
                : "Create a free account to unlock your full analysis."}
            </p>

            {err && (
              <div style={{
                marginBottom: 14,
                borderRadius: 14,
                border: "1px solid #F1C5CD",
                background: "#FFF1F4",
                color: "#B84D63",
                padding: "11px 14px",
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                {err}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {!isLogin && (
                <Field
                  icon={<UserIcon />}
                  type="text"
                  placeholder="Username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <Field
                icon={<MailIcon />}
                type="email"
                placeholder={isLogin ? "Email" : "Email address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Field
                icon={<LockIcon />}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                trailing={
                  <button
                    onClick={() => setShowPassword((value) => !value)}
                    style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                }
              />
            </div>

            {isLogin && (
              <div style={{ textAlign: "right", marginTop: 12 }}>
                <button style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  color: "#2A2F8F",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: isLogin ? 14 : 20,
                minHeight: 54,
                border: "none",
                borderRadius: 16,
                background: loading ? "#A9AFEA" : "#202A95",
                color: "#FFFFFF",
                fontSize: 17,
                fontWeight: 800,
                cursor: loading ? "default" : "pointer",
                boxShadow: LIGHT_SURFACE_SHADOW,
              }}
            >
              {loading
                ? (isLogin ? "Signing in..." : "Creating account...")
                : (isLogin ? "Sign In" : "Create account & see results")}
            </button>

            {isLogin && (
              <>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  margin: "18px 0 14px",
                  color: "#A1A1AA",
                  fontSize: 14,
                }}>
                  <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                  <span>or continue with</span>
                  <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                </div>

                <button style={{
                  width: "100%",
                  minHeight: 50,
                  border: "none",
                  borderRadius: 15,
                  background: "#0B0B0F",
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: "pointer",
                }}>
                  <AppleIcon />
                  Continue with Apple
                </button>

                <button style={{
                  width: "100%",
                  minHeight: 50,
                  marginTop: 12,
                  borderRadius: 15,
                  border: `1px solid ${LIGHT_SURFACE_BORDER}`,
                  background: "#FFFFFF",
                  color: "#202124",
                  fontSize: 16,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: "pointer",
                  boxShadow: LIGHT_SURFACE_SHADOW,
                }}>
                  <GoogleIcon />
                  Continue with Google
                </button>
              </>
            )}

            <div style={{ textAlign: "center", marginTop: 24, fontSize: 15, color: "#8E8E99" }}>
              {isLogin ? "Don’t have an account? " : "Already have an account? "}
              <button
                onClick={() => switchMode(isLogin ? "signup" : "login")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  color: "#202A95",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>

            <button
              onClick={onStart}
              style={{
                width: "100%",
                marginTop: 20,
                minHeight: 50,
                borderRadius: 16,
                border: `1px solid ${LIGHT_SURFACE_BORDER}`,
                background: "#F9FAFB",
                color: "#4B5563",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: LIGHT_SURFACE_SHADOW,
              }}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
