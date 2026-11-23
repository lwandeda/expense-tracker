
import express from "express";

// Import category controllers
import {
    createCategory,
    getCategories
} from "../controllers/categoryController.js";

// Import authentication middleware
import { requireAuth } from "../middleware/requireAuth.js";

// Create an Express router
const router = express.Router();

// Protect the route and create a category
router.post("/", requireAuth, createCategory);

// Protect the route and retrieve categories
router.get("/", requireAuth, getCategories);

// Export the router
export default router;
