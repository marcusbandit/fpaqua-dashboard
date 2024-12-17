import sqlite3 from "sqlite3";
import { open } from "sqlite";
import type { NextApiRequest, NextApiResponse } from "next";

// Open SQLite database
async function openDB() {
    return open({
        filename: '/mnt/datamerd01/database/sensors.db', // Update this path
        driver: sqlite3.Database,
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { sensor, date, columns } = req.query;

    if (!sensor || typeof sensor !== "string") {
        res.status(400).json({ error: "Missing or invalid sensor parameter" });
        return;
    }

    const db = await openDB();

    try {
        if (!date) {
            // *** Case 1: No date provided - Return list of dates ***
            const tableNames = await db.all(
                `SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '${sensor}_%'`
            );

            const dates = tableNames
                .map((row) => {
                    const match = row.name.match(/_(\d{8})$/); // Extract YYYYMMDD
                    return match ? match[1] : null;
                })
                .filter(Boolean) // Remove invalid matches
                .sort((b, a) => b.localeCompare(a)) // Sort descending
                .slice(-14); // Get newest 14 dates

            res.status(200).json(dates);
        } else {
            // *** Case 2: Date provided - Return data for that date ***
            const tableName = `${sensor}_${date}`;

            // Determine which columns to select
            const selectedColumns = columns
                ? (columns as string).split(",").map((col) => col.trim()).join(", ")
                : "prediction_category, SUM(amount) AS total"; // Default columns

            try {
                const rows = await db.all(
                    `SELECT ${selectedColumns} 
                     FROM ${tableName} 
                     GROUP BY prediction_category`
                );

                // Format results if default columns are used
                if (!columns) {
                    const formattedResults = rows.map((row) => ({
                        prediction_category: row.prediction_category,
                        amount: row.total || 0,
                    }));
                    res.status(200).json(formattedResults);
                } else {
                    res.status(200).json(rows); // Return raw results for custom columns
                }
            } catch (err) {
                if (err instanceof Error) {
                    console.warn(`Skipping table ${tableName}:`, err.message);
                }
                res.status(500).json({ error: `Failed to fetch data for ${tableName}` });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Unexpected server error" });
    } finally {
        await db.close();
    }
}
