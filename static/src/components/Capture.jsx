import React, { useState, useRef, useEffect, useCallback } from "react";
import { GLOBAL_CSS, LIGHT_SURFACE_BORDER, LIGHT_SURFACE_SHADOW } from "../brand.jsx";
import faceAreaGuide from "../assets/face-area-guide.svg";

const ANGLES = [
  { key: "front_top", label: "Top angle", hint: "Camera ABOVE eye level — tilt chin DOWN", icon: "↓" },
  { key: "front_bottom", label: "Chin angle", hint: "Camera BELOW chin — tilt chin UP", icon: "↑" },
  { key: "left_45", label: "Left 45°", hint: "Turn head to your LEFT — right ear disappears", icon: "↙" },
  { key: "right_45", label: "Right 45°", hint: "Turn head to your RIGHT — left ear disappears", icon: "↘" },
];

const CAMERA_FRAME_HEIGHT = "clamp(280px, 44vh, 370px)";

function captureFrame(video) {
  const MAX = 768;
  let w = video.videoWidth || 640;
  let h = video.videoHeight || 480;
  if (w > h && w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
  else if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; }
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  cv.getContext("2d").drawImage(video, 0, 0, w, h);
  return cv.toDataURL("image/jpeg", 0.85).split(",")[1];
}

function ProgressBar() {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <div style={{ flex: 0.38, height: 4, background: "#3344C9", borderRadius: 999 }} />
        <div style={{ flex: 1.35, height: 4, background: "#3344C9", borderRadius: 999 }} />
        <div style={{ flex: 0.38, height: 4, background: "#D9DDE7", borderRadius: 999 }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 10, color: "#8C8FA1" }}>Step 7 of 8</div>
    </div>
  );
}

function AngleTab({ angle, active, done, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        minHeight: 56,
        borderRadius: 14,
        border: `1px solid ${active || done ? "#7988FF" : LIGHT_SURFACE_BORDER}`,
        background: active ? "#F4F6FF" : "#FFFFFF",
        color: "#20244A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        boxShadow: LIGHT_SURFACE_SHADOW,
        cursor: done ? "pointer" : "default",
      }}
    >
      <span style={{ fontSize: 16, color: active || done ? "#3344C9" : "#64748B" }}>{done ? "✓" : angle.icon}</span>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: active || done ? "#3344C9" : "#6F7487" }}>
        {angle.label}
      </span>
    </button>
  );
}

function PrivacyCard() {
  return (
    <div style={{
      marginTop: 22,
      borderRadius: 18,
      border: `1px solid ${LIGHT_SURFACE_BORDER}`,
      background: "#FFFFFF",
      boxShadow: LIGHT_SURFACE_SHADOW,
      padding: "16px 14px",
      display: "flex",
      gap: 12,
      alignItems: "center",
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "#EEF1FF",
        color: "#3344C9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        flexShrink: 0,
      }}>
        🛡
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2344", marginBottom: 4 }}>Your privacy is our priority</div>
        <div style={{ fontSize: 12, lineHeight: 1.45, color: "#7A8092" }}>
          Photos are processed instantly for AI analysis only. OZEN never stores images on our servers.
        </div>
      </div>
      <div style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#3344C9",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        flexShrink: 0,
      }}>
        ✓
      </div>
    </div>
  );
}

function ViewfinderCorners() {
  const corner = {
    position: "absolute",
    width: 18,
    height: 18,
    borderColor: "#4656D8",
    borderStyle: "solid",
    borderWidth: 0,
  };

  return (
    <>
      <div style={{ ...corner, top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 10 }} />
      <div style={{ ...corner, top: 10, right: 10, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 10 }} />
      <div style={{ ...corner, bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 10 }} />
      <div style={{ ...corner, bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 10 }} />
    </>
  );
}

export default function Capture({ answers, onComplete, onBack }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [shots, setShots] = useState({});
  const [previews, setPreviews] = useState({});
  const [camReady, setCamReady] = useState(false);
  const [camErr, setCamErr] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [countdownId, setCountdownId] = useState(null);
  const [flash, setFlash] = useState(false);

  const currentAngle = ANGLES[currentIdx];
  const allDone = ANGLES.every((angle) => shots[angle.key]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCamErr("");
    setCamReady(false);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().catch(() => {});
          setCamReady(true);
        };
        video.oncanplay = () => setCamReady(true);
        video.onloadeddata = () => setCamReady(true);
      }
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setCamErr("We need camera access. To capture your photo, please allow camera access and reload.");
      } else if (err.name === "NotFoundError") {
        setCamErr("No camera found on this device.");
      } else {
        setCamErr(`Camera error: ${err.message}`);
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (countdownId) window.clearInterval(countdownId);
    };
  }, [startCamera, stopCamera, countdownId]);

  const takeShot = useCallback(() => {
    if (!videoRef.current || !camReady) return;
    const b64 = captureFrame(videoRef.current);
    const preview = `data:image/jpeg;base64,${b64}`;
    const key = currentAngle.key;

    setFlash(true);
    window.setTimeout(() => setFlash(false), 180);
    setShots((current) => ({ ...current, [key]: { b64, media: "image/jpeg" } }));
    setPreviews((current) => ({ ...current, [key]: preview }));

    window.setTimeout(() => {
      if (currentIdx < ANGLES.length - 1) setCurrentIdx((idx) => idx + 1);
    }, 500);
  }, [camReady, currentAngle.key, currentIdx]);

  const startCountdown = useCallback(() => {
    if (countdown !== null) return;
    let next = 3;
    setCountdown(next);
    const id = window.setInterval(() => {
      next -= 1;
      if (next <= 0) {
        window.clearInterval(id);
        setCountdownId(null);
        setCountdown(null);
        takeShot();
      } else {
        setCountdown(next);
      }
    }, 1000);
    setCountdownId(id);
  }, [countdown, takeShot]);

  const cancelCountdown = useCallback(() => {
    if (countdownId) window.clearInterval(countdownId);
    setCountdownId(null);
    setCountdown(null);
  }, [countdownId]);

  const retake = (key) => {
    const idx = ANGLES.findIndex((angle) => angle.key === key);
    setShots((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setPreviews((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setCurrentIdx(idx);
  };

  const handleSubmit = () => {
    if (!allDone) return;
    stopCamera();
    onComplete({ images: shots, answers });
  };

  const guideText = currentAngle?.hint || "";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #F7F7FA 0%, #F2F3F7 100%)", color: "#111111" }}>
      <style>{GLOBAL_CSS + `
        .camera-btn { -webkit-tap-highlight-color: transparent; }
        .camera-btn:active { transform: scale(.96); }
        .capture-video::-webkit-media-controls { display:none !important; }
      `}</style>

      <div style={{ maxWidth: 420, minHeight: "100vh", margin: "0 auto", background: "#FFFFFF", padding: "26px 18px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          {onBack ? (
            <button onClick={onBack} style={{ border: "none", background: "transparent", width: 28, height: 28, padding: 0, fontSize: 24, cursor: "pointer", color: "#111111" }}>‹</button>
          ) : (
            <div style={{ width: 28 }} />
          )}
          <ProgressBar />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {ANGLES.map((angle, idx) => {
            const done = !!shots[angle.key];
            const active = !allDone && idx === currentIdx;
            return (
              <AngleTab
                key={angle.key}
                angle={angle}
                active={active}
                done={done}
                onClick={() => done && retake(angle.key)}
              />
            );
          })}
        </div>

        {camErr ? (
          <>
            <div style={{
              position: "relative",
              minHeight: 320,
              borderRadius: 22,
              background: "linear-gradient(180deg, #F7F8FF 0%, #F4F6FF 100%)",
              border: `1px solid ${LIGHT_SURFACE_BORDER}`,
              boxShadow: LIGHT_SURFACE_SHADOW,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}>
              <ViewfinderCorners />
              <div style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#EEF1FF",
                color: "#3344C9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                boxShadow: "0 0 36px rgba(51, 68, 201, 0.18)",
                marginBottom: 22,
              }}>
                📷
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.05, color: "#20244A", marginBottom: 12 }}>We need camera access</div>
              <div style={{ maxWidth: 240, fontSize: 15, lineHeight: 1.6, color: "#7A8092" }}>
                To capture your photo, please allow camera access and reload.
              </div>
            </div>

            <button
              onClick={startCamera}
              className="camera-btn"
              style={{
                width: "100%",
                minHeight: 52,
                marginTop: 18,
                border: "none",
                borderRadius: 16,
                background: "#3344C9",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 16px 28px rgba(51, 68, 201, 0.22)",
              }}
            >
              ↻ Try again
            </button>
            <PrivacyCard />
          </>
        ) : (
          <>
            <div style={{
              position: "relative",
              borderRadius: 22,
              overflow: "hidden",
              background: camReady ? "#D8DBE8" : "linear-gradient(180deg, #E8EBF6 0%, #D7DBE8 100%)",
              height: CAMERA_FRAME_HEIGHT,
              marginBottom: 16,
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onCanPlay={() => setCamReady(true)}
                onLoadedData={() => setCamReady(true)}
                className="capture-video"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transform: "scaleX(-1)",
                  filter: camReady ? "saturate(.75) contrast(.92)" : "opacity(0)",
                  background: "#D8DBE8",
                }}
              />

              {!camReady && (
                <img
                  src={faceAreaGuide}
                  alt="Camera guide"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    filter: "grayscale(1) contrast(.95) opacity(.72)",
                  }}
                />
              )}

              <ViewfinderCorners />

              <div style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 106,
                height: 150,
                border: "1.5px dashed rgba(70, 86, 216, 0.9)",
                background: "rgba(70, 86, 216, 0.06)",
              }} />

              {!camErr && (
                <div style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 14,
                  transform: "translateX(-50%)",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.88)",
                  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
                  padding: "7px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  maxWidth: "calc(100% - 24px)",
                }}>
                  <span style={{ fontSize: 12, color: "#8C8FA1" }}>ⓘ</span>
                  <span style={{ fontSize: 11, color: "#556070", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {guideText}
                  </span>
                </div>
              )}

              {flash ? <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.42)" }} /> : null}
            </div>

            {!allDone ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
                  {countdown !== null ? (
                    <button
                      onClick={cancelCountdown}
                      className="camera-btn"
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: "50%",
                        border: "2px solid #3344C9",
                        background: "#FFFFFF",
                        color: "#3344C9",
                        fontSize: 26,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {countdown}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={takeShot}
                        disabled={!camReady}
                        className="camera-btn"
                        style={{
                          width: 68,
                          height: 68,
                          borderRadius: "50%",
                          border: "2px solid #3344C9",
                          background: "#FFFFFF",
                          boxShadow: "0 12px 24px rgba(51, 68, 201, 0.10)",
                          cursor: camReady ? "pointer" : "not-allowed",
                        }}
                        aria-label="Take photo"
                      />
                      <button
                        onClick={startCountdown}
                        disabled={!camReady}
                        className="camera-btn"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: "1px solid #D9DDE7",
                          background: "#FFFFFF",
                          color: "#8C8FA1",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 8,
                          cursor: camReady ? "pointer" : "not-allowed",
                        }}
                      >
                        <span style={{ fontSize: 12, lineHeight: 1 }}>⏱</span>
                        <span>3s</span>
                      </button>
                    </>
                  )}
                </div>

                <div style={{ textAlign: "center", fontSize: 13, color: "#8C8FA1", marginTop: 14 }}>
                  {camReady ? "Tap the circle to capture" : "Starting camera..."}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
                  {ANGLES.map((angle) => (
                    <button
                      key={angle.key}
                      onClick={() => retake(angle.key)}
                      style={{
                        border: "1px solid #7988FF",
                        borderRadius: 12,
                        overflow: "hidden",
                        padding: 0,
                        background: "#FFFFFF",
                        aspectRatio: "3/4",
                        cursor: "pointer",
                      }}
                    >
                      <img src={previews[angle.key]} alt={angle.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "#8C8FA1", textAlign: "center", marginBottom: 14 }}>Tap any photo to retake</div>
                <button
                  onClick={handleSubmit}
                  className="camera-btn"
                  style={{
                    width: "100%",
                    minHeight: 52,
                    border: "none",
                    borderRadius: 16,
                    background: "#3344C9",
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 16px 28px rgba(51, 68, 201, 0.22)",
                  }}
                >
                  Continue to analyse →
                </button>
              </>
            )}

            <PrivacyCard />
          </>
        )}
      </div>
    </div>
  );
}
