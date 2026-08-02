const pdfParse = require("pdf-parse");
const fs = require("fs");
const { analyzeResume, generateResumepdf } = require("../services/ai.service");
const ResumeModel = require("../models/resume.model");

/**
 * @description Safely parses a PDF buffer into text.
 * pdf-parse (via pdf.js) throws low-level parser errors like
 * "Command token too long: 128" when a PDF's internal structure
 * is malformed/corrupted. We catch that here and turn it into a
 * clean, user-facing message instead of letting it bubble up as
 * an unhandled 500.
 */
async function safeParsePdf(buffer) {
    try {
        const pdfData = await pdfParse(buffer);
        return pdfData.text.trim();
    } catch (err) {
        console.error("PDF parse failed:", err.message);
        const parseError = new Error(
            "This PDF couldn't be read. It may be corrupted, scanned as an image, " +
            "or exported by a tool that produces non-standard PDF structure. " +
            "Try re-exporting it (e.g. Print to PDF from your browser) and upload again."
        );
        parseError.isPdfParseError = true;
        throw parseError;
    }
}

/**
 * @description This function is used to generate a resume roast report.
 * @access Private
 * @middleware authMiddleware
 */
async function generateResumeController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume PDF is required."
            });
        }

        let resumeContent;
        try {
            resumeContent = await safeParsePdf(req.file.buffer);
        } catch (parseErr) {
            return res.status(400).json({
                success: false,
                message: parseErr.message
            });
        }

        if (!resumeContent) {
            return res.status(400).json({
                success: false,
                message: "Could not extract text from the PDF."
            });
        }

        const {
            selfDescription = "",
            targetRole = "",
            tone = "savage"
        } = req.body;

        const resumeRoastByAi = await analyzeResume({
            resumeText: resumeContent,
            selfDescription,
            targetRole,
            tone
        });

        const resumeReport = await ResumeModel.create({
            user: req.user.id,
            resume_text: resumeContent,
            self_description: selfDescription,
            target_role: targetRole,
            tone,
            ...resumeRoastByAi
        });

        return res.status(201).json({
            success: true,
            message: "Resume analyzed successfully",
            resumeReport
        });

    } catch (error) {
        console.error("Resume Controller Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to analyze resume",
            error: error.message
        });
    }
}

/**
 * @description This function is used to get a resume by its ID.
 * @access Private
 * @middleware authMiddleware
 */
async function getResumeByIdController(req, res) {
    const { resumeId } = req.params;
    try {
        const resumeReport = await ResumeModel.findById(resumeId);
        return res.status(200).json({
            success: true,
            message: "Resume analyzed successfully",
            resumeReport
        });
    } catch (error) {
        console.error("Resume Controller Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to analyze resume",
            error: error.message
        });
    }
}

/**
 * @description This function is used to get all resumes of a user.
 * @access Private
 * @middleware authMiddleware
 */
async function getAllResumesController(req, res) {
    try {
        const resumes = await ResumeModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume_text -self_description -target_role -__v -updatedAt");

        return res.status(200).json({
            success: true,
            message: "Resumes fetched successfully",
            resumes
        });
    } catch (error) {
        console.error("Resume Controller Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch resumes",
            error: error.message
        });
    }
}

async function upgradeResumeController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume PDF is required."
            });
        }

        let resumeContent;
        try {
            resumeContent = await safeParsePdf(req.file.buffer);
        } catch (parseErr) {
            return res.status(400).json({
                success: false,
                message: parseErr.message
            });
        }

        if (!resumeContent) {
            return res.status(400).json({
                success: false,
                message: "Could not extract text from the PDF."
            });
        }

        const {
            jobDescription = "",
            targetRole = ""
        } = req.body;

        const pdfFilePath = await generateResumepdf({
            resume: resumeContent,
            jobDescription,
            targetRole
        });

        // Set appropriate headers for the response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="upgraded-resume.pdf"');

        return res.download(pdfFilePath, "upgraded-resume.pdf", (err) => {
            fs.unlink(pdfFilePath, () => { });
            if (err) {
                console.error("Error sending PDF:", err);
            }
        });

    } catch (error) {
        console.error("Upgrade Controller Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to upgrade resume",
            error: error.message
        });
    }
}

async function generateUpgradeIntelController(req, res) {
    const { resumeId } = req.params;

    try {
        const resumeReport = await ResumeModel.findById(resumeId);
        if (!resumeReport) {
            return res.status(404).json({ success: false, message: "Resume not found" });
        }

        // Fetch just the upgrade intel from Gemini
        const upgradeIntel = await require("../services/ai.service").generateUpgradeIntel({
            resumeText: resumeReport.resume_text,
            targetRole: resumeReport.target_role
        });

        // Patch the MongoDB document
        Object.assign(resumeReport, upgradeIntel);
        await resumeReport.save();

        return res.status(200).json({
            success: true,
            message: "Upgrade intel generated successfully",
            resumeReport
        });
    } catch (error) {
        console.error("Upgrade Intel Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate upgrade intel",
            error: error.message
        });
    }
}

module.exports = {
    generateResumeController,
    getResumeByIdController,
    getAllResumesController,
    upgradeResumeController,
    generateUpgradeIntelController
};