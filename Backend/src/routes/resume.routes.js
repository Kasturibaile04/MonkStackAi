const express = require("express");
const ResumeRouter = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const resumeController = require("../controllers/resume.controller");
const upload = require("../middleware/file.middleware");

/**
 * @route POST /api/resume/
 * @description This route is used to analyze a resume and generate a roast report.
 * @access Private
 * @middleware authMiddleware
 */

ResumeRouter.post("/", authMiddleware.authUser, upload.single("resume"), resumeController.generateResumeController)

/**
 * @route POST /api/resume/:resumeId
 * @description This route is used to analyze a resume and generate a roast report.
 * @access Private
 * @middleware authMiddleware
 */

ResumeRouter.get("/report/:resumeId", authMiddleware.authUser, resumeController.getResumeByIdController)

/**
 * @route GET /api/resume/
 * @description This route is used to get all resumes of a user.
 * @access Private
 * @middleware authMiddleware
 */

ResumeRouter.get("/", authMiddleware.authUser, resumeController.getAllResumesController)


ResumeRouter.post("/upgrade", authMiddleware.authUser, upload.single("resume"), resumeController.upgradeResumeController)

ResumeRouter.post("/intel/:resumeId", authMiddleware.authUser, resumeController.generateUpgradeIntelController)

module.exports = ResumeRouter;