const fs = require("fs");
const { extractPdfText } = require("../utils/pdfExtract");
const { analyzeResume, generateResumepdf } = require("../services/ai.service");
const ResumeModel = require("../models/resume.model");

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
            resumeContent = await extractPdfText(req.file.buffer);
        } catch (parseErr) {
            return res.status(400).json({
                success: false,
                message: parseErr.message
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
            resumeContent = await extractPdfText(req.file.buffer);
        } catch (parseErr) {
            return res.status(400).json({
                success: false,
                message: parseErr.message
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