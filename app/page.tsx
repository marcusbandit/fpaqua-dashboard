"use client";
import 'leaflet/dist/leaflet.css';
import Dashboard from './components/Dashboard';

export default function HomePage() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f3f5' }}>
            <div style={{ width: '90%', maxWidth: '1200px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>FPAQUA Dashboard</h1>
                <Dashboard />
            </div>
        </div>
    );
}
