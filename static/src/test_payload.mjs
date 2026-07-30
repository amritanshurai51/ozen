// test_payload.mjs
//
// Verifies the onboarding → payload pipeline WITHOUT a server or images.
// It simulates a user answering the quiz, runs the answers through the exact
// same two pure functions the app uses (normalizeAnswers from Onboarding.jsx,
// mapAnswersToForm from App.jsx — the FIXED version), and asserts the resulting
// quiz_data matches the backend InputForm contract.
//
// Run:  node test_payload.mjs
//
// NOTE: normalizeAnswers and mapAnswersToForm are COPIED here so the test can
// run in plain Node (the originals live in .jsx files with React/asset imports).
// If you edit either function in the app, mirror the change here — or, better,
// extract both into a shared plain-JS module (src/payload.js) that the app and
// this test both import, so they can never drift.

// ─────────────────────────────────────────────────────────────────────────────
// 1. The two pipeline functions (keep in sync with the app)
// ─────────────────────────────────────────────────────────────────────────────

function normalizeAnswers(state) {
  const gender = state.identity_gender || "";
  const ethnicity = state.identity_ethnicity || "";
  const products = state.routine_products || [];

  let routine = "None";
  if (products.includes("None")) routine = "None";
  else if (products.length === 1 && products[0] === "Cleanser") routine = "Basic cleanser only";
  else if (products.length >= 5) routine = "5+ step";
  else if (products.length > 0) routine = "3-step";

  return {
    identity: { age: "25", gender, ethnicity },
    climate: state.climate || "",
    routine: {
      routine,
      products,
      routinePreference: state.routine_preference || "",
      oilDry: state.routine_skin_type || "",
      sensitiveResistant: state.routine_sensitive || "",
      concerns: state.skin_concerns || [],
      focusArea: state.focus_area || "",
      personalization: state.personalization || {},
    },
    body: state.body || {},
    style: state.style || [],
    budget: state.budget || "",
    fitness: state.fitness || "",
    sleep: state.sleep || {},
  };
}

function mapAnswersToForm(answers) {
  const bedParts  = answers.sleep?.bed?.split(":").map(Number)  || [23, 0];
  const wakeParts = answers.sleep?.wake?.split(":").map(Number) || [7, 0];
  const bedMins   = bedParts[0] * 60 + bedParts[1];
  const wakeMins  = wakeParts[0] * 60 + wakeParts[1];
  let sleepHours  = (wakeMins - bedMins) / 60;
  if (sleepHours < 0) sleepHours += 24;

  const genderMap = { "Male": "m", "Female": "f", "Non-Binary": "nb" };
  const uaeCities = ["Abu Dhabi", "Dubai", "Sharjah", "Doha", "Riyadh", "Jeddah"];
  const currency  = uaeCities.includes(answers.climate) ? "aed" : "inr";

  const prefMap = { "K-Beauty": "k_beauty", "Western Beauty": "western" };
  const productPreference = prefMap[answers.routine?.routinePreference] || "western";

  const rawFocus = answers.routine?.focusArea;
  const focusAreas = Array.isArray(rawFocus) ? rawFocus.join(", ") : (rawFocus || null);

  return {
    age:                  parseInt(answers.identity?.age) || 25,
    gender:               genderMap[answers.identity?.gender] || "m",
    ethnicity:            answers.identity?.ethnicity || "Not specified",
    city:                 answers.climate || "Dubai",
    body_type:            answers.body?.type || "Average",
    height:               parseFloat(answers.body?.height) || 170,
    weight:               parseFloat(answers.body?.weight) || 70,
    skincare_routine:     answers.routine?.routine || "None",
    skin_products:        (answers.routine?.products || []).join(", ") || null,
    oil_dry:              answers.routine?.oilDry || "oily",
    sensitive_resistant:  answers.routine?.sensitiveResistant || "resistant",
    skin_concerns:        (answers.routine?.concerns || []).join(", ") || null,
    focus_areas:          focusAreas,
    water_intake:         answers.water || null,
    spf_habit:            answers.spf?.habit || null,
    spf_level:            answers.spf?.level || null,
    hair_type:            answers.hairType || null,
    hair_texture:         answers.hairTexture || null,
    monthly_budget:       answers.budget || "AED 200-500",
    currency:             currency,
    gym_fitness:          answers.fitness || "Not training",
    sleep_bed:            answers.sleep?.bed || "23:00",
    sleep_wake:           answers.sleep?.wake || "07:00",
    sleep_hours:          Math.round(sleepHours * 10) / 10,
    allergies:            answers.routine?.personalization?.allergies || null,
    medications:          answers.routine?.personalization?.medications || null,
    product_preference:   productPreference,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Answer options (mirror the STEPS array in Onboarding.jsx)
// ─────────────────────────────────────────────────────────────────────────────

const OPTS = {
  gender:     ["Male", "Female", "Non-Binary"],
  ethnicity:  ["European / Caucasian", "African American", "Asian", "Southeast Asian",
               "Middle Eastern", "Native Hawaiian", "Pacific Islander", "Indigenous", "Mixed", "Other"],
  city:       ["Dubai", "Abu Dhabi", "Sharjah", "Riyadh", "Jeddah", "Doha",
               "Bengaluru", "Mumbai", "Delhi", "Kochi"],
  sensitive:  ["sensitive", "resistant"],
  skinType:   ["oily", "normal", "dry", "combination"],
  concerns:   ["Uneven skin tone", "Dullness", "Enlarged pores", "Pimple or acne",
               "Fine lines", "Rough texture", "Pigmentation changes"],
  products:   ["Cleanser", "Makeup remover", "Moisturizer", "SPF", "Toner", "Exfolitor", "None"],
  preference: ["Western Beauty", "K-Beauty"],
  focusArea:  ["Hair", "Eyebrows", "Cheeks", "Whole Face", "Eyes", "Teeth", "Chin"],
  bodyType:   ["Muscular", "Average", "Athletic", "Overweight", "Slim"],
  budget:     ["Under AED 200", "AED 200 – 500", "AED 500 – 1500", "AED 1500+"],
  fitness:    ["Not training", "1–2× per week", "3–4× per week", "5+ days, serious"],
  allergies:  ["", "fragrance", "nut oil (almond oil)", "essential oils"],
  meds:       ["", "benzoyl peroxide", "acne medication", "hormonal treatment"],
};

const pick    = (a) => a[Math.floor(Math.random() * a.length)];
const subset  = (a, min = 1) => {
  const shuffled = [...a].sort(() => Math.random() - 0.5);
  const n = min + Math.floor(Math.random() * (a.length - min + 1));
  return shuffled.slice(0, n);
};
const time = () => `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${pick(["00", "15", "30", "45"])}`;

// Build a random answers-by-step-id object (the shape Onboarding stores)
function randomState() {
  const products = subset(OPTS.products);
  return {
    identity_gender:     pick(OPTS.gender),
    identity_ethnicity:  pick(OPTS.ethnicity),
    climate:             pick(OPTS.city),
    routine_sensitive:   pick(OPTS.sensitive),
    routine_skin_type:   pick(OPTS.skinType),
    skin_concerns:       subset(OPTS.concerns),
    routine_products:    products.includes("None") ? ["None"] : products,
    routine_preference:  pick(OPTS.preference),
    personalization:     { allergies: pick(OPTS.allergies), medications: pick(OPTS.meds) },
    focus_area:          pick(OPTS.focusArea),
    body:                { type: pick(OPTS.bodyType),
                           height: String(150 + Math.floor(Math.random() * 40)),
                           weight: String(50 + Math.floor(Math.random() * 45)) },
    budget:              pick(OPTS.budget),
    fitness:             pick(OPTS.fitness),
    sleep:               { bed: time(), wake: time() },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. The backend contract (from input_form.py InputForm)
// ─────────────────────────────────────────────────────────────────────────────

const REQUIRED = {
  age:                 { type: "number", min: 18, max: 70 },
  gender:              { enum: ["m", "f", "nb"] },
  ethnicity:           { type: "string" },
  city:                { type: "string" },
  skincare_routine:    { type: "string" },
  oil_dry:             { type: "string" },
  sensitive_resistant: { type: "string" },
  body_type:           { type: "string" },
  height:              { type: "number", min: 120, max: 230 },
  weight:              { type: "number", min: 30,  max: 200 },
  monthly_budget:      { type: "string" },
  currency:            { enum: ["aed", "inr"] },
  gym_fitness:         { type: "string" },
  sleep_bed:           { type: "string" },
  sleep_wake:          { type: "string" },
  sleep_hours:         { type: "number", min: 0, max: 24 },
};

// present as keys, may be null
const OPTIONAL = [
  "skin_products", "skin_concerns", "focus_areas", "water_intake", "spf_habit",
  "spf_level", "hair_type", "hair_texture", "allergies", "medications", "product_preference",
];

function validate(payload) {
  const errors = [];
  for (const [key, rule] of Object.entries(REQUIRED)) {
    if (!(key in payload)) { errors.push(`missing required: ${key}`); continue; }
    const v = payload[key];
    if (v === null || v === undefined) { errors.push(`required is null: ${key}`); continue; }
    if (rule.type === "number") {
      if (typeof v !== "number" || Number.isNaN(v)) errors.push(`${key} not a number: ${JSON.stringify(v)}`);
      else if (rule.min !== undefined && (v < rule.min || v > rule.max)) errors.push(`${key} out of range: ${v}`);
    }
    if (rule.type === "string" && typeof v !== "string") errors.push(`${key} not a string: ${JSON.stringify(v)}`);
    if (rule.enum && !rule.enum.includes(v)) errors.push(`${key} not in ${JSON.stringify(rule.enum)}: ${JSON.stringify(v)}`);
  }
  for (const key of OPTIONAL) if (!(key in payload)) errors.push(`missing optional key: ${key}`);
  if ("product_preference" in payload && !["western", "k_beauty"].includes(payload.product_preference))
    errors.push(`product_preference invalid: ${payload.product_preference}`);
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Run: fuzz + a targeted "wiring proof" for the 5 previously-dropped fields
// ─────────────────────────────────────────────────────────────────────────────

const N = 2000;
let failures = 0;
for (let i = 0; i < N; i++) {
  const payload = mapAnswersToForm(normalizeAnswers(randomState()));
  const errors = validate(payload);
  if (errors.length) {
    failures++;
    if (failures <= 5) console.log(`✗ run ${i}:`, errors.join("; "));
  }
}
console.log(`\nContract fuzz: ${N - failures}/${N} passed` + (failures ? ` — ${failures} FAILED` : " ✓"));

// Sample payload for eyeballing
console.log("\nSample payload:\n" + JSON.stringify(mapAnswersToForm(normalizeAnswers(randomState())), null, 2));

// Wiring proof: set known values, assert they survive to the payload
console.log("\nWiring proof (the 5 previously-dropped fields):");
const state = randomState();
state.identity_gender    = "Non-Binary";
state.skin_concerns      = ["Pimple or acne", "Fine lines"];
state.focus_area         = "Eyes";
state.routine_preference = "K-Beauty";
state.personalization    = { allergies: "fragrance, nut oil", medications: "benzoyl peroxide" };
const p = mapAnswersToForm(normalizeAnswers(state));
const checks = [
  ["gender = nb",              p.gender === "nb"],
  ["skin_concerns wired",      p.skin_concerns === "Pimple or acne, Fine lines"],
  ["focus_areas wired",        p.focus_areas === "Eyes"],
  ["product_preference wired", p.product_preference === "k_beauty"],
  ["allergies wired",          p.allergies === "fragrance, nut oil"],
  ["medications wired",        p.medications === "benzoyl peroxide"],
];
let wiringOk = true;
for (const [label, ok] of checks) { console.log(`  ${ok ? "✓" : "✗"} ${label}`); if (!ok) wiringOk = false; }

console.log(`\n${failures === 0 && wiringOk ? "ALL GOOD ✓" : "PROBLEMS FOUND ✗"}`);
process.exit(failures === 0 && wiringOk ? 0 : 1);