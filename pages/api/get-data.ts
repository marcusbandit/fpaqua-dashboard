import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parser';
import { CsvRow } from '@/app/types';

const DATA_PATH = '/home/marc/projectdata/fpaqua/dashboard/data/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Missing lat or lng in query parameters.' });
        }

        // Step 1: Find the matching folder
        const folders = fs.readdirSync(DATA_PATH).filter((folder) => {
            return !folder.startsWith('.') && folder.includes('titan');
        });

        const targetFolder = folders.find((folder) => {
            const [folderLat, folderLng] = folder.split('_');
            return parseFloat(folderLat) === parseFloat(lat as string) && parseFloat(folderLng) === parseFloat(lng as string);
        });

        if (!targetFolder) {
            return res.status(404).json({ error: 'No matching folder found for the given coordinates.' });
        }

        // Step 2: Read all CSV files from the 'data' folder
        const dataFolderPath = path.join(DATA_PATH, targetFolder, 'data');
        const csvFiles = fs.readdirSync(dataFolderPath).filter((file) => file.endsWith('.csv'));

        if (csvFiles.length === 0) {
            return res.status(404).json({ error: 'No data found in the coordinate folder.' });
        }

        let combinedData: CsvRow[] = [];

        for (const file of csvFiles) {
            const filePath = path.join(dataFolderPath, file);
            const fileDate = file.replace('.csv', ''); // Extract the date from the filename

            // Parse CSV data asynchronously
            await new Promise<void>((resolve, reject) => {
                const stream = fs.createReadStream(filePath)
                    .pipe(csvParse())
                    .on('data', (row) => {
                        combinedData.push({
                            prediction_category: row.prediction_category,
                            amount: parseFloat(row.amount), // Convert amount to number
                            date: fileDate,
                        });
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });
        }

        // Step 3: Return combined data
        res.status(200).json(combinedData);
    } catch (err) {
        console.error('Error in get-data API:', err);
        res.status(500).json({ error: 'Failed to retrieve data.' });
    }
}
