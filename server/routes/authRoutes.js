
import express from "express";

// Import the registration controller
import { registerUser } from "../controllers/authController.js";

// Create an Express router
const router = express.Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register a new user
router.post("/register", registerUser);

// Export the router
export default router;
