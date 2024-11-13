// components/MapCard.tsx
import { Map, Marker, ZoomControl } from 'pigeon-maps';

interface Coordinate {
    lat: number;
    lng: number;
    name: string;
}

interface MapCardProps {
    coordinates: Coordinate[];
}

const MapCard: React.FC<MapCardProps> = ({ coordinates }) => {
    return (
        <div style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
            <h2>Map</h2>
            <Map
                defaultCenter={[50.0, 10.0]} // Center of the map
                defaultZoom={2} // Initial zoom level
                height={500} // Height of the map container
                style={{ borderRadius: '8px' }}
            >
                <ZoomControl />
                {coordinates.map((coord, index) => (
                    <Marker key={index} width={50} anchor={[coord.lat, coord.lng]}>
                        <div style={{ color: 'red', cursor: 'pointer' }}>📍</div>
                        <div style={{ fontSize: '12px', textAlign: 'center' }}>{coord.name}</div>
                    </Marker>
                ))}
            </Map>
        </div>
    );
};

export default MapCard;
