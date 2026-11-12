
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

// ==========================================
// USER LOGIN
// ==========================================

export async function loginUser(req, res, next) {
    try {
        // 1. Get login information
        const { email, password } = req.body ?? {};

        // 2. Validate required fields
        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide your email and password."
            });
        }

        // 3. Clean the email
        const cleanEmail = email.trim().toLowerCase();

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
            password.length === 0 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // 6. Find the user in PostgreSQL
        const result = await pool.query(
            `SELECT id, name, email, password_hash
             FROM users
             WHERE email = $1`,
            [cleanEmail]
        );

        // 7. Check whether the user exists
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        // 8. Compare the entered password with the stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // 9. Regenerate the session ID for security
        await new Promise((resolve, reject) => {
            req.session.regenerate((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // 10. Store the authenticated user's information
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        // 11. Save the session in PostgreSQL
        await new Promise((resolve, reject) => {
            req.session.save((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // 12. Return successful login response
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: req.session.user
        });

    } catch (error) {
        next(error);
    }
}
// 13. Log out the user
export const logoutUser = (req, res, next) => {

    // Destroy the user's session
    req.session.destroy((error) => {

        // Handle errors
        if (error) {
            return next(error);
        }

        // Clear the session cookie
        res.clearCookie("connect.sid");

        // Return successful logout response
        return res.status(200).json({
            success: true,
            message: "Logout successful."
        });
    });
};