import { useEffect, useState } from 'react';
import MapCard from './MapCard';

const Dashboard = () => {
    const [coordinates, setCoordinates] = useState([]); // Dynamic data

    useEffect(() => {
        // Simulating fetching data from backend
        console.log('Fetching coordinates...');
        fetch('/api/get-coordinates') // Your API endpoint for coordinates
            .then((response) => response.json())
            .then((data) => {
                console.log('Data received from API:', data);
                const parsedData = data.map((folder: string) => {
                    const [lat, lng] = folder.split('_').map(coord => parseFloat(coord.replace(',', '.')));
                    return { lat, lng, name: `Location: ${lat},${lng}` };
                });
                setCoordinates(parsedData);
            })
            .catch((err) => {
                console.error('Error fetching coordinates:', err);
            });
    }, []);

    console.log('Coordinates state in Dashboard:', coordinates);

    return (
        <div>
            <h1>Dashboard</h1>
            <MapCard coordinates={coordinates} />
        </div>
    );
};

export default Dashboard;
