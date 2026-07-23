const {Router} = require("express");
const authController = require("../controllers/auth.controller");
const authRoutes = Router();
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @routes POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRoutes.post("/register", authController.registerUserContoller);

/**
 * @routes POST /api/auth/login
 * @desc Login a user with email and password
 * @access Public
 */
authRoutes.post("/login", authController.loginUserContoller);

/**
 * @routes GET /api/auth/logout
 * @desc Logout a user
 * @access Private
 */
authRoutes.get("/logout", authController.logoutUserContoller);

/**
 * @route GET /api/auth/get-me
 * @desc Get current user
 * @access Private
 */
authRoutes.get("/get-me", authMiddleware.authUser, authController.getCurrentUser);




module.exports = authRoutes;