
import { pool } from "../database/db.js";

// ==========================================
// CREATE CATEGORY
// ==========================================

export async function createCategory(req, res, next) {
    try {
        // 1. Get category information from the request
        const { name, type } = req.body ?? {};

        // 2. Validate the category name
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a category name."
            });
        }

        // 3. Clean the category name
        const cleanName = name.trim();

        // 4. Validate the category name length
        if (cleanName.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Category name cannot exceed 50 characters."
            });
        }

        // 5. Validate the category type
        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Category type must be income or expense."
            });
        }

        // 6. Get the logged-in user's ID
        const userId = req.session.user.id;

        // 7. Save the category in PostgreSQL
        const result = await pool.query(
            `INSERT INTO categories (user_id, name, type)
             VALUES ($1, $2, $3)
             RETURNING id, user_id, name, type, created_at`,
            [userId, cleanName, type]
        );

        // 8. Return the successful response
        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            category: result.rows[0]
        });

    } catch (error) {
        // Handle duplicate categories
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This category already exists."
            });
        }

        // Pass unexpected errors to Express error handling
        next(error);
    }
}

// ==========================================
// GET ALL CATEGORIES
// ==========================================

export async function getCategories(req, res, next) {
    try {
        // 1. Get the logged-in user's ID
        const userId = req.session.user.id;

        // 2. Retrieve only this user's categories
        const result = await pool.query(
            `SELECT id, user_id, name, type, created_at
             FROM categories
             WHERE user_id = $1
             ORDER BY name ASC`,
            [userId]
        );

        // 3. Return the categories
        return res.status(200).json({
            success: true,
            categories: result.rows
        });

    } catch (error) {
        // Pass unexpected errors to Express error handling
        next(error);
    }
}

 // ==========================================
// UPDATE CATEGORY
// ==========================================

export async function updateCategory(req, res, next) {
    try {
        // 1. Get the category ID from the URL
        const categoryId = req.params.id;

        // 2. Get the updated category information
        const { name, type } = req.body ?? {};

        // 3. Validate the category name
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a category name."
            });
        }

        // 4. Clean the category name
        const cleanName = name.trim();

        // 5. Validate the category name length
        if (cleanName.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Category name cannot exceed 50 characters."
            });
        }

        // 6. Validate the category type
        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Category type must be income or expense."
            });
        }

        // 7. Get the logged-in user's ID
        const userId = req.session.user.id;

        // 8. Update only this user's category
        const result = await pool.query(
            `UPDATE categories
             SET name = $1, type = $2
             WHERE id = $3 AND user_id = $4
             RETURNING id, user_id, name, type, created_at`,
            [cleanName, type, categoryId, userId]
        );

        // 9. Check whether the category exists
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        // 10. Return the updated category
        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            category: result.rows[0]
        });

    } catch (error) {
        // Handle duplicate categories
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This category already exists."
            });
        }

        // Pass unexpected errors to Express error handling
        next(error);
    }
}

 // ==========================================
// DELETE CATEGORY
// ==========================================


export async function deleteCategory(req, res, next) {
    try {
        // 1. Get the category ID from the URL
        const categoryId = req.params.id;

        // 2. Validate the category ID
        if (!/^\d+$/.test(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID."
            });
        }

        // 3. Get the logged-in user's ID
        const userId = req.session.user.id;

        // 4. Delete only this user's category
        const result = await pool.query(
            `DELETE FROM categories
             WHERE id = $1 AND user_id = $2
             RETURNING id, name, type`,
            [categoryId, userId]
        );

        // 5. Check whether the category exists
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        // 6. Return the successful response
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully.",
            category: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
}

// 1. Get the category ID from the URL
const categoryId = req.params.id;

// 2. Validate the category ID
if (!/^\d+$/.test(categoryId)) {
    return res.status(400).json({
        success: false,
        message: "Invalid category ID."
    });
}