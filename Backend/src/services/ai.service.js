const Groq = require("groq-sdk");
const puppeteer = require("puppeteer");
const { randomUUID } = require("crypto");
const path = require("path");
const fs = require("fs");

const VALID_TONES = ["savage", "mild", "motivational"];
const MODEL = "llama-3.3-70b-versatile";

const TONE_GUIDANCE = {
    savage: "Full roast comedian energy. Sharp, sarcastic, unrelenting — but still PG-13 and never cruel about the person's worth.",
    mild: "Light teasing, more playful than savage. Gentle jabs, mostly constructive.",
    motivational: "Encouraging and upbeat overall, with just a few light, friendly jokes mixed in. Focus more on the fixes than the burns."
};

// --- Lazy singleton client ---
// Same reasoning as before: initialize on first use, after env vars
// have definitely been injected, not at module-load time.
let _groq = null;
function getClient() {
    if (_groq) return _groq;

    const apiKey = (process.env.GROQ_API_KEY || "").trim();
    if (!apiKey) {
        throw new Error(
            "GROQ_API_KEY is missing or empty. Add it to your .env " +
            "(get a free key at https://console.groq.com/keys)."
        );
    }

    _groq = new Groq({ apiKey });
    return _groq;
}

/**
 * Groq's chat completion API supports JSON mode (response_format:
 * { type: "json_object" }) but — unlike Gemini's responseSchema —
 * it does not enforce a specific schema server-side. So we describe
 * the exact shape we want in the prompt itself, and validate/parse
 * the JSON on our side.
 */
async function analyzeResume({ resumeText, selfDescription, targetRole = "", tone = "savage" }) {
    if (!resumeText || !resumeText.trim()) {
        throw new Error("resumeText is required to analyze a resume.");
    }

    const groq = getClient();
    const normalizedTone = VALID_TONES.includes(tone) ? tone : "savage";
    const toneGuidance = TONE_GUIDANCE[normalizedTone];

    const schemaDescription = `Return ONLY valid JSON (no markdown, no code fences, no commentary) matching exactly this shape:
{
  "candidate_name": string,
  "position_applied": string,
  "overall_score": number (1-10),
  "opening_jab": string (1 line),
  "overall_recommendation": string,
  "section_roasts": [ { "section": string, "quote": string, "roast": string, "fix": string } ] (3-5 items),
  "self_description_reality_check": string (max 2 lines),
  "backhanded_compliment": string (1 line),
  "real_fixes": [string] (3-5 items),
  ${targetRole ? '"role_fit": string (1-2 lines),' : ""}
  "closing_line": string (1 line),
  "upgrade_action_verbs": [ { "bad": string, "good": string } ] (1-2 items),
  "upgrade_quantifiable_data": [ { "bad": string, "good": string } ] (1-2 items),
  "upgrade_fluff_cut": { "bad_chips": [string], "good_chips": [string] },
  "upgrade_layout_crimes": string,
  "upgrade_keyword_injection": [string] (4-5 items),
  "upgrade_contact_clarity": string
}`;

    const prompt = `You are "Roast Bot" — a resume critic whose style adapts to a requested tone.

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

UPGRADE INTEL (populate every field using ONLY real content from the resume above):
upgrade_action_verbs: Find 2 weak/passive verbs actually used in this resume and provide stronger alternatives.
upgrade_quantifiable_data: Find 2 vague impact statements from this resume and rewrite with invented plausible metrics.
upgrade_fluff_cut: Find 2-3 buzzword/filler phrases in this resume for bad_chips. Suggest specific, provable skill replacements for good_chips.
upgrade_layout_crimes: One specific layout or structure issue you noticed in this resume.
upgrade_keyword_injection: 5 ATS keywords missing from this resume that match the target role "${targetRole || 'the applied role'}".
upgrade_contact_clarity: One specific piece of actionable feedback about the contact section.

Keep all text short and crisp. No long paragraphs anywhere.

${schemaDescription}`;

    const MAX_RETRIES = 3;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const completion = await groq.chat.completions.create({
                model: MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.8
            });

            const text = completion.choices[0].message.content;
            return JSON.parse(text);

        } catch (error) {
            lastError = error;
            const isRetryable =
                error.status === 429 ||
                error.status === 503 ||
                (error.message && (
                    error.message.includes("rate_limit") ||
                    error.message.includes("503") ||
                    error.message.includes("overloaded")
                ));

            if (isRetryable && attempt < MAX_RETRIES) {
                const delay = 1000 * Math.pow(2, attempt - 1);
                console.warn(`Groq API unavailable (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms...`);
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
    const groq = getClient();

    const prompt = `Generate a resume in HTML format that can be converted to PDF using puppeteer.
Resume: ${resume}
Target Role: ${targetRole || "(not specified)"}
Job Description: ${jobDescription}

Return ONLY valid JSON (no markdown, no code fences) matching exactly this shape:
{ "html": string }
Where "html" contains the full HTML content of the upgraded resume.`;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
    });

    const jsonContent = JSON.parse(completion.choices[0].message.content);
    const pdfFilePath = await generatePdfFromHtml(jsonContent.html);
    return pdfFilePath;
}

async function generateUpgradeIntel({ resumeText, targetRole = "" }) {
    const groq = getClient();

    const prompt = `You are a professional resume coach. Analyse the resume below and return the 6 upgrade fields.

Resume:
${resumeText}

Target Role: ${targetRole || "(not specified)"}

Instructions — use ONLY real content from the resume above:
1. upgrade_action_verbs: Find 2 weak/passive verbs actually used in this resume and provide stronger alternatives. [{bad, good}]
2. upgrade_quantifiable_data: Find 2 vague impact statements and rewrite with realistic metrics. [{bad, good}]
3. upgrade_fluff_cut: Find 2-3 buzzword/filler phrases (bad_chips) and suggest specific, provable replacements (good_chips).
4. upgrade_layout_crimes: One specific structural/layout issue found in this resume.
5. upgrade_keyword_injection: 5 ATS keywords missing from this resume relevant to the target role.
6. upgrade_contact_clarity: One specific actionable piece of feedback on the contact section.

Return ONLY valid JSON (no markdown, no code fences) matching exactly this shape:
{
  "upgrade_action_verbs": [ { "bad": string, "good": string } ],
  "upgrade_quantifiable_data": [ { "bad": string, "good": string } ],
  "upgrade_fluff_cut": { "bad_chips": [string], "good_chips": [string] },
  "upgrade_layout_crimes": string,
  "upgrade_keyword_injection": [string],
  "upgrade_contact_clarity": string
}
No long paragraphs.`;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
    });

    return JSON.parse(completion.choices[0].message.content);
}

module.exports = { analyzeResume, generateResumepdf, generateUpgradeIntel };