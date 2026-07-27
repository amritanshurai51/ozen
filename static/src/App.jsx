import React, { useState, useEffect } from "react";
import Landing        from "./components/Landing.jsx";
import Disclaimer     from "./components/Disclaimer.jsx";
import Onboarding     from "./components/Onboarding.jsx";
import Capture        from "./components/Capture.jsx";
import Scanning       from "./components/Scanning.jsx";
import Results        from "./components/Results.jsx";
import SignupModal     from "./components/SignupModal.jsx";
import Dashboard      from "./components/Dashboard.jsx";
import { supabase }    from "./supabase.js";


const REQUIRE_SIGNUP = true;
const API_URL        = "/scan";

export default function App() {
  const [screen,      setScreen]      = useState("landing");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [captureData, setCaptureData] = useState(null);
  const [result,      setResult]      = useState(null);
  const [errMsg,      setErrMsg]      = useState("");
  const [showSignup,  setShowSignup]  = useState(false);
  const [user,        setUser]        = useState(null);
  const [authReady,   setAuthReady]   = useState(false);

  // ── check for existing session on load ────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setScreen("dashboard");
      }
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);



  const handleStart = () => {
    setScreen("onboarding");
  };

  const handleDisclaimerAccept = () => {
    if (captureData) {
      runAnalysis(captureData);
      return;
    }
    setScreen("onboarding");
  };

  const handleQuizDone = (answers) => {
    setQuizAnswers(answers);
    setScreen("capture");
  };

  const handleCaptureComplete = (data) => {
    setCaptureData(data);
    setScreen("disclaimer");
  };

  // After signup during analysis flow — run analysis immediately
  const handleSignupDone = (signedInUser) => {
    setUser(signedInUser);
    setShowSignup(false);
    runAnalysis(captureData);
  };

  // Dismissed signup 
  const handleSignupDismiss = () => {
    setShowSignup(false);
    runAnalysis(captureData);
  };

  // After login from landing page auth button — go to dashboard
  const handleAuthDone = (signedInUser) => {
    setUser(signedInUser);
    setScreen("dashboard");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen("landing");
    setQuizAnswers({});
    setCaptureData(null);
    setResult(null);
    setErrMsg("");
    setShowSignup(false);
  };

  // View a past scan from dashboard
  const handleViewScan = (fullResult) => {
    setResult(fullResult);
    setScreen("results");
  };

  // New scan from dashboard — skip disclaimer, go straight to quiz
  const handleNewScan = () => {
    setQuizAnswers({});
    setCaptureData(null);
    setResult(null);
    setScreen("onboarding");
  };

  // Reset — logged-in users go to dashboard, guests go to landing
  const reset = () => {
    setScreen(user ? "dashboard" : "landing");
    setQuizAnswers({});
    setCaptureData(null);
    setResult(null);
    setErrMsg("");
    setShowSignup(false);
  };


function mapAnswersToForm(answers) {
  // Sleep hours from bed/wake times
  const bedParts  = answers.sleep?.bed?.split(":").map(Number)  || [23, 0];
  const wakeParts = answers.sleep?.wake?.split(":").map(Number) || [7, 0];
  const bedMins   = bedParts[0] * 60 + bedParts[1];
  const wakeMins  = wakeParts[0] * 60 + wakeParts[1];
  let sleepHours  = (wakeMins - bedMins) / 60;
  if (sleepHours < 0) sleepHours += 24;

  const genderMap = { "Male": "m", "Female": "f" };
  const uaeCities = ["Abu Dhabi", "Dubai", "Sharjah", "Doha", "Riyadh", "Jeddah"];
  const currency  = uaeCities.includes(answers.climate) ? "aed" : "inr";

  return {
    // identity
    age:                  parseInt(answers.identity?.age) || 25,
    gender:               genderMap[answers.identity?.gender] || "m",
    ethnicity:            answers.identity?.ethnicity || "Indian / South Asian",
    city:                 answers.climate || "Dubai",
    // body
    body_type:            answers.body?.type || "Average",
    height:               parseFloat(answers.body?.height) || 170,
    weight:               parseFloat(answers.body?.weight) || 70,
    // skincare — Baumann axes from routine step
    skincare_routine:     answers.routine?.routine || "None",
    skin_products:        (answers.routine?.products || []).join(", ") || null,
    oil_dry:              answers.routine?.oilDry || "oily",
    sensitive_resistant:  answers.routine?.sensitiveResistant || "resistant",
    // lifestyle
    water_intake:         answers.water || "3–5 glasses",
    spf_habit:            answers.spf?.habit || "Sometimes",
    spf_level:            answers.spf?.level || null,
    // hair
    hair_type:            answers.hairType || "Straight",
    hair_texture:         answers.hairTexture || "Medium",
    // budget & fitness
    monthly_budget:       answers.budget || "AED 200–500",
    currency:             currency,
    gym_fitness:          answers.fitness || "Not training",
    // sleep
    sleep_bed:            answers.sleep?.bed || "23:00",
    sleep_wake:           answers.sleep?.wake || "07:00",
    sleep_hours:          Math.round(sleepHours * 10) / 10,
  };
}

 
  async function runAnalysis(data) {
    setScreen("scanning");
    setErrMsg("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const formData = new FormData();
      
      const flatAnswers = mapAnswersToForm(data.answers || quizAnswers);
      formData.append("quiz_data", JSON.stringify(flatAnswers));
      
      for (const [angle, img] of Object.entries(data.images)) {
        const blob = await fetch(`data:${img.media};base64,${img.b64}`).then(r => r.blob());
        formData.append("images", blob, `${angle}.jpg`);
      }

      const resp = await fetch(API_URL, {
        method:  "POST",
        headers: {...(token ? { "Authorization": `Bearer ${token}` } : {}),"X-Requested-With": "XMLHttpRequest",},
        body:    formData,
      });

      const json = await resp.json();
      if (!resp.ok || json.error) {
        setErrMsg(json.message || json.error || "Analysis failed. Please retake your photos in good lighting.");
        setScreen("error");
        return;
      }

      setResult(json.result || json);
      setScreen("results");
    } catch (e) {
      setErrMsg("Network error — check your connection and try again.");
      setScreen("error");
    }
  }

  // don't render until session check is done 
  if (!authReady) return null;

  return (
    <>
      {screen === "landing"    && (
        <Landing
          onStart={handleStart}
          onAuthSuccess={handleAuthDone}
        />
      )}
      {screen === "disclaimer" && (
        <Disclaimer
          onAccept={handleDisclaimerAccept}
          onBack={() => setScreen(captureData ? "capture" : "landing")}
        />
      )}
      {screen === "onboarding" && (
        <Onboarding
          onComplete={handleQuizDone}
          onBack={() => setScreen(user ? "dashboard" : "landing")}
        />
      )}
      {screen === "capture"    && (
        <Capture
          answers={quizAnswers}
          onComplete={handleCaptureComplete}
          onBack={() => setScreen("onboarding")}
        />
      )}
      {screen === "scanning"   && <Scanning />}
      {screen === "results"    && (
        <Results
          result={result}
          onReset={reset}
          onDashboard={user ? () => setScreen("dashboard") : null}
        />
      )}
      {screen === "dashboard"  && (
        <Dashboard
          user={user}
          onViewScan={handleViewScan}
          onNewScan={handleNewScan}
          onSignOut={handleSignOut}
        />
      )}

      {screen === "error" && (
        <div style={{
          minHeight: "100vh", background: "#16181D", color: "#EEF1F6",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 20, padding: 24, textAlign: "center",
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <p style={{ fontSize: 15, color: "#AEB8CE", lineHeight: 1.6, maxWidth: 320 }}>{errMsg}</p>
          <button onClick={() => setScreen("capture")} style={{
            background: "#2A2F8F", color: "#DCE3F0", border: "none",
            borderRadius: 12, padding: "13px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}>Retake photos</button>
          <button onClick={reset} style={{
            background: "none", color: "#7B8294", border: "1px solid #2C313B",
            borderRadius: 12, padding: "11px 24px", fontSize: 14, cursor: "pointer",
          }}>Start over</button>
        </div>
      )}

      {/* signup gate — after photos if not logged in */}
      {showSignup && (
        <SignupModal
          initialMode="signup"
          onSignup={handleSignupDone}
          onDismiss={handleSignupDismiss}
        />
      )}
    </>
  );
}
