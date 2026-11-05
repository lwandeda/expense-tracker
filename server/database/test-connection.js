
// Import our database connection pool
import { pool } from "./db.js";

// Test the connection to PostgreSQL
async function testConnection() {
    try {
        // Ask PostgreSQL to return a simple message
        const result = await pool.query("SELECT NOW()");

        // Display a success message
        console.log("Successfully connected to PostgreSQL!");

        // Display the database server's current time
        console.log("Database time:", result.rows[0].now);

    } catch (error) {
        // Display an error if the connection fails
        console.error("Database connection failed:", error.message);

    } finally {
        // Close the connection pool after testing
        await pool.end();
    }
}

// Run the test function
testConnection();
