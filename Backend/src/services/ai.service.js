require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");
const z = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const { randomUUID } = require("crypto");
const path = require("path");
const fs = require("fs");

const VALID_TONES = ["savage", "mild", "motivational"];

const TONE_GUIDANCE = {
    savage: "Full roast comedian energy. Sharp, sarcastic, unrelenting — but still PG-13 and never cruel about the person's worth.",
    mild: "Light teasing, more playful than savage. Gentle jabs, mostly constructive.",
    motivational: "Encouraging and upbeat overall, with just a few light, friendly jokes mixed in. Focus more on the fixes than the burns."
};

const roastReportJsonSchema = {
    type: "object",
    properties: {
        candidate_name: {
            type: "string",
            description: "Name of the candidate"
        },
        position_applied: {
            type: "string",
            description: "Position applied for"
        },
        overall_score: {
            type: "number",
            description: "Overall score of the resume, 1-10"
        },
        opening_jab: {
            type: "string",
            description: "One punchy line reacting to the resume overall, 1 line"
        },
        overall_recommendation: {
            type: "string",
            description: "Overall recommendation for the resume, 1 is it strong resume or weak resume more details"
        },
        section_roasts: {
            type: "array",
            description: "3-5 section-by-section roasts",
            items: {
                type: "object",
                properties: {
                    section: { type: "string", description: "Section of the resume being roasted, e.g. Summary, Experience" },
                    quote: { type: "string", description: "Exact quote from the resume being roasted" },
                    roast: { type: "string", description: "The roast of the quote, 1-2 lines" },
                    fix: { type: "string", description: "Concrete fix for the quote, 1 line" }
                },
                required: ["section", "quote", "roast", "fix"]
            }
        },
        self_description_reality_check: {
            type: "string",
            description: "Comparison of self description vs what the resume actually shows, max 2 lines"
        },
        backhanded_compliment: {
            type: "string",
            description: "One genuinely positive thing, delivered sarcastically, 1 line"
        },
        real_fixes: {
            type: "array",
            description: "3-5 concrete, actionable fixes for the resume",
            items: { type: "string" }
        },
        role_fit: {
            type: "string",
            description: "Only included when a target role is provided — 1-2 lines on readiness/gaps for that specific role"
        },
        closing_line: {
            type: "string",
            description: "A closing mic-drop line, 1 line"
        },
        upgrade_action_verbs: {
            type: "array",
            description: "1-2 action verb upgrades from the resume",
            items: {
                type: "object",
                properties: {
                    bad: { type: "string" },
                    good: { type: "string" }
                }
            }
        },
        upgrade_quantifiable_data: {
            type: "array",
            description: "1-2 quantifiable data upgrades from the resume",
            items: {
                type: "object",
                properties: {
                    bad: { type: "string" },
                    good: { type: "string" }
                }
            }
        },
        upgrade_fluff_cut: {
            type: "object",
            description: "Fluff words to remove and what to replace them with",
            properties: {
                bad_chips: { type: "array", items: { type: "string" } },
                good_chips: { type: "array", items: { type: "string" } }
            }
        },
        upgrade_layout_crimes: {
            type: "string",
            description: "1 layout issue found in the resume layout"
        },
        upgrade_keyword_injection: {
            type: "array",
            description: "4-5 keywords that should be injected based on target role",
            items: { type: "string" }
        },
        upgrade_contact_clarity: {
            type: "string",
            description: "1 line feedback on contact info clarity in the resume"
        }
    },
    required: [
        "candidate_name",
        "position_applied",
        "overall_score",
        "overall_recommendation",
        "opening_jab",
        "section_roasts",
        "self_description_reality_check",
        "backhanded_compliment",
        "real_fixes",
        "closing_line",
        "upgrade_action_verbs",
        "upgrade_quantifiable_data",
        "upgrade_fluff_cut",
        "upgrade_layout_crimes",
        "upgrade_keyword_injection",
        "upgrade_contact_clarity"
    ]
};

// --- Lazy singleton client ---
// Creating the GoogleGenAI client at module-load time is what caused the
// ACCESS_TOKEN_TYPE_UNSUPPORTED error: if this file gets required before
// dotenv.config() has run anywhere in the app, process.env.GEMINI_API_KEY
// is undefined, the SDK gets an empty-string key, and it silently falls
// back to trying OAuth/ADC-style auth instead of simple API-key auth.
// Initializing on first use (after all requires/config have run) fixes this.
let _ai = null;
function getClient() {
    if (_ai) return _ai;

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY is missing or empty. Check that .env exists in your backend root, " +
            "that dotenv.config() runs before any Gemini calls, and that the variable name matches exactly."
        );
    }

    _ai = new GoogleGenAI({ apiKey });
    return _ai;
}

async function analyzeResume({ resumeText, selfDescription, targetRole = "", tone = "savage" }) {
    if (!resumeText || !resumeText.trim()) {
        throw new Error("resumeText is required to analyze a resume.");
    }

    const ai = getClient();
    const normalizedTone = VALID_TONES.includes(tone) ? tone : "savage";
    const toneGuidance = TONE_GUIDANCE[normalizedTone];

    const MAX_RETRIES = 3;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `You are "Roast Bot" — a resume critic whose style adapts to a requested tone.

TONE
- Requested tone: ${normalizedTone}
- Tone guidance: ${toneGuidance}
- Never mean about protected characteristics (age, race, gender, disability, etc.)
- Never insult the person's worth — only the resume's execution.
- Keep it PG-13 regardless of tone.

TASK
Roast the resume using only real content provided below. Never invent facts.
If a self description is provided, compare it against what the resume actually shows.

${targetRole
                                        ? `A target role was provided: "${targetRole}". Evaluate the resume's readiness for this specific role and include a "role_fit" field with 1-2 lines on gaps or strengths relative to it.`
                                        : `No target role was provided — omit the "role_fit" field entirely.`}

**Resume:** ${resumeText}
**Self-Description:** ${selfDescription || "(not provided)"}

Generate the JSON response matching the schema keys exactly:
1. overall_score: number 1-10.
2. opening_jab: one punchy line.
3. section_roasts (3-5): section, quote, roast, fix.
4. self_description_reality_check: compare self description to resume reality.
5. backhanded_compliment: one comment matching the requested tone.
6. real_fixes (3-5): concrete actionable fixes.
${targetRole ? "7. role_fit: readiness/gaps for the target role.\n8. closing_line: mic-drop sign-off." : "7. closing_line: mic-drop sign-off."}

Keep all text short and crisp. No long paragraphs anywhere.

UPGRADE INTEL (populate every field using ONLY real content from the resume above):
upgrade_action_verbs: Find 2 weak/passive verbs actually used in this resume and provide stronger alternatives. Format: [{bad: "original phrase", good: "upgraded phrase"}].
upgrade_quantifiable_data: Find 2 vague impact statements from this resume and rewrite with invented plausible metrics. Format: [{bad: "Original vague claim", good: "Rewritten with % or numbers"}].
upgrade_fluff_cut: Find 2-3 buzzword/filler phrases in this resume for bad_chips. Suggest specific, provable skill replacements for good_chips.
upgrade_layout_crimes: One specific layout or structure issue you noticed in this resume (e.g., missing summary section, no dates, inconsistent formatting).
upgrade_keyword_injection: 5 ATS keywords missing from this resume that match the target role "${targetRole || 'the applied role'}". Return just the keyword strings.
upgrade_contact_clarity: One specific piece of actionable feedback about the contact section of this resume (missing phone, LinkedIn URL not present, unprofessional email, etc.).`
                            }
                        ]
                    }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: roastReportJsonSchema
                }
            });

            return JSON.parse(response.text);

        } catch (error) {
            lastError = error;
            const isRetryable =
                error.status === "UNAVAILABLE" ||
                error.status === "RESOURCE_EXHAUSTED" ||
                (error.message && (
                    error.message.includes("UNAVAILABLE") ||
                    error.message.includes("503") ||
                    error.message.includes("overloaded") ||
                    error.message.includes("429")
                ));

            if (isRetryable && attempt < MAX_RETRIES) {
                const delay = 1000 * Math.pow(2, attempt - 1);
                console.warn(`Gemini API unavailable (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }

    throw lastError;
}

async function generatePdfFromHtml(html) {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const tmpDir = path.join(__dirname, "..", "tmp");
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const fileName = `resume-${randomUUID()}.pdf`;
        const filePath = path.join(tmpDir, fileName);

        await page.pdf({ path: filePath, format: "A4" });
        return filePath;
    } finally {
        await browser.close();
    }
}

async function generateResumepdf({ resume, jobDescription, targetRole }) {
    const ai = getClient();

    const resumePdfSchema = z.object({
        html: z.string().describe(
            "The HTML content of the resume which can be converted to PDF using puppeteer"
        )
    });

    const prompt = `Generate a resume in HTML format that can be converted to PDF using puppeteer.
    Resume: ${resume}
    Target Role: ${targetRole || "(not specified)"}
    Job Description: ${jobDescription}

    The response should be in the form of JSON with the key "html" which contains the HTML content of the resume.`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema)
        }
    });

    const jsonContent = JSON.parse(response.text);
    const pdfFilePath = await generatePdfFromHtml(jsonContent.html);
    return pdfFilePath;
}

module.exports = { analyzeResume, generateResumepdf, generateUpgradeIntel };

// ---------------------------------------------------------------------------
// Generates ONLY the 6 upgrade blocks for an already-saved resume.
// Called when a report exists in DB but was created before upgrade fields were added.
// ---------------------------------------------------------------------------
async function generateUpgradeIntel({ resumeText, targetRole = "" }) {
    const ai = getClient();

    const upgradeSchema = {
        type: "object",
        properties: {
            upgrade_action_verbs: {
                type: "array",
                items: { type: "object", properties: { bad: { type: "string" }, good: { type: "string" } } }
            },
            upgrade_quantifiable_data: {
                type: "array",
                items: { type: "object", properties: { bad: { type: "string" }, good: { type: "string" } } }
            },
            upgrade_fluff_cut: {
                type: "object",
                properties: {
                    bad_chips: { type: "array", items: { type: "string" } },
                    good_chips: { type: "array", items: { type: "string" } }
                }
            },
            upgrade_layout_crimes: { type: "string" },
            upgrade_keyword_injection: { type: "array", items: { type: "string" } },
            upgrade_contact_clarity: { type: "string" }
        },
        required: [
            "upgrade_action_verbs",
            "upgrade_quantifiable_data",
            "upgrade_fluff_cut",
            "upgrade_layout_crimes",
            "upgrade_keyword_injection",
            "upgrade_contact_clarity"
        ]
    };

    const prompt = `You are a professional resume coach. Analyse the resume below and return the 6 upgrade fields.

Resume:
${resumeText}

Target Role: ${targetRole || "(not specified)"}

Instructions — use ONLY real content from the resume above:
1. upgrade_action_verbs: Find 2 weak/passive verbs actually used in this resume and provide stronger alternatives. [{bad, good}]
2. upgrade_quantifiable_data: Find 2 vague impact statements and rewrite with realistic metrics. [{bad, good}]
3. upgrade_fluff_cut: Find 2-3 buzzword/filler phrases (bad_chips) and suggest specific, provable replacements (good_chips).
4. upgrade_layout_crimes: One specific structural/layout issue found in this resume (e.g. missing summary, no dates, inconsistent bullet style).
5. upgrade_keyword_injection: 5 ATS keywords missing from this resume relevant to the target role. Just the keyword strings.
6. upgrade_contact_clarity: One specific actionable piece of feedback on the contact section (missing phone, no LinkedIn, etc.).

Return compact JSON matching the schema. No long paragraphs.`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: upgradeSchema
        }
    });

    return JSON.parse(response.text);
}