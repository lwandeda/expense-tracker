
import express from "express";

import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController.js";

// Import authentication middleware
import { requireAuth } from "../middleware/requireAuth.js";

// Create an Express router
const router = express.Router();

// Protect the route and create a category
router.post("/", requireAuth, createCategory);

// Protect the route and retrieve categories
router.get("/", requireAuth, getCategories);

// Protect the route and update a category
router.put("/:id", requireAuth, updateCategory);

// Protect the route and delete a category
router.delete("/:id", requireAuth, deleteCategory);

// Export the router
export default router;
