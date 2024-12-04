import { Map, Marker, ZoomControl } from "pigeon-maps";
import { useState, useRef } from "react";
import LocationSidebar from "./LocationSidebar";
import { Coordinate } from "../types";

interface MapCardProps {
    coordinates: Coordinate[]; // Array of coordinates for the map
    onPinClick: (coord: Coordinate) => void;
}

const MapCard: React.FC<MapCardProps> = ({ coordinates, onPinClick }) => {
    const [center, setCenter] = useState<[number, number]>(coordinates.length > 0 ? [coordinates[0].lat, coordinates[0].lng] : [0, 0]);
    const [zoom, setZoom] = useState<number>(coordinates.length === 1 ? 10 : 5);
    const [hoveredPinIndex, setHoveredPinIndex] = useState<number | null>(null);
    const [selectedPinIndex, setSelectedPinIndex] = useState<number | null>(0);
    const animationRef = useRef<number | null>(null);

    const stopAnimation = () => {
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    };

    const handlePinClick = (coord: Coordinate) => {
        const targetCenter: [number, number] = [coord.lat, coord.lng];
        const targetZoom = 5; // Desired zoom level

        // Select the pin
        const selectedIndex = coordinates.slice().reverse().findIndex(c => c.lat === coord.lat && c.lng === coord.lng);
        setSelectedPinIndex(selectedIndex);

        // Check distance from current center to target center
        const distanceThreshold = 5; // Define threshold for snapping
        const distance = Math.sqrt(
            Math.pow(targetCenter[0] - center[0], 2) + Math.pow(targetCenter[1] - center[1], 2)
        );

        if (distance > distanceThreshold) {
            // Snap to target position and reset animation state
            setCenter(targetCenter);
            setZoom(3); // Initial zoom before animation
            setTimeout(() => animateTo(targetCenter, targetZoom), 0);
        } else {
            animateTo(targetCenter, targetZoom);
        }

        onPinClick(coord);
    };

    const animateTo = (targetCenter: [number, number], targetZoom: number, speed: number = 5) => {
        stopAnimation();

        let currentCenter: [number, number] = [...targetCenter];
        let currentZoom = zoom;

        const step = () => {
            const dt = 1 / 60; // Assuming 60 FPS for smooth animation

            // Update latitude and longitude
            currentCenter[0] += (targetCenter[0] - currentCenter[0]) * (1.0 - Math.exp(-speed * dt));
            currentCenter[1] += (targetCenter[1] - currentCenter[1]) * (1.0 - Math.exp(-speed * dt));

            // Update zoom
            currentZoom += (targetZoom - currentZoom) * (1.0 - Math.exp(-speed * dt));

            // Apply new values to map
            setCenter([currentCenter[0], currentCenter[1]]);
            setZoom(currentZoom);

            // Check stopping condition
            const latDiff = Math.abs(targetCenter[0] - currentCenter[0]);
            const lngDiff = Math.abs(targetCenter[1] - currentCenter[1]);
            const zoomDiff = Math.abs(targetZoom - currentZoom);

            const threshold = 0.00001; // Fine threshold for precision
            if (latDiff > threshold || lngDiff > threshold || zoomDiff > 0.01) {
                animationRef.current = requestAnimationFrame(step);
            } else {
                // Snap to the target to ensure exact positioning
                setCenter(targetCenter);
                setZoom(targetZoom);
                animationRef.current = null;
            }
        };

        // Start the animation loop
        animationRef.current = requestAnimationFrame(step);
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
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    width: "100%",
                    // maxWidth: "30rem",
                    // aspectRatio: "1 / 1",
                }}
            >
                <Map
                    center={center}
                    zoom={zoom}
                    onBoundsChanged={({ center, zoom }) => {
                        stopAnimation(); // Stop animation when the map is dragged
                        setCenter(center);
                        setZoom(zoom);
                    }}
                >
                    <ZoomControl />
                    {coordinates.slice().reverse().map((coord: Coordinate, index: number) => (
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
                                    transform: hoveredPinIndex === index || selectedPinIndex === index ? "scale(1.25)" : "scale(1)",
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
                                {(hoveredPinIndex === index || selectedPinIndex === index) && (
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
            <LocationSidebar coordinates={coordinates} onLocationClick={(coord: Coordinate) => handlePinClick(coord)} />
        </div>
    );
};

export default MapCard;
