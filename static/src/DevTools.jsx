// ============================================================================
// OZEN — Dev Test Helpers
// Remove the import in App.jsx before sharing with users.
// ============================================================================
import { useEffect } from "react";

const SAMPLE_ANSWERS = {
  identity: { age: "26", gender: "Male", ethnicity: "Indian / South Asian" },
  climate:  "Dubai",
  goal:     "General glow-up",
  routine:  { routine: "Basic cleanser only", issues: ["Oiliness"] },
  body:     { type: "Average", height: "175" },
  style:    ["Minimal / Clean", "Old Money"],
  budget:   "AED 200 – 500",
  fitness:  "3–4× per week",
  sleep:    { bed: "23:30", wake: "07:00" },
};

// Replace the entire BLANK constant and MOCK_IMAGES with this:

async function loadSampleImage() {
  const resp = await fetch("/sample.jpg");
  const blob = await resp.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      b64: reader.result.split(",")[1],
      media: "image/jpeg",
    });
    reader.readAsDataURL(blob);
  });
}

export function useDevTools(setScreen, setQuizAnswers, setCaptureData, runAnalysis) {
  useEffect(() => {
    window.__ozen = {
      // Go to camera screen with quiz already filled — then take real photos
      skipToCapture: () => {
        setQuizAnswers(SAMPLE_ANSWERS);
        setScreen("capture");
        console.log("✓ On capture screen — take your 4 photos then hit Analyse");
      },

      skipToAnalyse: async () => {
            console.log("Loading sample.jpg...");
            const img = await loadSampleImage();
            const data = {
                images: {
                front_top:    img,
                front_bottom: img,
                left_45:      img,
                right_45:     img,
                },
                answers: SAMPLE_ANSWERS,
            };
            setCaptureData(data);
            setQuizAnswers(SAMPLE_ANSWERS);
            runAnalysis(data);
            console.log("✓ Firing analysis with sample.jpg...");
            },
    };

    console.log(
      "%c OZEN Dev Tools ",
      "background:#2A2F8F;color:#DCE3F0;padding:4px 12px;border-radius:4px;font-weight:700;font-size:13px",
      "\n\n  window.__ozen.skipToCapture()  →  jump to camera with quiz pre-filled" +
      "\n  window.__ozen.skipToAnalyse()  →  skip straight to API call\n"
    );

    return () => { delete window.__ozen; };
  }, []);
}