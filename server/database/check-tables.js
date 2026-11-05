
import { pool } from "./db.js";

try {
    const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
    `);

    console.log("Tables in our database:");

    console.table(result.rows);

} catch (error) {
    console.error("Error checking tables:", error.message);

} finally {
    await pool.end();
}
