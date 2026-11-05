
import bcrypt from "bcryptjs";
import { pool } from "../database/db.js";

// ==========================================
// USER REGISTRATION
// ==========================================

export async function registerUser(req, res, next) {
    try {
        // 1. Get registration information
        const { name, email, password } = req.body ?? {};

        // 2. Validate required fields
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide your name, email and password."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        // 3. Validate the name
        if (!cleanName || cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name must contain between 1 and 100 characters."
            });
        }

        // 4. Validate the email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            cleanEmail.length > 255 ||
            !emailPattern.test(cleanEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        // 5. Validate the password
        if (
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and no more than 72 bytes."
            });
        }

        // 6. Check whether the email already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [cleanEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // 7. Hash the password
        const passwordHash = await bcrypt.hash(password, 12);

        // 8. Save the new user in PostgreSQL
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [cleanName, cleanEmail, passwordHash]
        );

        // 9. Return the successful response
        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: result.rows[0]
        });

    } catch (error) {
        // Handle duplicate emails, including simultaneous registrations
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Pass unexpected errors to Express error handling
        next(error);
    }
}
