// // import React, { useState } from "react";
// // import Landing        from "./components/Landing.jsx";
// // import Disclaimer     from "./components/Disclaimer.jsx";
// // import Onboarding     from "./components/Onboarding.jsx";
// // import Capture        from "./components/Capture.jsx";
// // import Scanning       from "./components/Scanning.jsx";
// // import Results        from "./components/Results.jsx";
// // import SignupModal     from "./components/SignupModal.jsx";
// // import { useDevTools } from "./DevTools.jsx";  // ← remove before sharing with users
// // import TestPage        from "./TestPage.jsx";  // ← remove before sharing with users

// // // ============================================================================
// // // OZEN — App shell
// // //
// // // SCREEN FLOW:
// // //   landing → disclaimer → onboarding → capture → [signup] → scanning → results
// // //
// // // TESTING WITHOUT SIGNUP:  set REQUIRE_SIGNUP = false
// // // SKIP TO CAMERA:          in console → window.__ozen.skipToCapture()
// // // SKIP TO ANALYSE:         in console → window.__ozen.skipToAnalyse()
// // // ============================================================================

// // const REQUIRE_SIGNUP = false; // ← false while testing

// // const API_URL = "/scan";

// // export default function App() {
// //   const [screen,      setScreen]      = useState("landing");
// //   const [quizAnswers, setQuizAnswers] = useState({});
// //   const [captureData, setCaptureData] = useState(null);
// //   const [result,      setResult]      = useState(null);
// //   const [errMsg,      setErrMsg]      = useState("");
// //   const [showSignup,  setShowSignup]  = useState(false);
// //   const [showAuth, setShowAuth] = useState(false);

// //   // ── dev tools (comment out the line below before sharing) ─────────────────
// //   useDevTools(setScreen, setQuizAnswers, setCaptureData, runAnalysis);

// //   // ── flow handlers ──────────────────────────────────────────────────────────
// //   const handleStart             = () => setScreen("disclaimer");
// //   const handleDisclaimerAccept  = () => setScreen("onboarding");
// //   const handleQuizDone          = (answers) => { setQuizAnswers(answers); setScreen("capture"); };

// //   const handleCaptureComplete = (data) => {
// //     setCaptureData(data);
// //     if (REQUIRE_SIGNUP) { setShowSignup(true); }
// //     else { runAnalysis(data); }
// //   };

// //   const handleSignupDone    = ()  => { setShowSignup(false); runAnalysis(captureData); };
// //   const handleSignupDismiss = ()  => { setShowSignup(false); runAnalysis(captureData); };

// //   async function runAnalysis(data) {
// //     setScreen("scanning");
// //     setErrMsg("");
// //     try {
// //       const resp = await fetch(API_URL, {
// //         method:  "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body:    JSON.stringify({ images: data.images, answers: data.answers || quizAnswers }),
// //       });
// //       const json = await resp.json();
// //       if (!resp.ok || json.error) {
// //         setErrMsg(json.message || "Analysis failed. Please retake your photos in good lighting.");
// //         setScreen("error");
// //         return;
// //       }
// //       setResult(json.result);
// //       setScreen("results");
// //     } catch (e) {
// //       setErrMsg("Network error — check your connection and try again.");
// //       setScreen("error");
// //     }
// //   }

// //   const reset = () => {
// //     setScreen("landing");
// //     setQuizAnswers({});
// //     setCaptureData(null);
// //     setResult(null);
// //     setErrMsg("");
// //     setShowSignup(false);
// //   };

// //   // Show TestPage at localhost:8000?test
// //   if (window.location.search.includes("test")) return <TestPage />;

// //   return (
// //     <>
// //       {screen === "disclaimer" && <Disclaimer onAccept={handleDisclaimerAccept} onBack={() => setScreen("landing")} />}
// //       {screen === "onboarding" && <Onboarding onComplete={handleQuizDone} />}
// //       {screen === "capture"    && <Capture    answers={quizAnswers} onComplete={handleCaptureComplete} />}
// //       {screen === "scanning"   && <Scanning />}
// //       {screen === "results"    && <Results    result={result} onReset={reset} />}
// //       {screen === "landing" && (
// //           <Landing 
// //             onStart={handleStart} 
// //             onAuthClick={() => setShowAuth(true)} 
// //           />
// //         )}

// //       {screen === "error" && (
// //         <div style={{ minHeight: "100vh", background: "#16181D", color: "#EEF1F6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 24, textAlign: "center" }}>
// //           <div style={{ fontSize: 40 }}>⚠️</div>
// //           <p style={{ fontSize: 15, color: "#AEB8CE", lineHeight: 1.6, maxWidth: 320 }}>{errMsg}</p>
// //           <button onClick={() => setScreen("capture")} style={{ background: "#2A2F8F", color: "#DCE3F0", border: "none", borderRadius: 12, padding: "13px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Retake photos</button>
// //           <button onClick={reset} style={{ background: "none", color: "#7B8294", border: "1px solid #2C313B", borderRadius: 12, padding: "11px 24px", fontSize: 14, cursor: "pointer" }}>Start over</button>
// //         </div>
// //       )}

// //       {showAuth && (
// //   <SignupModal
// //     onSignup={(user) => {
// //       setShowAuth(false);
// //       console.log("Signed up:", user);
// //       // later: store user in state, show "welcome back" etc.
// //     }}
// //     onDismiss={() => setShowAuth(false)}
// //   />
// // )}
// //     </>
// //   );
// // }


// import React, { useState, useEffect } from "react";
// import Landing        from "./components/Landing.jsx";
// import Disclaimer     from "./components/Disclaimer.jsx";
// import Onboarding     from "./components/Onboarding.jsx";
// import Capture        from "./components/Capture.jsx";
// import Scanning       from "./components/Scanning.jsx";
// import Results        from "./components/Results.jsx";
// import SignupModal     from "./components/SignupModal.jsx";
// import Dashboard      from "./components/Dashboard.jsx";
// import { useDevTools } from "./DevTools.jsx";  // ← remove before sharing
// import TestPage        from "./TestPage.jsx";   // ← remove before sharing
// import { supabase }    from "./supabase.js";

// // ============================================================================
// // OZEN — App shell
// //
// // SCREEN FLOW (new user):
// //   landing → disclaimer → onboarding → capture → signup → scanning → results
// //
// // SCREEN FLOW (returning user):
// //   landing → [auto-login check] → dashboard → new scan → quiz → capture → scanning → results
// //
// // TESTING WITHOUT SIGNUP:  set REQUIRE_SIGNUP = false
// // ============================================================================

// const REQUIRE_SIGNUP = true;
// const API_URL        = "/scan";

// export default function App() {
//   const [screen,      setScreen]      = useState("landing");
//   const [quizAnswers, setQuizAnswers] = useState({});
//   const [captureData, setCaptureData] = useState(null);
//   const [result,      setResult]      = useState(null);
//   const [errMsg,      setErrMsg]      = useState("");
//   const [showSignup,  setShowSignup]  = useState(false);
//   const [showAuth,    setShowAuth]    = useState(false);
//   const [user,        setUser]        = useState(null);

//   // ── check for existing session on load ────────────────────────────────────
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (session?.user) setUser(session.user);
//     });
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user || null);
//     });
//     return () => subscription.unsubscribe();
//   }, []);

//   // ── dev tools ──────────────────────────────────────────────────────────────
//   useDevTools(setScreen, setQuizAnswers, setCaptureData, runAnalysis);

//   // ── flow handlers ──────────────────────────────────────────────────────────
//   const handleStart            = () => setScreen("disclaimer");
//   const handleDisclaimerAccept = () => setScreen("onboarding");
//   const handleQuizDone         = (answers) => { setQuizAnswers(answers); setScreen("capture"); };

//   const handleCaptureComplete = (data) => {
//     setCaptureData(data);
//     if (REQUIRE_SIGNUP && !user) {
//       setShowSignup(true);   // show signup gate only if not already logged in
//     } else {
//       runAnalysis(data);
//     }
//   };

//   const handleSignupDone = (signedInUser) => {
//     setUser(signedInUser);
//     setShowSignup(false);
//     runAnalysis(captureData);
//   };

//   const handleSignupDismiss = () => {
//     setShowSignup(false);
//     runAnalysis(captureData); // soft gate — still run analysis if dismissed
//   };

//   const handleAuthDone = (signedInUser) => {
//     setUser(signedInUser);
//     setShowAuth(false);
//     setScreen("dashboard");
//   };

//   const handleSignOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     reset();
//   };

//   const handleViewScan = (fullResult) => {
//     setResult(fullResult);
//     setScreen("results");
//   };

//   const handleNewScan = () => {
//     setQuizAnswers({});
//     setCaptureData(null);
//     setResult(null);
//     setScreen("onboarding");
//   };

//   // ── analysis ───────────────────────────────────────────────────────────────
//   async function runAnalysis(data) {
//     setScreen("scanning");
//     setErrMsg("");
//     try {
//       const { data: { session } } = await supabase.auth.getSession();
//       const token = session?.access_token;

//       const formData = new FormData();
//       formData.append("quiz_data", JSON.stringify(data.answers || quizAnswers));
//       for (const [angle, img] of Object.entries(data.images)) {
//         const blob = await fetch(`data:${img.media};base64,${img.b64}`).then(r => r.blob());
//         formData.append("images", blob, `${angle}.jpg`);
//       }

//       const resp = await fetch(API_URL, {
//         method:  "POST",
//         headers: token ? { "Authorization": `Bearer ${token}` } : {},
//         body:    formData,
//       });

//       const json = await resp.json();
//       if (!resp.ok || json.error) {
//         setErrMsg(json.message || json.error || "Analysis failed.");
//         setScreen("error");
//         return;
//       }

//       setResult(json.result || json);
//       setScreen("results");
//     } catch (e) {
//       setErrMsg("Network error — check your connection and try again.");
//       setScreen("error");
//     }
//   }

//   const reset = () => {
//     setScreen("landing");
//     setQuizAnswers({});
//     setCaptureData(null);
//     setResult(null);
//     setErrMsg("");
//     setShowSignup(false);
//   };

//   // ── test page shortcut ────────────────────────────────────────────────────
//   if (window.location.search.includes("test")) return <TestPage />;

//   return (
//     <>
//       {screen === "landing"    && <Landing    onStart={handleStart} onAuthClick={() => setShowAuth(true)} />}
//       {screen === "disclaimer" && <Disclaimer onAccept={handleDisclaimerAccept} onBack={() => setScreen("landing")} />}
//       {screen === "onboarding" && <Onboarding onComplete={handleQuizDone} />}
//       {screen === "capture"    && <Capture    answers={quizAnswers} onComplete={handleCaptureComplete} />}
//       {screen === "scanning"   && <Scanning />}
//       {screen === "results"    && (
//         <Results
//           result={result}
//           onReset={reset}
//           onDashboard={user ? () => setScreen("dashboard") : null}
//         />
//       )}
//       {screen === "dashboard"  && (
//         <Dashboard
//           user={user}
//           onViewScan={handleViewScan}
//           onNewScan={handleNewScan}
//           onSignOut={handleSignOut}
//         />
//       )}

//       {screen === "error" && (
//         <div style={{ minHeight: "100vh", background: "#16181D", color: "#EEF1F6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 24, textAlign: "center" }}>
//           <div style={{ fontSize: 40 }}>⚠️</div>
//           <p style={{ fontSize: 15, color: "#AEB8CE", lineHeight: 1.6, maxWidth: 320 }}>{errMsg}</p>
//           <button onClick={() => setScreen("capture")} style={{ background: "#2A2F8F", color: "#DCE3F0", border: "none", borderRadius: 12, padding: "13px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Retake photos</button>
//           <button onClick={reset} style={{ background: "none", color: "#7B8294", border: "1px solid #2C313B", borderRadius: 12, padding: "11px 24px", fontSize: 14, cursor: "pointer" }}>Start over</button>
//         </div>
//       )}

//       {/* signup gate — shown after photos if not logged in */}
//       {showSignup && (
//         <SignupModal onSignup={handleSignupDone} onDismiss={handleSignupDismiss} />
//       )}

//       {/* auth modal — shown from landing page sign in button */}
//       {showAuth && (
//         <SignupModal onSignup={handleAuthDone} onDismiss={() => setShowAuth(false)} />
//       )}
//     </>
//   );
// }


import React, { useState, useEffect } from "react";
import Landing        from "./components/Landing.jsx";
import Disclaimer     from "./components/Disclaimer.jsx";
import Onboarding     from "./components/Onboarding.jsx";
import Capture        from "./components/Capture.jsx";
import Scanning       from "./components/Scanning.jsx";
import Results        from "./components/Results.jsx";
import SignupModal     from "./components/SignupModal.jsx";
import Dashboard      from "./components/Dashboard.jsx";
import { useDevTools } from "./DevTools.jsx";  // ← remove before sharing
import TestPage        from "./TestPage.jsx";   // ← remove before sharing
import { supabase }    from "./supabase.js";

// ============================================================================
// OZEN — App shell
//
// SCREEN FLOW (new user):
//   landing → disclaimer → onboarding → capture → signup → scanning → results
//
// SCREEN FLOW (returning user):
//   landing → dashboard  (auto-detected via session)
//   dashboard → onboarding → capture → scanning → results → dashboard
//
// TESTING WITHOUT SIGNUP:  set REQUIRE_SIGNUP = false
// ============================================================================

const REQUIRE_SIGNUP = true;
const API_URL        = "/scan";

export default function App() {
  const [screen,      setScreen]      = useState("landing");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [captureData, setCaptureData] = useState(null);
  const [result,      setResult]      = useState(null);
  const [errMsg,      setErrMsg]      = useState("");
  const [showSignup,  setShowSignup]  = useState(false);
  const [showAuth,    setShowAuth]    = useState(false);
  const [user,        setUser]        = useState(null);
  const [authReady,   setAuthReady]   = useState(false);

  // ── check for existing session on load ────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setScreen("dashboard"); // returning user — go straight to dashboard
      }
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── dev tools ──────────────────────────────────────────────────────────────
  useDevTools(setScreen, setQuizAnswers, setCaptureData, runAnalysis);

  // ── flow handlers ──────────────────────────────────────────────────────────

  // Landing CTA — skip disclaimer for logged-in users
  const handleStart = () => {
    setScreen(user ? "onboarding" : "disclaimer");
  };

  const handleDisclaimerAccept = () => setScreen("onboarding");

  const handleQuizDone = (answers) => {
    setQuizAnswers(answers);
    setScreen("capture");
  };

  const handleCaptureComplete = (data) => {
    setCaptureData(data);
    if (REQUIRE_SIGNUP && !user) {
      setShowSignup(true); // only show signup gate if not already logged in
    } else {
      runAnalysis(data);
    }
  };

  // After signup during analysis flow — run analysis immediately
  const handleSignupDone = (signedInUser) => {
    setUser(signedInUser);
    setShowSignup(false);
    runAnalysis(captureData);
  };

  // Dismissed signup — soft gate, still run analysis
  const handleSignupDismiss = () => {
    setShowSignup(false);
    runAnalysis(captureData);
  };

  // After login from landing page auth button — go to dashboard
  const handleAuthDone = (signedInUser) => {
    setUser(signedInUser);
    setShowAuth(false);
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


  // Add this function in App.jsx before runAnalysis
function mapAnswersToForm(answers) {
  // Calculate sleep hours from bed/wake times
  const bedParts  = answers.sleep?.bed?.split(":").map(Number)  || [23, 0];
  const wakeParts = answers.sleep?.wake?.split(":").map(Number) || [7, 0];
  const bedMins   = bedParts[0] * 60 + bedParts[1];
  const wakeMins  = wakeParts[0] * 60 + wakeParts[1];
  let sleepHours  = (wakeMins - bedMins) / 60;
  if (sleepHours < 0) sleepHours += 24; // handle midnight crossover

  // Map gender
  const genderMap = { "Male": "m", "Female": "f"};

  // Map currency from city
  const uaeCities   = ["Abu Dhabi", "Dubai", "Sharjah", "Doha", "Riyadh", "Jeddah"];
  const currency    = uaeCities.includes(answers.climate) ? "aed" : "inr";

  return {
    age:              parseInt(answers.identity?.age) || 25,
    gender:           genderMap[answers.identity?.gender] || "m",
    ethnicity:        answers.identity?.ethnicity || "Indian / South Asian",
    city:             answers.climate || "Dubai",
    primary_goal:     answers.goal || "General glow-up",
    skincare_routine: answers.routine?.routine || "None",
    skin_issues:      (answers.routine?.issues || []).join(", ") || "None",
    body_type:        answers.body?.type || "Average",
    height:           parseFloat(answers.body?.height) || 170,
    weight:           parseFloat(answers.body?.weight) || 70,
    style_type:       (Array.isArray(answers.style) ? answers.style : [answers.style || ""]).join(", "),
    monthly_budget:   answers.budget || "AED 200-500",
    currency:         currency,
    gym_fitness:      answers.fitness || "Not training",
    sleep_bed:        answers.sleep?.bed || "23:00",
    sleep_wake:       answers.sleep?.wake || "07:00",
    sleep_hours:      Math.round(sleepHours * 10) / 10,
  };
}

  // ── analysis ───────────────────────────────────────────────────────────────
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
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
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

  // ── don't render until session check is done (avoids flash) ───────────────
  if (!authReady) return null;

  // ── test page shortcut ─────────────────────────────────────────────────────
  if (window.location.search.includes("test")) return <TestPage />;

  return (
    <>
      {screen === "landing"    && <Landing    onStart={handleStart} onAuthClick={() => setShowAuth(true)} />}
      {screen === "disclaimer" && <Disclaimer onAccept={handleDisclaimerAccept} onBack={() => setScreen("landing")} />}
      {screen === "onboarding" && (
        <Onboarding
          onComplete={handleQuizDone}
          onBack={() => setScreen(user ? "dashboard" : "landing")}
        />
      )}
      {screen === "capture"    && <Capture    answers={quizAnswers} onComplete={handleCaptureComplete} />}
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
        <SignupModal onSignup={handleSignupDone} onDismiss={handleSignupDismiss} />
      )}

      {/* auth modal — from landing page sign in button */}
      {showAuth && (
        <SignupModal onSignup={handleAuthDone} onDismiss={() => setShowAuth(false)} />
      )}
    </>
  );
}