from guardrails import sanitize_output
r = {
  "observations": {"skin_quality": "Skin looks clear. Start a retinol serum nightly. Keep wearing SPF."},
  "primary_focus_areas": [{
    "action_steps": [{
      "step": "Apply tretinoin at night.",
      "product_recommendation": {"name": "The Ordinary Retinol 1%", "price": "AED 60", "where": "Amazon"},
      "timeframe": "8 weeks"
    }]
  }],
  "lips_observation": "Lips appear healthy and well-hydrated."
}
import json; print(json.dumps(sanitize_output(r), indent=2))