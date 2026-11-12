import express from "express";

// Import authentication controllers
import {
    registerUser,
    loginUser,
    logoutUser
} from "../controllers/authController.js";

// Create an Express router
const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Log in an existing user
router.post("/login", loginUser);

// Log out the user
router.post("/logout", logoutUser);

// Export the router
export default router;