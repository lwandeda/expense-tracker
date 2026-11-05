
import { pool } from "./db.js";
import fs from "node:fs/promises";

// Read our SQL file
const schema = await fs.readFile(
    new URL("./schema.sql", import.meta.url),
    "utf8"
);

// Execute the SQL commands
try {
    await pool.query(schema);

    console.log("Database tables created successfully!");

} catch (error) {
    console.error("Failed to create tables:", error.message);

} finally {
    await pool.end();
}
