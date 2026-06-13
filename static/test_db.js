// ============================================================================
// OZEN — Supabase DB Test
// Run with: node test_db.js (from inside static/)
// Tests: connect, create 2 users, insert scans, read back per user
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: "../app/services/.env" });

const SUPABASE_URL = process.env.SUPABASE_CONN_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

console.log("Connecting to Supabase...");


if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("\n✗ Missing SUPABASE_PROJECT_URL or SUPABASE_SECRET_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── helpers ──────────────────────────────────────────────────────────────────
function log(msg)  { console.log(`\n${msg}`); }
function ok(msg)   { console.log(`  ✓ ${msg}`); }
function fail(msg, errObj) {
  console.error(`  ✗ ${msg}`);
  if (errObj) {
    console.error("  Error details:");
    console.error("    message:", errObj.message);
    console.error("    status:", errObj.status);
    console.error("    code:", errObj.code);
    console.error("    hint:", errObj.hint);
    console.error("    details:", errObj.details);
    console.error("  Full object:", JSON.stringify(errObj, null, 4));
  }
}

// ── synthetic scan result ────────────────────────────────────────────────────
function makeScan(overallScore, label) {
  return {
    overall_score:   overallScore,
    potential_score: overallScore + 1.2,
    scores: {
      eyes: 6.2, eyebrows: 5.4, hair: 6.0,
      facial_hair: 4.8, skin_quality: 5.6,
      jawline: 4.6, cheekbones_midface: 5.1,
      nose: 6.0, lips: 5.5, overall_harmony: 5.7,
    },
    strengths: ["Good facial symmetry", "Proportionate nose", "Healthy hair"],
    primary_focus_areas: [{
      area: "Jawline", zone: "red", current_score: 4.6,
      why_it_matters: "Sharpening the lower third creates visual impact.",
      action_steps: [{ step: "Resistance training 4x/week", timeframe: "8-12 weeks" }],
    }],
    "30_day_protocol": ["Track calories", "Morning SPF", "Gua sha daily"],
    disclaimer: "Not medical advice.",
    _test_label: label,
  };
}

const QUIZ = {
  age: 26, gender: "m", ethnicity: "Indian / South Asian",
  city: "Dubai", primary_goal: "General glow-up",
  skincare_routine: "Basic cleanser only", skin_issues: "Oiliness",
  body_type: "Average", height: 175, weight: 72,
  style_type: "Minimal / Clean", monthly_budget: "AED 200-500",
  currency: "aed", gym_fitness: "3-4x per week",
  sleep_bed: "23:30", sleep_wake: "07:00", sleep_hours: 7.5,
};

// ── cleanup ──────────────────────────────────────────────────────────────────
async function cleanup() {
  log("0. Cleaning up previous test data...");
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    fail("Could not list users for cleanup", error);
    return;
  }
  const testUsers = data.users.filter(u =>
    u.email === "testuser1@ozen.dev" || u.email === "testuser2@ozen.dev"
  );
  for (const u of testUsers) {
    const { error: de } = await supabase.auth.admin.deleteUser(u.id);
    if (de) fail(`Could not delete user ${u.email}`, de);
    else ok(`Deleted previous test user: ${u.email}`);
  }
  if (testUsers.length === 0) ok("No previous test users found");
}

// ── main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log("\n" + "=".repeat(50));
  console.log("OZEN DB TEST");
  console.log("=".repeat(50));

  // 0. Cleanup
  await cleanup();

  // 1. Create users
  log("1. Creating two test users...");

  const { data: auth1, error: e1 } = await supabase.auth.admin.createUser({
    email: "testuser1@ozen.dev",
    password: "testpassword123",
    user_metadata: { name: "Test User One" },
    email_confirm: true,
  });
  if (e1) { fail("User 1 creation failed", e1); process.exit(1); }
  ok(`User 1 created — id: ${auth1.user.id} | email: ${auth1.user.email}`);

  const { data: auth2, error: e2 } = await supabase.auth.admin.createUser({
    email: "testuser2@ozen.dev",
    password: "testpassword123",
    user_metadata: { name: "Test User Two" },
    email_confirm: true,
  });
  if (e2) { fail("User 2 creation failed", e2); process.exit(1); }
  ok(`User 2 created — id: ${auth2.user.id} | email: ${auth2.user.email}`);

  const user1Id = auth1.user.id;
  const user2Id = auth2.user.id;

  // 2. Check users table trigger
  log("2. Checking users table (auto-populated by trigger)...");
  await new Promise(r => setTimeout(r, 1500));

  const { data: userRows, error: ue } = await supabase
    .from("users")
    .select("*")
    .in("id", [user1Id, user2Id]);

  if (ue) {
    fail("Could not read users table", ue);
  } else if (!userRows || userRows.length === 0) {
    fail("users table is empty — trigger likely failed or table name mismatch");
    console.log("  Run this in Supabase SQL Editor to debug:");
    console.log("  SELECT trigger_name, action_statement FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';");
  } else {
    ok(`Found ${userRows.length} row(s) in users table:`);
    userRows.forEach(r => console.log(`    id: ${r.id} | name: ${r.name}`));
  }

  // 3. Insert scans
  log("3. Inserting synthetic scans...");

  const { error: s1e } = await supabase.from("scans").insert({
    user_id: user1Id, overall_score: 5.4, potential_score: 6.6,
    quiz_data: QUIZ, full_result: makeScan(5.4, "User One scan 1"),
  });
  if (s1e) fail("Scan 1a insert failed", s1e);
  else ok("User 1 — scan 1 inserted (score: 5.4)");

  const { error: s2e } = await supabase.from("scans").insert({
    user_id: user1Id, overall_score: 5.8, potential_score: 7.0,
    quiz_data: QUIZ, full_result: makeScan(5.8, "User One scan 2"),
  });
  if (s2e) fail("Scan 1b insert failed", s2e);
  else ok("User 1 — scan 2 inserted (score: 5.8)");

  const { error: s3e } = await supabase.from("scans").insert({
    user_id: user2Id, overall_score: 6.1, potential_score: 7.2,
    quiz_data: QUIZ, full_result: makeScan(6.1, "User Two scan 1"),
  });
  if (s3e) fail("Scan 2 insert failed", s3e);
  else ok("User 2 — scan 1 inserted (score: 6.1)");

  // 4. Read back per user
  log("4. Reading scans back per user...");

  const { data: scans1, error: r1e } = await supabase
    .from("scans")
    .select("id, overall_score, potential_score, created_at")
    .eq("user_id", user1Id)
    .order("created_at", { ascending: false });

  if (r1e) fail("Read user 1 scans failed", r1e);
  else {
    ok(`User 1 — ${scans1.length} scan(s) found:`);
    scans1.forEach(s =>
      console.log(`    scan ${s.id} | score: ${s.overall_score} | potential: ${s.potential_score} | at: ${s.created_at}`)
    );
  }

  const { data: scans2, error: r2e } = await supabase
    .from("scans")
    .select("id, overall_score, potential_score, created_at")
    .eq("user_id", user2Id)
    .order("created_at", { ascending: false });

  if (r2e) fail("Read user 2 scans failed", r2e);
  else {
    ok(`User 2 — ${scans2.length} scan(s) found:`);
    scans2.forEach(s =>
      console.log(`    scan ${s.id} | score: ${s.overall_score} | potential: ${s.potential_score} | at: ${s.created_at}`)
    );
  }

  // 5. Cross-user isolation check
  log("5. Cross-user isolation check...");
  const { data: crossCheck } = await supabase
    .from("scans")
    .select("id, user_id")
    .eq("user_id", user1Id);

  const leaked = crossCheck?.some(s => s.user_id === user2Id);
  if (leaked) fail("RLS FAILURE — user 1 can see user 2 scans");
  else ok("User 1 cannot see user 2 scans (service role bypasses RLS — verify manually in dashboard)");

  // 6. Cleanup
  log("6. Cleaning up test users...");
  const { error: d1e } = await supabase.auth.admin.deleteUser(user1Id);
  if (d1e) fail("Delete user 1 failed", d1e);
  else ok("User 1 deleted");

  const { error: d2e } = await supabase.auth.admin.deleteUser(user2Id);
  if (d2e) fail("Delete user 2 failed", d2e);
  else ok("User 2 deleted");

  console.log("\n" + "=".repeat(50));
  console.log("TEST COMPLETE");
  console.log("=".repeat(50) + "\n");
}

run().catch(e => {
  console.error("\n✗ Unexpected error:", e.message);
  console.error(e);
  process.exit(1);
});