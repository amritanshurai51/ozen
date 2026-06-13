// ============================================================================
// OZEN — Seed a HIGH SCORE test scan (8.5+ across all parameters)
// Run: node seed_high_score.js
// Inserts into user1@gmail.com
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: "../app/services/.env" });

const supabase = createClient(
  process.env.SUPABASE_CONN_URL,
  process.env.SUPABASE_SECRET_KEY
);

const HIGH_SCORE_SCAN = {
  image_check: "pass",
  detected_ethnicity: "Indian / South Asian",
  face_shape: "Oval",
  image_conditions: {
    lighting: "Natural daylight, even and optimal",
    angle: "Direct frontal, perfectly centred",
    distance: "Ideal portrait distance",
    compensation_applied: "None needed — conditions are ideal"
  },
  scores: {
    eyes:               8.8,
    eyebrows:           8.6,
    hair:               8.7,
    facial_hair:        8.5,
    skin_quality:       8.9,
    jawline:            8.7,
    cheekbones_midface: 8.6,
    nose:               8.8,
    lips:               8.5,
    overall_harmony:    8.9,
  },
  observations: {
    eyes:               "Exceptional almond shape with strong positive canthal tilt (+3°). Dense limbal rings, minimal periorbital pigmentation, and excellent symmetry. One of the strongest features on this face.",
    eyebrows:           "Well-defined arch with ideal thickness for SA norms. Clean borders, full density throughout including tails. Minimal grooming needed — already well-shaped.",
    hair:               "Thick, healthy dark hair with excellent density and lustre. Clean fade with intentional styling on top adding volume and dimension. Hairline is intact and well-positioned.",
    facial_hair:        "Full, even beard coverage with good density across jaw and cheeks. Well-groomed with clean borders. Adds significant jawline enhancement and masculinity.",
    skin_quality:       "Exceptional clarity with minimal pore visibility, even tone, and healthy hydration. No active concerns, no significant PIH. Smooth texture throughout. Top-tier baseline.",
    jawline:            "Sharp mandibular definition with strong gonial angle. Minimal submental fat and clear separation between jaw and neck. Masseter development adds width and strength.",
    cheekbones_midface: "High zygomatic projection creating visible shadow beneath the bone. Midface proportions are excellent with ideal ratio. Strongly masculine structure.",
    nose:               "Straight dorsal line with refined tip and balanced nostril width within SA norms. No significant asymmetry. Bridge height is appropriate and harmonious with overall face.",
    lips:               "Well-proportioned with good fullness and defined cupid's bow. Upper to lower ratio close to ideal 1:1.5. Natural colour and hydration are strong.",
    overall_harmony:    "Exceptional cohesion across all features. Strong facial thirds ratio, high symmetry deviation under 2%, and fWHR in the optimal masculine range. This face reads as genuinely striking."
  },
  strengths: [
    "Exceptional skin quality — top-tier clarity, tone, and texture with minimal intervention needed",
    "Strong jawline with excellent gonial angle definition and minimal submental fat",
    "High cheekbone projection creating masculine shadow and depth under good lighting"
  ],
  overall_score:   8.8,
  potential_score: 9.2,
  potential_gap_drivers: [
    "Minor skin texture refinement in T-zone",
    "Beard density optimisation at lower cheek",
    "Canthal tilt enhancement through targeted eye area care"
  ],
  metrics: {
    fWHR: 1.88,
    facial_thirds: "31% / 34% / 35%",
    gonial_angle_estimate: "118°",
    canthal_tilt: "+3° positive",
    symmetry_deviation_pct: 1.8
  },
  primary_focus_areas: [
    {
      area: "Skin Maintenance & Refinement",
      current_score: 8.9,
      zone: "green",
      why_it_matters: "Your skin is already exceptional. The focus is protecting and maintaining this baseline — especially in Dubai's UV and humidity conditions.",
      action_steps: [
        {
          step: "Maintain daily SPF 50 application — the single most important anti-ageing and pigmentation prevention step, non-negotiable in Dubai",
          timeframe: "Daily, ongoing",
          products_or_options: {
            budget:  "Broad-spectrum SPF 50 gel from any pharmacy, AED 35-65",
            mid:     "Oil-free tinted SPF with antioxidants from skincare boutique, AED 110-180",
            premium: "Dermatologist-grade UV protection with DNA repair enzymes, AED 250-400"
          }
        }
      ]
    },
    {
      area: "Beard & Facial Hair Optimisation",
      current_score: 8.5,
      zone: "green",
      why_it_matters: "Beard is already strong. Fine-tuning the borders and density will push this from excellent to exceptional.",
      action_steps: [
        {
          step: "Professional beard shaping every 2-3 weeks to maintain clean borders and optimal shape relative to your jaw structure",
          timeframe: "Every 2-3 weeks ongoing",
          products_or_options: {
            budget:  "Local barbershop beard trim, AED 30-50",
            mid:     "Men's grooming lounge with beard specialist, AED 80-130",
            premium: "High-end barbershop with hot towel service and styling, AED 200-350"
          }
        }
      ]
    },
    {
      area: "Overall Maintenance Protocol",
      current_score: 8.8,
      zone: "green",
      why_it_matters: "At this level the goal is preservation, not transformation. Consistency with basic habits will maintain and slowly improve every parameter.",
      action_steps: [
        {
          step: "Maintain current fitness and nutrition approach — body composition is clearly well-managed and contributing significantly to facial definition",
          timeframe: "Ongoing",
          products_or_options: {
            budget:  "Home training programme and meal prep, AED 100-200/month",
            mid:     "Gym membership with structured programme, AED 300-500/month",
            premium: "Personal trainer and nutrition coaching, AED 1500-3000/month"
          }
        }
      ]
    }
  ],
  "30_day_protocol": [
    "Apply SPF 50 every morning without exception — this is your number one long-term investment",
    "Professional beard shaping appointment this week, then maintain every 2-3 weeks",
    "7.5-8 hours sleep consistently — recovery is what keeps skin and eyes looking this sharp",
    "Continue current resistance training — body composition is directly visible in facial definition",
    "Weekly clay mask to maintain pore clarity and manage T-zone oiliness",
    "Stay at 3L water minimum daily — hydration is showing in your skin quality",
    "Monthly dermatologist or aesthetic clinic visit for professional assessment and maintenance facial"
  ],
  disclaimer: "This analysis is for aesthetic guidance only and is not medical advice. Results are based on submitted photos and may vary with lighting, angle, and image quality. Consult a healthcare professional before starting new fitness or skincare programmes."
};

async function run() {
  const email = "user1@gmail.com";
  console.log(`\nFinding user: ${email}`);

  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.error("Could not list users:", listErr.message); process.exit(1); }

  const user = users.find(u => u.email === email);
  if (!user) { console.error(`No user found with email: ${email}`); process.exit(1); }
  console.log(`✓ Found user: ${user.id}`);

  console.log("Inserting high-score scan...");
  const { data, error } = await supabase.from("scans").insert({
    user_id:         user.id,
    overall_score:   HIGH_SCORE_SCAN.overall_score,
    potential_score: HIGH_SCORE_SCAN.potential_score,
    quiz_data: {
      age: 24, gender: "m", ethnicity: "Indian / South Asian",
      city: "Dubai", primary_goal: "General glow-up",
      skincare_routine: "5+ step", skin_issues: "None",
      body_type: "Athletic", height: 180, weight: 78,
      style_type: "Old Money, Minimal / Clean",
      monthly_budget: "AED 1500+", currency: "aed",
      gym_fitness: "5+ days, serious",
      sleep_bed: "22:30", sleep_wake: "06:30", sleep_hours: 8.0,
    },
    full_result: HIGH_SCORE_SCAN,
  }).select();

  if (error) {
    console.error("✗ Insert failed:", error.message);
    process.exit(1);
  }

  console.log(`✓ High-score scan inserted — id: ${data[0].id}`);
  console.log(`  Overall: ${HIGH_SCORE_SCAN.overall_score} / 10`);
  console.log(`  Potential: ${HIGH_SCORE_SCAN.potential_score} / 10`);
  console.log(`\nLog in as ${email} at localhost:8000 to see it on the dashboard.\n`);
}

run().catch(e => { console.error("Error:", e.message); process.exit(1); });