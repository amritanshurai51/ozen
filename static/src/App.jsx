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
import OzenResult from "../../image/Logo blue transparent 8.svg";
import { COUNTRY_CURRENCIES } from "./locationData.js";


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
  const [scansRemaining, setScansRemaining] = useState(null);
  const [buyingScans, setBuyingScans] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);

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

  useEffect(() => {
    if (!user) {
      setScansRemaining(null);
      setShowBuyButton(false);
      return;
    }
    refreshScanStatus();
  }, [user]);



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
    if (REQUIRE_SIGNUP && !user) {
      setShowSignup(true);
      return;
    }
    setScreen("disclaimer");
  };

  // After auth during analysis flow — continue with the saved journey data
  const handleSignupDone = (signedInUser) => {
    setUser(signedInUser);
    setShowSignup(false);
    setScreen("disclaimer");
  };

  // If the auth gate is ever closed, send the user back to capture.
  const handleSignupDismiss = () => {
    setShowSignup(false);
    setScreen("capture");
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
    setScansRemaining(null);
    setShowBuyButton(false);
  };

  // View a past scan from dashboard
  const handleViewScan = (fullResult) => {
    setResult(fullResult);
    setScreen("results");
  };

  // New scan from dashboard — skip disclaimer, go straight to quiz
  const handleNewScan = () => {
    if (user && scansRemaining !== null && scansRemaining <= 0) {
      setShowBuyButton(true);
      return;
    }
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

  async function getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async function refreshScanStatus() {
    if (!user) return;
    try {
      const token = await getAccessToken();
      if (!token) return;

      const resp = await fetch("/payments/scan-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();
      if (!resp.ok) return;

      const remaining = Number(json.scans_remaining ?? 0);
      setScansRemaining(remaining);
      setShowBuyButton(remaining <= 0);
    } catch {
      // Keep the scan flow usable even if the balance check fails.
    }
  }

  async function handleBuyScans() {
    if (!user || buyingScans) return;

    try {
      setBuyingScans(true);
      const token = await getAccessToken();
      if (!token) return;

      const resp = await fetch("/payments/checkout-url", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();
      if (!resp.ok || !json.url) {
        setErrMsg(json.error || "Could not start checkout.");
        setScreen("error");
        return;
      }

      window.location.href = json.url;
    } catch {
      setErrMsg("Could not start checkout.");
      setScreen("error");
    } finally {
      setBuyingScans(false);
    }
  }


function mapAnswersToForm(answers) {
  // Sleep hours from bed/wake times
  const bedParts  = answers.sleep?.bed?.split(":").map(Number)  || [23, 0];
  const wakeParts = answers.sleep?.wake?.split(":").map(Number) || [7, 0];
  const bedMins   = bedParts[0] * 60 + bedParts[1];
  const wakeMins  = wakeParts[0] * 60 + wakeParts[1];
  let sleepHours  = (wakeMins - bedMins) / 60;
  if (sleepHours < 0) sleepHours += 24;

  const genderMap = { "Male": "m", "Female": "f" };
  const countryCode = answers.locationCountryCode || "AE";
  const currencyCode = COUNTRY_CURRENCIES[countryCode]?.code || "AED";

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
    monthly_budget:       answers.budget || `Under ${currencyCode} 200`,
    currency:             currencyCode.toLowerCase(),
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
    setShowBuyButton(false);
    try {
      const token = await getAccessToken();

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
      if (resp.status === 402) {
        setScansRemaining(0);
        setShowBuyButton(true);
        setErrMsg(json.error || "No scans remaining. Buy 2 more scans to continue.");
        setScreen("error");
        return;
      }

      if (!resp.ok || json.error) {
        setErrMsg(json.message || json.error || "Analysis failed. Please retake your photos in good lighting.");
        setScreen("error");
        return;
      }

      setResult(json.result || json);
      if (user) {
        await refreshScanStatus();
      }
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
          scansRemaining={scansRemaining}
          showBuyButton={showBuyButton}
          onBuyScans={handleBuyScans}
          buyingScans={buyingScans}
          onSignOut={handleSignOut}
        />
      )}

      {screen === "error" && (
        <div style={{
          minHeight: "100vh",
          background: "#F6F7FB",
          color: "#111111",
          padding: "24px 16px 40px",
        }}>
          <div style={{
            maxWidth: 420,
            minHeight: "calc(100vh - 64px)",
            margin: "0 auto",
            background: "#FFFFFF",
            padding: "28px 22px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}>
            <img src={OzenResult} alt="Ozen" style={{ height: 52, width: 52, marginBottom: 24 }} />
            <div style={{
              width: "100%",
              maxWidth: 240,
              height: 6,
              background: "#E7EAF2",
              borderRadius: 999,
              overflow: "hidden",
              marginBottom: 20,
            }}>
              <div style={{
                width: user && showBuyButton ? "20%" : "34%",
                height: "100%",
                background: "linear-gradient(90deg, #7FA8FF 0%, #202A95 100%)",
                borderRadius: 999,
              }} />
            </div>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
            <h2 style={{
              fontSize: 21,
              lineHeight: 1.2,
              fontWeight: 600,
              color: "#17181F",
              margin: "0 0 10px",
            }}>
              Something needs your attention
            </h2>
            <p style={{
              fontSize: 14,
              color: "#5F657A",
              lineHeight: 1.6,
              maxWidth: 280,
              margin: "0 0 28px",
            }}>
              {errMsg}
            </p>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              {user && showBuyButton && (
                <button onClick={handleBuyScans} style={{
                  width: "100%",
                  background: "#7FA8FF",
                  color: "#0F172A",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 18px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: buyingScans ? "wait" : "pointer",
                  opacity: buyingScans ? 0.7 : 1,
                }}>
                  {buyingScans ? "Redirecting..." : "Buy 2 More Scans"}
                </button>
              )}
              <button onClick={() => setScreen("capture")} style={{
                width: "100%",
                background: "#202A95",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 14,
                padding: "14px 18px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}>Retake photos</button>
              <button onClick={reset} style={{
                width: "100%",
                background: "#FFFFFF",
                color: "#6B7285",
                border: "1px solid #D9DFEB",
                borderRadius: 14,
                padding: "14px 18px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}>Start over</button>
            </div>
          </div>
        </div>
      )}

      {/* signup gate — after photos if not logged in */}
      {showSignup && (
        <SignupModal
          initialMode="login"
          onSignup={handleSignupDone}
          onDismiss={handleSignupDismiss}
          dismissible={false}
        />
      )}
    </>
  );
}
