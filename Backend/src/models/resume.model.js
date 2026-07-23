const mongoose = require("mongoose");

/**
 * Resume Schema
 *
 * User Inputs
 * - resume_text <- string
 * - self_description <- string
 * - tone <- string
 * - target_role <- string
 *
 * AI Outputs
 * - overall_summary <- string
 * - resume_score <- number
 * - ats_score <- number
 * - match_score <- number
 * - strengths <- array of strings
 * - weaknesses <- array of strings
 * - missing_skills <- array of strings
 * - action_items <- array of strings
 * - sections <- array of objects
 * - interview_questions <- array of objects
 * - preparation <- array of objects
 */

const sectionSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      enum: [
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "awards",
        "publications",
        "patents",
        "licenses",
        "other",
      ],
      required: true,
    },

    quote: {
      type: String,
      required: true,
    },

    roast_title: {
      type: String,
      required: true,
    },

    roast: {
      type: String,
      required: true,
    },

    fix: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const preparationSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
    },

    focus: {
      type: String,
      required: true,
    },

    schedule: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    // ---------------- USER INPUT ----------------

    resume_text: {
      type: String,
      required: true,
    },

    self_description: {
      type: String,
      default: "",
    },

    target_role: {
      type: String,
      default: "",
    },

    tone: {
      type: String,
      enum: ["savage", "mild", "motivational"],
      default: "savage",
    },



    // ---------------- AI ANALYSIS ----------------

    overall_summary: {
      type: String,
      required: true,
    },

    resume_score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    ats_score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    match_score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    strengths: [
      {
        type: String,
      },
    ],

    weaknesses: [
      {
        type: String,
      },
    ],

    missing_skills: [
      {
        type: String,
      },
    ],

    action_items: [
      {
        type: String,
      },
    ],

    sections: [sectionSchema],

    interview_questions: [interviewQuestionSchema],

    preparation: [preparationSchema],

    final_verdict: {
      type: String,
      required: true,
    },

    // ---------------- STATUS ----------------

    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);