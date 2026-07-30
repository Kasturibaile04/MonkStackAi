const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");
const z = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const { randomUUID } = require("crypto");
const path = require("path");
const fs = require("fs");

const ai = new GoogleGenAI({
    apiKey: (process.env.GEMINI_API_KEY || "").trim()
});

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
        "closing_line"
    ]
};

async function analyzeResume({ resumeText, selfDescription, targetRole = "", tone = "savage" }) {
    if (!resumeText || !resumeText.trim()) {
        throw new Error("resumeText is required to analyze a resume.");
    }

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

Keep all text short and crisp. No long paragraphs anywhere.`
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
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema)
        }
    });

    const jsonContent = JSON.parse(response.text);
    const pdfFilePath = await generatePdfFromHtml(jsonContent.html);
    return pdfFilePath;
}

module.exports = { analyzeResume, generateResumepdf };