import { Map, Marker, ZoomControl } from "pigeon-maps";
import { useState } from "react";

interface Coordinate {
    lat: number;
    lng: number;
    name?: string; // Name is optional
}

interface MapCardProps {
    coordinates: Coordinate[]; // Array of coordinates for the map
}

const MapCard: React.FC<MapCardProps> = ({ coordinates }) => {
    const [center, setCenter] = useState<[number, number]>(coordinates.length > 0 ? [coordinates[0].lat, coordinates[0].lng] : [0, 0]);
    const [zoom, setZoom] = useState<number>(coordinates.length === 1 ? 10 : 5);
    const [hoveredPinIndex, setHoveredPinIndex] = useState<number | null>(null);

    const handlePinClick = (coord: Coordinate) => {
        setCenter([coord.lat, coord.lng]);
        setZoom(12); // Adjust zoom level for a closer view
    };

    return (
        <div style={{ flex: 1, backgroundColor: "var(--surface0)", padding: "1rem", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <h2>Map</h2>
            <div style={{ borderRadius: "var(--radius)", overflow: "hidden", height: "500px" }}>
                <Map
                    center={center}
                    zoom={zoom}
                    anim={true} // Enable smooth animation
                    onBoundsChanged={({ center, zoom }) => {
                        setCenter(center);
                        setZoom(zoom);
                    }}
                    style={{ height: '100%' }}
                >
                    <ZoomControl />
                    {coordinates.map((coord, index) => (
                        <Marker
                            key={index}
                            anchor={[coord.lat, coord.lng]} // Position directly on the map coordinates
                            onClick={() => handlePinClick(coord)} // Zoom into the pin on click
                        >
                            {/* Pin Container */}
                            <div
                                onMouseEnter={() => setHoveredPinIndex(index)}
                                onMouseLeave={() => setHoveredPinIndex(null)}
                                style={{
                                    position: "absolute",
                                    width: "30px",
                                    height: "30px",
                                    pointerEvents: "auto",
                                    transform: hoveredPinIndex === index ? "scale(1.25)" : "scale(1)",
                                    transformOrigin: "bottom center",
                                    transition: "transform 0.2s ease",
                                    cursor: "pointer",
                                }}
                            >
                                {/* SVG Pin */}
                                <img
                                    src="/map_pin.svg"
                                    alt="Pin"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                                {/* Hover Label */}
                                {hoveredPinIndex === index && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "40px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            backgroundColor: "var(--surface1)",
                                            padding: "5px 10px",
                                            borderRadius: "4px",
                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                            fontSize: "12px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {coord.name || `${coord.lat}, ${coord.lng}`}
                                    </div>
                                )}
                            </div>
                        </Marker>
                    ))}
                </Map>
            </div>
        </div>
    );
};

export default MapCard;
