
// Import the PostgreSQL package
import pg from "pg";

// Import dotenv to read environment variables
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get the Pool class from PostgreSQL
const { Pool } = pg;

// Create a connection pool
export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Handle unexpected database connection errors
pool.on("error", (error) => {
    console.error("Unexpected database error:", error.message);
});

// Test the database connection
export async function testDatabaseConnection() {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("Database connected successfully!");
        console.log("Database server time:", result.rows[0].now);

        return true;

    } catch (error) {
        console.error("Database connection failed:", error.message);

        return false;
    }
}

