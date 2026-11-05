
// ==========================================
// EXPENSE TRACKER - MAIN SERVER
// ==========================================

// 1. Load environment variables first
import "dotenv/config";

// 2. Import required packages
import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// 3. Import database connection
import {
    pool,
    testDatabaseConnection
} from "./database/db.js";

// 4. Import authentication routes
import authRoutes from "./routes/authRoutes.js";

// 4. Create the Express application
const app = express();

// 5. Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 6. Set the server port
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

// Add security-related HTTP headers
app.use(helmet());

// Allow Express to read JSON request bodies
app.use(express.json());

// Allow Express to read form submissions
app.use(express.urlencoded({ extended: true }));

// ==========================================
// FRONTEND
// ==========================================

// Serve frontend files from the client folder
app.use(express.static(path.join(__dirname, "../client")));

// ==========================================
// API ROUTES
// ==========================================

// Authentication routes
app.use("/api/auth", authRoutes);

// Check whether the backend and database are working
app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            success: true,
            message: "Expense Tracker API is running.",
            database: "Connected",
            serverTime: result.rows[0].now
        });

    } catch (error) {
        console.error("Health check failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });
    }
});

// ==========================================
// ERROR HANDLING
// ==========================================

// Handle API routes that do not exist
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// Handle unexpected application errors
app.use((error, req, res, next) => {
    console.error("Server error:", error);

    res.status(500).json({
        success: false,
        message: "An unexpected server error occurred."
    });
});

// ==========================================
// START THE SERVER
// ==========================================

async function startServer() {
    // Test the database before starting the server
    const databaseConnected = await testDatabaseConnection();

    if (!databaseConnected) {
        console.error("Server startup cancelled: database unavailable.");
        await pool.end();
        process.exitCode = 1;
        return;
    }

    app.listen(PORT, () => {
        console.log(`Expense Tracker server running on port ${PORT}`);
        console.log(`Local URL: http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
}

// Start our application
startServer();

