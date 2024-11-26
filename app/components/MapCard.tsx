import { Map, Marker, ZoomControl } from "pigeon-maps";
import { useState } from "react";
import LocationSidebar from "./LocationSidebar";

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
        const targetCenter: [number, number] = [coord.lat, coord.lng];
        const targetZoom = 12; // Desired zoom level
        animateTo(targetCenter, targetZoom);
    };

    const animateTo = (targetCenter: [number, number], targetZoom: number, speed: number = 5) => {
        let currentCenter = [...center];
        let currentZoom = zoom;

        const step = () => {
            const dt = 1 / 60; // Assuming 60 FPS for smooth animation

            // Update latitude and longitude
            currentCenter[0] += (targetCenter[0] - currentCenter[0]) * (1.0 - Math.exp(-speed * dt));
            currentCenter[1] += (targetCenter[1] - currentCenter[1]) * (1.0 - Math.exp(-speed * dt));

            // Update zoom
            currentZoom += (targetZoom - currentZoom) * (1.0 - Math.exp(-speed * dt));

            // Apply new values to map
            setCenter([...currentCenter]);
            setZoom(currentZoom);

            // Check stopping condition
            const latDiff = Math.abs(targetCenter[0] - currentCenter[0]);
            const lngDiff = Math.abs(targetCenter[1] - currentCenter[1]);
            const zoomDiff = Math.abs(targetZoom - currentZoom);

            const threshold = 0.00001; // Fine threshold for precision
            if (latDiff > threshold || lngDiff > threshold || zoomDiff > 0.01) {
                requestAnimationFrame(step);
            } else {
                // Snap to the target to ensure exact positioning
                setCenter(targetCenter);
                setZoom(targetZoom);
            }
        };

        // Start the animation loop
        requestAnimationFrame(step);
    };

    return (
        <div
            style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                backgroundColor: "var(--surface0)",
                padding: "1rem",
                borderRadius: "var(--radius)",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    flex: 3,
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    height: "500px",
                }}
            >
                <Map
                    center={center}
                    zoom={zoom}
                    anim={false} // Enable smooth animation
                    onBoundsChanged={({ center, zoom }) => {
                        setCenter(center);
                        setZoom(zoom);
                    }}
                    style={{ height: "100%" }}
                >
                    <ZoomControl />
                    {coordinates.slice().reverse().map((coord, index) => (
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
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
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
                                            bottom: "40px", // Adjusted to appear above the pin
                                            backgroundColor: "var(--surface1)",
                                            padding: "5px 10px",
                                            borderRadius: "4px",
                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                            fontSize: "12px",
                                            whiteSpace: "nowrap",
                                            zIndex: 9999, // Ensure it's on top of everything else
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
            <LocationSidebar coordinates={coordinates} onLocationClick={handlePinClick} />
        </div>
    );
};

export default MapCard;
