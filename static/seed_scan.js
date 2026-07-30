// ============================================================================
// OZEN — Seed a test scan for a real user
// Run: node seed_scan.js your@email.com
// This logs in as the user and inserts a realistic fake scan into the DB
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: "../app/services/.env" });

const email    = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node seed_scan.js your@email.com yourpassword");
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_CONN_URL,
  process.env.SUPABASE_SECRET_KEY
);

const FAKE_SCAN = {
  image_check: "pass",
  detected_ethnicity: "Indian / South Asian",
  face_shape: "Oval",
  image_conditions: {
    lighting: "Natural daylight, even exposure",
    angle: "Direct frontal, well centred",
    distance: "Appropriate portrait distance",
    compensation_applied: "None needed"
  },
  scores: {
    eyes:               6.5,
    eyebrows:           5.8,
    hair:               6.2,
    facial_hair:        5.1,
    skin_quality:       6.4,
    jawline:            5.2,
    cheekbones_midface: 5.9,
    nose:               6.1,
    lips:               5.7,
    overall_harmony:    6.3,
  },
  observations: {
    eyes:               "Good almond shape with neutral canthal tilt and adequate spacing. Slight periorbital pigmentation typical for SA ethnicity — not penalised.",
    eyebrows:           "Naturally full but lacking defined arch. Sparse at the tails and slightly asymmetric. Would benefit from light grooming.",
    hair:               "Healthy dark hair with good density and clean fade. Flat on top — styling could add more dimension and frame the face better.",
    facial_hair:        "Patchy stubble with uneven coverage on neck and jawline. Currently detracts from structure rather than adding to it.",
    skin_quality:       "Generally clear tone with mild oiliness in T-zone and visible pore texture on cheeks. No active acne — strong baseline with room to refine.",
    jawline:            "Soft lower third with subcutaneous fat reducing angularity. Underlying structure is present but obscured. High-leverage area.",
    cheekbones_midface: "Moderate zygomatic projection with some buccal fullness. Reads as average rather than striking under current composition.",
    nose:               "Straight dorsal line, proportionate width for SA ethnicity, no significant asymmetry. Balanced with other features.",
    lips:               "Medium fullness with defined cupid's bow and good symmetry. Upper lip slightly thinner than ideal ratio but acceptable.",
    overall_harmony:    "Balanced and symmetrical with no jarring features. Softness in the lower third and lack of styling reduce visual impact."
  },
  strengths: [
    "Strong facial symmetry with no major asymmetries",
    "Healthy hair with good density and intact hairline",
    "Proportionate nose well-calibrated to SA norms"
  ],
  overall_score:   6.0,
  potential_score: 7.2,
  potential_gap_drivers: [
    "Jawline definition — highest ROI area",
    "Skin texture refinement",
    "Hair styling and eyebrow grooming"
  ],
  primary_focus_areas: [
    {
      area: "Jawline & Lower Third Definition",
      current_score: 5.2,
      zone: "yellow",
      why_it_matters: "Sharpening the lower third of your face creates the most immediate visual impact. This is the single biggest lever for transforming your overall aesthetic.",
      action_steps: [
        {
          step: "Reduce body fat through a controlled caloric deficit combined with 4x weekly resistance training focusing on compound movements",
          timeframe: "8-12 weeks for visible change",
          products_or_options: {
            budget:  "Home meal prep with whole foods, community gym membership, AED 150-250/month",
            mid:     "Prepared meal service with macro tracking, mid-tier gym, AED 400-650/month",
            premium: "Personal nutrition coach and private trainer, AED 1500-3000/month"
          }
        },
        {
          step: "Daily gua sha or facial massage (5 minutes) focusing on the jaw and cheekbone area to reduce puffiness and improve definition",
          timeframe: "Daily habit, subtle results in 3-4 weeks",
          products_or_options: {
            budget:  "Smooth-edged tool from any pharmacy with lightweight facial oil, AED 25-50",
            mid:     "Jade or stainless steel sculpting tool from beauty retailer, AED 80-150",
            premium: "Lymphatic drainage facial at aesthetic clinic, AED 400-600/session"
          }
        }
      ]
    },
    {
      area: "Skin Texture & Oil Control",
      current_score: 6.4,
      zone: "yellow",
      why_it_matters: "Refined, matte skin elevates every other feature and creates the polished look essential for your stated goal. Dubai's climate makes oil control non-negotiable.",
      action_steps: [
        {
          step: "Twice-daily cleansing with an oil-control salicylic acid cleanser, followed by lightweight niacinamide gel and SPF 50 every morning",
          timeframe: "Daily routine, visible improvement in 3-4 weeks",
          products_or_options: {
            budget:  "Oil-control salicylic acid cleanser from any pharmacy, AED 30-55",
            mid:     "Gel-based BHA cleanser and niacinamide serum from skincare boutique, AED 150-220",
            premium: "Medical-grade cleanser and serum from dermatology clinic, AED 350-550"
          }
        }
      ]
    },
    {
      area: "Eyebrow Shaping & Hair Styling",
      current_score: 5.8,
      zone: "yellow",
      why_it_matters: "Defined brows frame the eyes and add structure to the upper face. Combined with intentional hair styling, this is the fastest and cheapest visual upgrade available.",
      action_steps: [
        {
          step: "Professional eyebrow shaping every 3-4 weeks to create clean borders and slight angular arch",
          timeframe: "Immediate visual change",
          products_or_options: {
            budget:  "Threading at local salon, AED 15-30",
            mid:     "Brow grooming at men's grooming lounge, AED 50-90",
            premium: "Specialist brow stylist at upscale barbershop or spa, AED 120-200"
          }
        },
        {
          step: "Style hair daily with matte styling clay — blow-dry upward after washing, apply product to damp hair for volume and texture",
          timeframe: "Daily 3-minute habit, instant visual lift",
          products_or_options: {
            budget:  "Matte styling clay from any pharmacy or supermarket, AED 35-65",
            mid:     "Premium fiber paste or texture powder from grooming retailer, AED 95-160",
            premium: "Salon-recommended styling product with technique tutorial from barber, AED 180-280"
          }
        }
      ]
    }
  ],
  "30_day_protocol": [
    "Start twice-daily skincare: oil-control cleanser + SPF 50 morning, cleanser + moisturiser night",
    "Book eyebrow shaping appointment this week — clean arch, maintain every 3 weeks",
    "Blow-dry hair upward after every wash, apply matte clay for texture and volume",
    "Daily 5-minute gua sha on jaw and cheekbone area using any smooth tool",
    "Cut liquid calories completely — water, black coffee, unsweetened tea only",
    "Add 4x weekly resistance training: squats, deadlifts, bench, rows",
    "Sleep 7.5-8 hours consistently — set a fixed bedtime tonight"
  ],
  disclaimer: "This analysis is for aesthetic guidance only and is not medical advice. Results are based on submitted photos and may vary. Consult a healthcare professional before starting new fitness or nutrition programmes."
};

async function run() {
  console.log(`\nLogging in as ${email}...`);

  // Sign in using admin (service role) so we don't need the actual password
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.error("Could not list users:", listErr.message); process.exit(1); }

  const user = users.find(u => u.email === email);
  if (!user) { console.error(`No user found with email: ${email}`); process.exit(1); }

  console.log(`✓ Found user: ${user.id}`);

  // Insert scan
  console.log("Inserting fake scan...");
  const { data, error } = await supabase.from("scans").insert({
    user_id:         user.id,
    overall_score:   FAKE_SCAN.overall_score,
    potential_score: FAKE_SCAN.potential_score,
    quiz_data: {
      age: 26, gender: "m", ethnicity: "Indian / South Asian",
      city: "Dubai", primary_goal: "General glow-up",
      skincare_routine: "Basic cleanser only", skin_issues: "Oiliness",
      body_type: "Average", height: 175, weight: 72,
      style_type: "Minimal / Clean", monthly_budget: "AED 200-500",
      currency: "aed", gym_fitness: "3-4x per week",
      sleep_bed: "23:30", sleep_wake: "07:00", sleep_hours: 7.5,
    },
    full_result: FAKE_SCAN,
  }).select();

  if (error) {
    console.error("✗ Insert failed:", error.message);
    console.error("  Code:", error.code);
    console.error("  Details:", error.details);
    process.exit(1);
  }

  console.log(`✓ Scan inserted — id: ${data[0].id}`);
  console.log(`\nNow open http://localhost:8000, click "Sign in", log in as ${email}`);
  console.log("You should see the scan on your dashboard.\n");
}

run().catch(e => { console.error("Error:", e.message); process.exit(1); });