// components/LocationSidebar.tsx

interface Coordinate {
    lat: number;
    lng: number;
    name: string;
}

interface SidebarProps {
    coordinates: Coordinate[];
}

const LocationSidebar: React.FC<SidebarProps> = ({ coordinates }) => {
    return (
        <div style={{ width: '300px', backgroundColor: '#e9ecef', padding: '1rem', borderRadius: '8px' }}>
            <h2>Locations</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {coordinates.map((coord, index) => (
                    <li key={index} style={{ padding: '0.5rem 0', cursor: 'pointer' }}>
                        {coord.name} ({coord.lat.toFixed(2)}, {coord.lng.toFixed(2)})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LocationSidebar;
