import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const DATA_PATH = '/home/marc/projectdata/fpaqua/dashboard/data/';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const folderNames = fs.readdirSync(DATA_PATH).filter((folder) => {
            // Ensure it's not a system file like .DS_Store
            return !folder.startsWith('.') && folder.includes('titan');
        });

        console.log('Found folders for the sensors:', folderNames);

        res.status(200).json(folderNames);
    } catch (err) {
        console.error('Error reading coordinates from file system:', err);
        res.status(500).json({ error: 'Failed to read coordinates from the file system.' });
    }
}
