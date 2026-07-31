const mongoose = require("mongoose");

const roastSchema = new mongoose.Schema(
  {
    section: String,
    quote: String,
    roast: String,
    fix: String
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    resume_text: {
      type: String,
      required: true
    },

    self_description: {
      type: String,
      default: ""
    },

    target_role: {
      type: String,
      default: ""
    },

    tone: {
      type: String,
      enum: ["savage", "mild", "motivational"],
      default: "savage"
    },

    candidate_name: String,

    position_applied: String,

    overall_score: Number,

    opening_jab: String,

    overall_recommendation: String,

    section_roasts: [roastSchema],

    self_description_reality_check: String,

    backhanded_compliment: String,

    real_fixes: [String],

    role_fit: String,

    closing_line: String,

    upgrade_action_verbs: [{ bad: String, good: String }],
    upgrade_quantifiable_data: [{ bad: String, good: String }],
    upgrade_fluff_cut: {
      bad_chips: [String],
      good_chips: [String]
    },
    upgrade_layout_crimes: String,
    upgrade_keyword_injection: [String],
    upgrade_contact_clarity: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Resume", resumeSchema);