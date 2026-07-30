import React, { useEffect, useState } from "react";
import { supabase } from "../supabase.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_REGEX = /^.{6,}$/;

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

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.75 12S6.5 6.75 12 6.75 21.25 12 21.25 12 17.5 17.25 12 17.25 2.75 12 2.75 12Z" stroke="#9CA3AF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="2.5" stroke="#9CA3AF" strokeWidth="1.7"/>
    </svg>
  );
}

function AuthField({ icon, type, placeholder, value, onChange, trailing }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      minHeight: 56,
      padding: "0 16px",
      borderRadius: 16,
      border: "1px solid #E7E7EC",
      background: "#FFFFFF",
      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
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

export default function SignupModal({ initialMode = "signup", onSignup, onDismiss, dismissible = true }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setMode(initialMode);
    setErr("");
  }, [initialMode]);

  const handleSubmit = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) { setErr("Email and password required."); return; }
    if (mode === "signup" && !cleanName) { setErr("Username is required."); return; }
    if (!EMAIL_REGEX.test(cleanEmail)) { setErr("Please enter a valid email address."); return; }
    if (!MIN_PASSWORD_REGEX.test(password)) { setErr("Password must be at least 6 characters."); return; }

    setLoading(true);
    setErr("");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { name: cleanName, username: cleanName } },
      });

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setLoading(false);
        onSignup({ id: data.user.id, email: data.user.email, name: cleanName });
      } else {
        setLoading(false);
        setErr("Check your email to confirm your account, then come back to log in.");
      }
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSignup({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || email,
    });
  };

  const isLogin = mode === "login";

  return (
    <>
      <div
        onClick={dismissible ? onDismiss : undefined}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(17, 24, 39, 0.38)",
          backdropFilter: "blur(10px)",
          zIndex: 50,
        }}
      />

      <div style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(92vw, 420px)",
        maxHeight: "calc(100vh - 32px)",
        overflowY: "auto",
        background: "#F9F9FB",
        borderRadius: 30,
        padding: "20px 18px 22px",
        boxShadow: "0 32px 90px rgba(15, 23, 42, 0.18)",
        zIndex: 51,
        animation: "authPop .26s ease-out",
      }}>
        <style>{`
          @keyframes authPop {
            from { transform: translate(-50%, calc(-50% + 16px)); opacity: 0; }
            to { transform: translate(-50%, -50%); opacity: 1; }
          }
        `}</style>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div style={{ width: 48, height: 5, borderRadius: 999, background: "#DBDDE5" }} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: 6,
          borderRadius: 18,
          background: "#EFF1F6",
          marginBottom: 24,
        }}>
          {[
            { id: "signup", label: "Sign Up" },
            { id: "login", label: "Sign In" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setMode(item.id); setErr(""); }}
              style={{
                border: "none",
                borderRadius: 14,
                padding: "11px 14px",
                background: mode === item.id ? "#FFFFFF" : "transparent",
                color: mode === item.id ? "#111111" : "#7B7B86",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: mode === item.id ? "0 8px 18px rgba(15, 23, 42, 0.08)" : "none",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 4px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 24, lineHeight: 1.15, fontWeight: 500, color: "#111111" }}>
            {isLogin ? "Welcome back" : "Your results are ready"}
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.6, color: "#000000", fontWeight: 400 }}>
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
              <AuthField
                icon={<UserIcon />}
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <AuthField
              icon={<MailIcon />}
              type="email"
              placeholder={isLogin ? "Email" : "Email address"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AuthField
              icon={<LockIcon />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              trailing={<EyeIcon />}
            />
          </div>

          {!isLogin ? (
            <p style={{ margin: "10px 4px 0", fontSize: 12, color: "#7B7B86", lineHeight: 1.5 }}>
              Use a valid email address and a password with at least 6 characters.
            </p>
          ) : null}

          {isLogin && (
            <div style={{ textAlign: "right", marginTop: 12 }}>
              <button style={{
                border: "none",
                background: "transparent",
                padding: 0,
                color: "#202A95",
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
              minHeight: 54,
              marginTop: isLogin ? 14 : 20,
              border: "none",
              borderRadius: 16,
              background: loading ? "#A9AFEA" : "#202A95",
              color: "#FFFFFF",
              fontSize: 17,
              fontWeight: 800,
              cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : "0 18px 32px rgba(32, 42, 149, 0.22)",
            }}
          >
            {loading
              ? (isLogin ? "Signing in..." : "Creating account...")
              : (isLogin ? "Sign In" : "Create account & see results")}
          </button>

          <p style={{ margin: "18px 6px 0", fontSize: 11, lineHeight: 1.6, textAlign: "center", color: "#999AA6" }}>
            By continuing, you agree to our
            {" "}
            <span style={{ color: "#5B63C7" }}>Terms of Service</span>
            {" "}
            and
            {" "}
            <span style={{ color: "#5B63C7" }}>Privacy Policy</span>
          </p>

          {dismissible ? (
            <button
              onClick={onDismiss}
              style={{
                width: "100%",
                minHeight: 48,
                marginTop: 14,
                borderRadius: 16,
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
                color: "#61616D",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Maybe later
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}
