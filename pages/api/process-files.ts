import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import csv from 'csv-parser';

const baseDirectory = '/mnt/deepsea1/FPAQUA/yolo_output/';
const outputDirectory = '/home/marc/projectdata/fpaqua/dashboard/data/';
const logDirectory = '/home/marc/projectdata/fpaqua/dashboard/logs/';

// Cache to keep track of processed files
const processedFilesCache = new Set<string>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Starting smart preprocessing...');
    try {
        await ensureDirectoryExists(outputDirectory);
        await processDirectory(baseDirectory);
        res.status(200).json({ message: 'Preprocessing completed successfully' });
    } catch (error) {
        console.error('Error during preprocessing:', error);
        res.status(500).json({ error: 'Error during preprocessing' });
    }
}

async function ensureDirectoryExists(directory: string) {
    if (!fs.existsSync(directory)) {
        await fs.promises.mkdir(directory, { recursive: true });
        console.log(`Created directory: ${directory}`);
    }
}

async function processDirectory(dir: string) {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.isDirectory()) {
            if (file === '.ipynb_checkpoints') {
                console.log(`Skipping .ipynb_checkpoints directory: ${filePath}`);
                continue; // Skip .ipynb_checkpoints directories
            }
            await processDirectory(filePath); // Recursively process subdirectories
        } else if (file.endsWith('.csv') && !filePath.includes('.ipynb_checkpoints')) {
            // Only process CSV files outside .ipynb_checkpoints directories
            if (!processedFilesCache.has(filePath)) {
                await processFile(filePath);
                processedFilesCache.add(filePath); // Add to cache after processing
            } else {
                console.log(`Skipping cached file: ${filePath}`);
            }
        }
    }
}

async function processFile(filePath: string) {
    console.log(`Processing file: ${filePath}`);
    const records: { [dateFile: string]: { prediction_category: string; amount: number }[] } = {};

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            if (!row.latitude || !row.longitude || !row.date || !row.prediction_category || !row.amount) {
                logMissingColumns(filePath);
                return;
            }

            const { latitude, longitude, date, prediction_category, amount } = row;
            const locationFolder = `${latitude}_${longitude}`;
            const dateFile = path.join(outputDirectory, locationFolder, 'data', `${date}.csv`);

            if (!records[dateFile]) {
                records[dateFile] = [];
            }

            records[dateFile].push({
                prediction_category,
                amount: parseInt(amount, 10),
            });
        })
        .on('end', async () => {
            await writeRecords(records);
            console.log(`Completed processing of: ${filePath}`);
        });
}

async function logMissingColumns(filePath: string) {
    const logPath = path.join(logDirectory, 'missing_columns.log');
    const relativePath = filePath.replace(baseDirectory, '');
    await ensureDirectoryExists(logDirectory);
    await fs.promises.appendFile(logPath, `${relativePath}\n`);
    console.warn(`Logged missing columns for file: ${filePath}`);
}

async function writeRecords(records: { [dateFile: string]: { prediction_category: string; amount: number }[] }) {
    for (const [dateFile, entries] of Object.entries(records)) {
        await ensureDirectoryExists(path.dirname(dateFile));

        const existingData: { [category: string]: number } = {};
        const header = 'prediction_category,amount\n';

        if (fs.existsSync(dateFile)) {
            const fileContent = await fs.promises.readFile(dateFile, 'utf-8');
            fileContent.split('\n').forEach((line, index) => {
                if (index === 0) return; // Skip header line if it exists
                const [category, amount] = line.split(',');
                if (category && amount) {
                    existingData[category] = (existingData[category] || 0) + parseInt(amount, 10);
                }
            });
        }

        entries.forEach(({ prediction_category, amount }) => {
            existingData[prediction_category] = (existingData[prediction_category] || 0) + amount;
        });

        const csvData =
            header +
            Object.entries(existingData)
                .map(([category, totalAmount]) => `${category},${totalAmount}`)
                .join('\n');
        await fs.promises.writeFile(dateFile, csvData, 'utf-8');

        console.log(`Wrote data to file: ${dateFile}`);
    }
}
