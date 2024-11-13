// components/Dashboard.tsx
"use client";
import { useEffect, useState } from 'react';
import MapCard from './MapCard';
import LocationSidebar from './LocationSidebar';

interface Coordinate {
    lat: number;
    lng: number;
    name: string;
}

const Dashboard = () => {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCachedData = async () => {
        // Mock function to load from the `dashboard/data` directory
        try {
            const response = await fetch('/api/load-cached-data');
            if (response.ok) {
                const data = await response.json();

                const extractedCoordinates = data.folderNames.map((folderName: string) => {
                    const [lat, lng] = folderName.split('_').map(coord => parseFloat(coord.replace(',', '.')));
                    return {
                        lat,
                        lng,
                        name: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
                    };
                });
                setCoordinates(extractedCoordinates);
            } else {
                console.error('Error loading cached data:', response.statusText);
            }
        } catch (error) {
            console.error('Error loading cached data:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/process-files');
            if (response.ok) {
                const data = await response.json();
                loadCachedData(); // Load the updated cached data
            } else {
                console.error('Error refreshing data:', response.statusText);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCachedData(); // Initial load of cached data
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', padding: '1rem', gap: '1rem' }}>
            <button onClick={refreshData} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                Missing data?
            </button>
            {loading ? (
                <div>Loading data...</div>
            ) : (
                <>
                    <MapCard coordinates={coordinates} />
                    <LocationSidebar coordinates={coordinates} />
                </>
            )}
        </div>
    );
};

export default Dashboard;
