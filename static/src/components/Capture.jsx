import React, { useState, useRef, useEffect, useCallback } from "react";
import { C, OzenWordmark, GlowBlob, GLOBAL_CSS } from "../brand.jsx";

const ANGLES = [
  { key: "front_top",    label: "Top angle",   hint: "Camera ABOVE eye level — tilt chin DOWN",  icon: "⬇", emoji: "☝️" },
  { key: "front_bottom", label: "Chin angle",  hint: "Camera BELOW chin — tilt chin UP",          icon: "⬆", emoji: "👇" },
  { key: "left_45",      label: "Left 45°",    hint: "Turn head LEFT until right ear disappears", icon: "↙", emoji: "↩️" },
  { key: "right_45",     label: "Right 45°",   hint: "Turn head RIGHT until left ear disappears", icon: "↘", emoji: "↪️" },
];

// Downscale canvas frame to base64 jpeg
function captureFrame(video) {
  const MAX = 768;
  let w = video.videoWidth  || 640;
  let h = video.videoHeight || 480;
  if (w > h && w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
  else if (h > MAX)     { w = Math.round(w * MAX / h); h = MAX; }
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  cv.getContext("2d").drawImage(video, 0, 0, w, h);
  return cv.toDataURL("image/jpeg", 0.85).split(",")[1];
}

export default function Capture({ answers, onComplete }) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const holdRef    = useRef(null);

  const [currentIdx, setCurrentIdx] = useState(0);   // which angle we're on
  const [shots, setShots]           = useState({});   // key → b64
  const [previews, setPreviews]     = useState({});   // key → data-url preview
  const [camReady, setCamReady]     = useState(false);
  const [camErr, setCamErr]         = useState("");
  const [countdown, setCountdown]   = useState(null); // 3…2…1 before auto-capture
  const [flash, setFlash]           = useState(false);

  const currentAngle = ANGLES[currentIdx];
  const allDone      = ANGLES.every((a) => shots[a.key]);

  // ── start camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCamErr("");
    setCamReady(false);
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",         // front camera on mobile
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCamReady(true);
      }
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setCamErr("Camera permission denied. Please allow camera access and reload.");
      } else if (err.name === "NotFoundError") {
        setCamErr("No camera found on this device.");
      } else {
        setCamErr(`Camera error: ${err.message}`);
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (holdRef.current)   clearTimeout(holdRef.current);
    };
  }, [startCamera]);

  // ── take a shot ───────────────────────────────────────────────────────────
  const takeShot = useCallback(() => {
    if (!videoRef.current || !camReady) return;
    const b64      = captureFrame(videoRef.current);
    const preview  = `data:image/jpeg;base64,${b64}`;
    const key      = currentAngle.key;

    // flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    setShots((s)    => ({ ...s, [key]: { b64, media: "image/jpeg" } }));
    setPreviews((p) => ({ ...p, [key]: preview }));

    // auto-advance after 600ms
    setTimeout(() => {
      if (currentIdx < ANGLES.length - 1) setCurrentIdx((i) => i + 1);
    }, 600);
  }, [camReady, currentAngle, currentIdx]);

  // 3-second countdown then auto-capture
  const startCountdown = useCallback(() => {
    if (countdown !== null) return;
    let n = 3;
    setCountdown(n);
    const iv = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(iv);
        setCountdown(null);
        takeShot();
      } else {
        setCountdown(n);
      }
    }, 1000);
  }, [countdown, takeShot]);

  const cancelCountdown = useCallback(() => {
    setCountdown(null);
  }, []);

  const retake = (key) => {
    const idx = ANGLES.findIndex((a) => a.key === key);
    setShots((s)    => { const n = { ...s }; delete n[key]; return n; });
    setPreviews((p) => { const n = { ...p }; delete n[key]; return n; });
    setCurrentIdx(idx);
  };

  // ── build and submit ──────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!allDone) return;
    // Stop camera before leaving
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    onComplete({ images: shots, answers });
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: "column", position: "relative" }}>
      <style>{GLOBAL_CSS + `
        .shutter-btn { -webkit-tap-highlight-color: transparent; }
        .shutter-btn:active { transform: scale(.93); }
      `}</style>
      <GlowBlob />

      <div style={{ maxWidth: 480, width: "100%", margin: "0 auto", padding: "20px 20px 36px", position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <OzenWordmark size={16} />
          <div style={{ fontSize: 12, color: C.muted }}>
            {Object.keys(shots).length} of 4 captured
          </div>
        </div>

        {/* angle strip */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {ANGLES.map((a, i) => {
            const done    = !!shots[a.key];
            const current = i === currentIdx && !allDone;
            return (
              <div key={a.key} onClick={() => done && retake(a.key)} style={{
                flex: 1, textAlign: "center", borderRadius: 10, padding: "8px 4px",
                background: done ? `${C.indigo}55` : current ? C.card : C.cardHi,
                border: `1.5px solid ${done ? C.indigoBright : current ? C.indigoBright + "88" : C.line}`,
                cursor: done ? "pointer" : "default",
                transition: "all .2s ease",
              }}>
                <div style={{ fontSize: 16 }}>{done ? "✓" : a.icon}</div>
                <div style={{ fontSize: 9, color: done ? C.indigoBright : current ? C.iceDim : C.muted, letterSpacing: 0.5, marginTop: 3 }}>
                  {a.label.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>

        {/* camera or error */}
        {camErr ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ fontSize: 36 }}>📷</div>
            <p style={{ fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 1.6 }}>{camErr}</p>
            <button onClick={startCamera} style={{ background: C.indigo, color: C.ice, border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* viewfinder */}
            <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "#000", aspectRatio: "3/4", marginBottom: 16 }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scaleX(-1)" }}
              />

              {/* face guide oval */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 300 400" preserveAspectRatio="none">
                {/* dim outside oval */}
                <defs>
                  <mask id="ovalMask">
                    <rect width="300" height="400" fill="white" />
                    <ellipse cx="150" cy="185" rx="90" ry="118" fill="black" />
                  </mask>
                </defs>
                <rect width="300" height="400" fill="rgba(0,0,0,0.38)" mask="url(#ovalMask)" />
                <ellipse cx="150" cy="185" rx="90" ry="118"
                  fill="none"
                  stroke={camReady ? C.indigoBright : C.line}
                  strokeWidth="2.5"
                  strokeDasharray={camReady ? "0" : "8 6"}
                  style={{ transition: "stroke .4s ease" }}
                />
              </svg>

              {/* flash overlay */}
              {flash && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.55)", pointerEvents: "none" }} />
              )}

              {/* hint text */}
              {!allDone && (
                <div style={{
                  position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
                  background: "rgba(22,24,29,.82)", backdropFilter: "blur(8px)",
                  borderRadius: 24, padding: "8px 16px", whiteSpace: "nowrap",
                }}>
                  <span style={{ fontSize: 13, color: C.iceDim }}>{currentAngle.hint}</span>
                </div>
              )}

              {/* thumbnail overlay for done angles */}
              {previews[currentAngle?.key] && !allDone && (
                <div style={{ position: "absolute", top: 12, right: 12, width: 52, height: 52, borderRadius: 10, overflow: "hidden", border: `2px solid ${C.indigoBright}` }}>
                  <img src={previews[currentAngle.key]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>

            {/* shutter / countdown / submit */}
            {!allDone ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                {/* shutter button */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
                  {countdown !== null ? (
                    <button onClick={cancelCountdown} className="shutter-btn" style={{
                      width: 80, height: 80, borderRadius: "50%",
                      background: C.line, border: `4px solid ${C.muted}`,
                      fontSize: 32, fontWeight: 700, fontFamily: "'Syne', sans-serif",
                      color: C.text, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {countdown}
                    </button>
                  ) : (
                    <>
                      {/* instant capture */}
                      <button onClick={takeShot} disabled={!camReady} className="shutter-btn" style={{
                        width: 80, height: 80, borderRadius: "50%",
                        background: camReady ? "#fff" : C.line,
                        border: `4px solid ${camReady ? C.indigoBright : C.muted}`,
                        cursor: camReady ? "pointer" : "not-allowed",
                        transition: "all .15s ease",
                        boxShadow: camReady ? `0 0 0 6px ${C.indigo}44` : "none",
                      }} aria-label="Take photo" />

                      {/* timer capture */}
                      <button onClick={startCountdown} disabled={!camReady} className="shutter-btn" style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: C.card, border: `1.5px solid ${C.line}`,
                        color: C.muted, fontSize: 11, letterSpacing: 0.5,
                        cursor: camReady ? "pointer" : "not-allowed",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                      }}>
                        <span style={{ fontSize: 16 }}>⏱</span>
                        <span style={{ fontSize: 9 }}>3s</span>
                      </button>
                    </>
                  )}
                </div>
                <p style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>
                  {camReady ? "Tap circle to capture instantly · or use timer" : "Starting camera…"}
                </p>
              </div>
            ) : (
              /* all 4 done — show thumbnails + submit */
              <div style={{ animation: "rise .5s ease forwards" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                  {ANGLES.map((a) => (
                    <div key={a.key} onClick={() => retake(a.key)} style={{ cursor: "pointer", borderRadius: 10, overflow: "hidden", border: `1.5px solid ${C.indigoBright}`, aspectRatio: "3/4", position: "relative" }}>
                      <img src={previews[a.key]} alt={a.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4, background: "linear-gradient(transparent 50%, rgba(0,0,0,.6))" }}>
                        <span style={{ fontSize: 8, color: C.ice, letterSpacing: 0.5 }}>{a.label.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginBottom: 14 }}>Tap any photo to retake</p>
                <button onClick={handleSubmit} style={{
                  width: "100%", background: C.indigo, color: C.ice,
                  border: "none", borderRadius: 14, padding: 16,
                  fontSize: 16, fontWeight: 600, cursor: "pointer",
                  boxShadow: `0 8px 28px ${C.indigo}55`,
                  fontFamily: "'Syne', sans-serif", letterSpacing: 0.5,
                }}>
                  Analyse my face →
                </button>
              </div>
            )}
          </>
        )}

        <p style={{ fontSize: 10, color: C.muted, textAlign: "center", marginTop: 18, lineHeight: 1.5 }}>
          Photos are processed instantly for AI analysis only. OZEN never stores images on our servers.
        </p>
      </div>
    </div>
  );
}
