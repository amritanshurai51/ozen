import React, { useEffect, useState } from "react";
import loaderGif from "../assets/loader ozen.gif";

const STAGES = [
  "Detecting faces across all four angles",
  "Triangulating jaw & forehead geometry",
  "Measuring symmetry and proportions",
  "Calibrating to ethnic reference norms",
  "Scoring all parameters",
  "Building your 30-day protocol",
];

export default function Scanning() {
  const [pct, setPct] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [gifTick, setGifTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setPct((p) => {
        if (p >= 94) return p;
        const remaining = 80 - p;
        const increment = Math.max(0.8, remaining * 0.18);
        return Math.min(80, p + increment);
      });
    }, 120);

    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setStageIdx(
      Math.min(Math.floor((pct / 94) * STAGES.length), STAGES.length - 1)
    );
  }, [pct]);

  useEffect(() => {
    const gifRefresh = setInterval(() => {
      setGifTick((tick) => tick + 1);
    }, 4500);

    return () => clearInterval(gifRefresh);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          key={gifTick}
          src={loaderGif}
          alt="Scanning loader"
          style={{
            width: 86,
            height: 86,
            objectFit: "contain",
            marginBottom: 22,
            animation: "loaderNudge 4.5s linear infinite",
          }}
        />

        <div style={{ width: "100%", maxWidth: 220 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 600,
              color: "#17181f",
            }}
          >
            <span>Analysing</span>
            <span>{Math.round(pct)}%</span>
          </div>

          <div
            style={{
              height: 6,
              borderRadius: 999,
              background: "#dedfe5",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                borderRadius: 999,
                background: "#2a31ad",
                transition: "width .6s cubic-bezier(.22,1,.36,1)",
              }}
            />
          </div>
        </div>

        <p
          key={stageIdx}
          style={{
            margin: "16px 0 0",
            fontSize: 11,
            fontWeight: 600,
            color: "#17181f",
            textAlign: "center",
          }}
        >
          {STAGES[stageIdx]}...
        </p>
      </div>

      <style>{`
        @keyframes loaderNudge {
          0% { transform: rotate(0deg); }
          85% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
