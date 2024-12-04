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
    //console.log(`Processing file: ${filePath}`);
    const records: { [dateFile: string]: { prediction_category: string; amount: number }[] } = {};

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            if (!row.image_path || !row.latitude || !row.longitude || !row.prediction_category || !row.amount) {
                // Log missing columns
                const missingRows: string[] = [];
                if (!row.image_path) missingRows.push('image_path');
                if (!row.latitude) missingRows.push('latitude');
                if (!row.longitude) missingRows.push('longitude');
                if (!row.prediction_category) missingRows.push('prediction_category');
                if (!row.amount) missingRows.push('amount');
                //logMissingColumns(filePath, missingRows);
                return;
            }
            const { sensor, date, time, name }  = extractFromImagepath(row.image_path);
            const { latitude, longitude, prediction_category, amount } = row;
            const locationFolder = `${latitude}_${longitude}_${sensor}_${name}`;
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
            //console.log(`Completed processing of: ${filePath}`);
        });
}

function extractFromImagepath(filepath: string) {
    const parts = filepath.split('/');
    const filename = parts[parts.length - 1];
    const filenameParts = filename.split('_');

    const sensor = filenameParts[0];

    const dateRegex = /\d{8}T\d{6}Z/;
    const datetimeIndex = filenameParts.findIndex(part => dateRegex.test(part));
    if (datetimeIndex === -1) {
        throw new Error('Date and time not found in filename');
    }
    const datetime = filenameParts[datetimeIndex];
    const [datePart, timePart] = datetime.split('T');
    const date = `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
    const time = `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}`;
    const name = filenameParts.slice(1, datetimeIndex).join('-');

    return { sensor, date, time, name };
}

async function logMissingColumns(filePath: string, missingColumns: string[]) {
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
