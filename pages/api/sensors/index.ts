import sqlite3 from "sqlite3";
import { open } from "sqlite";
import type { NextApiRequest, NextApiResponse } from "next";

// Open SQLite database
async function openDB() {
    return open({
        filename: '/mnt/datamerd01/database/sensors.db',
        driver: sqlite3.Database,
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { mode } = req.query;

    const db = await openDB();

    try {
        if (mode === "sensors") {
            // Fetch list of tables in the database
            const tableNames = await db.all(`SELECT name FROM sqlite_master WHERE type='table'`);
            
            const sensorSet = new Set<string>();

            // Extract unique sensor names and exclude "sqlite"
            tableNames.forEach((row) => {
                const parts = row.name.split("_");
                if (parts.length > 1 && parts[0] !== "sqlite") {
                    sensorSet.add(parts[0]); // Add the sensor name
                }
            });

            res.status(200).json(Array.from(sensorSet).sort((a, b) => a.localeCompare(b)));
            return;
        }

        // If mode is not specified, return an error
        res.status(400).json({ error: "Missing or invalid mode parameter" });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Failed to fetch sensors list" });
    } finally {
        await db.close();
    }
}
