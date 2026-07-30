const pdfParse = require("pdf-parse");
const fs = require("fs");
const { analyzeResume, generateResumepdf } = require("../services/ai.service");
const ResumeModel = require("../models/resume.model");

/**
 * @description This function is used to generate a resume roast report.
 * @access Private
 * @middleware authMiddleware
 */
async function generateResumeController(req, res) {
    try {
        let resumeContent = "";

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume PDF is required."
            });
        }

        const pdfData = await pdfParse(req.file.buffer);
        resumeContent = pdfData.text.trim();

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

/**
 * @description This function generates a downloadable PDF version of a resume report.
 * @access Private
 * @middleware authMiddleware
 */
async function generateResumePdfController(req, res) {
    const { resumeId } = req.params;
    try {
        const resumeReport = await ResumeModel.findById(resumeId);
        if (!resumeReport) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        const { resume, jobDescription, targetRole } = resumeReport;

        const pdfFilePath = await generateResumepdf({
            resume: resume,
            jobDescription: jobDescription,
            targetRole: targetRole
        });

        return res.download(pdfFilePath, "resume.pdf", (err) => {
            fs.unlink(pdfFilePath, () => {});
            if (err) {
                console.error("Error sending PDF:", err);
            }
        });

    } catch (error) {
        console.error("Resume Controller Error:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate resume PDF",
            error: error.message
        });
    }
}

module.exports = {
    generateResumeController,
    getResumeByIdController,
    getAllResumesController,
    generateResumePdfController
};