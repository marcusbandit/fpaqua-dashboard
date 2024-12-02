import { useEffect, useState } from 'react';

const useCoordinates = () => {
    const [coordinates, setCoordinates] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch initial coordinates
    const fetchCoordinates = async () => {
        try {
            const response = await fetch('/api/get-coordinates');
            const data = await response.json();
            console.log(data);
            const parsedData = data.map((folder: string) => {
                const [lat, lng] = folder.split('_').map(coord => parseFloat(coord.replace(',', '.')));
                const name = folder.split('_')[2];
                return { lat, lng, name };
            });
            console.log('Fetched coordinates:', parsedData);
            setCoordinates(parsedData);
        } catch (err) {
            console.error('Error fetching coordinates:', err);
        }
    };

    // Trigger preprocessing and fetch updated coordinates
    const startPreprocessing = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/process-files', { method: 'POST' });
            const result = await response.json();
            console.log('Preprocessing started:', result);
            // After processing, re-fetch coordinates
            await fetchCoordinates();
        } catch (err) {
            console.error('Error during preprocessing:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        // Fetch initial data when the component mounts
        fetchCoordinates();
    }, []);

    return { coordinates, isProcessing, startPreprocessing };
};

export default useCoordinates;
