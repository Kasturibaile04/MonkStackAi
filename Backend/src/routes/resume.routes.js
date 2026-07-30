const express = require("express");
const ResumeRouter = express.Router();
const authMiddleware  = require("../middleware/auth.middleware");
const resumeController = require("../controllers/resume.controller");
const upload = require("../middleware/file.middleware");

/**
 * @route POST /api/resume/
 * @description This route is used to analyze a resume and generate a roast report.
 * @access Private
 * @middleware authMiddleware
 */

ResumeRouter.post("/",authMiddleware.authUser,upload.single("resume"),resumeController.generateResumeController)

/**
 * @route POST /api/resume/:resumeId
 * @description This route is used to analyze a resume and generate a roast report.
 * @access Private
 * @middleware authMiddleware
 */

ResumeRouter.get("/report/:resumeId",authMiddleware.authUser,resumeController.getResumeByIdController)

/**
 * @route GET /api/resume/
 * @description This route is used to get all resumes of a user.
 * @access Private
 * @middleware authMiddleware
 */

ResumeRouter.get("/",authMiddleware.authUser,resumeController.getAllResumesController)

/**
 * @route GET /api/resume/pdf/:resumeId
 * @description This route is used to download a resume report.
 * @access Private
 * @middleware authMiddleware
 */

ResumeRouter.get("/pdf/:resumeId", authMiddleware.authUser, resumeController.generateResumePdfController)

module.exports = ResumeRouter;