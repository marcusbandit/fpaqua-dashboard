import { Map, Marker, ZoomControl } from "pigeon-maps";
import { useState, useEffect, useRef } from "react";
import LocationSidebar from "./LocationSidebar";
import { Coordinate } from "../types";
import Image from "next/image";

const MapCard: React.FC = () => {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]); // Dynamic coordinates from API
    const [center, setCenter] = useState<[number, number]>([0, 0]);
    const [zoom, setZoom] = useState<number>(3);
    const [hoveredPinIndex, setHoveredPinIndex] = useState<number | null>(null);
    const [selectedPinIndex, setSelectedPinIndex] = useState<number | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchSensorsWithCoordinates = async () => {
            try {
                // Step 1: Fetch the list of sensors
                const response = await fetch("/api/sensors?mode=sensors");
                if (!response.ok) throw new Error(`Error: ${response.statusText}`);

                const sensors: string[] = await response.json();

                // Step 2: Fetch coordinates for each sensor
                const promises = sensors.map(async (sensor) => {
                    const coordResponse = await fetch(`/api/sensors/${sensor}?date=newest&columns=longitude,latitude`);
                    const coordData = await coordResponse.json();

                    if (coordData?.length > 0) {
                        return {
                            name: sensor,
                            lat: coordData[0].latitude,
                            lng: coordData[0].longitude,
                        };
                    }

                    return null;
                });

                const resolvedCoordinates = (await Promise.all(promises)).filter(Boolean) as Coordinate[];

                // Update state with valid coordinates
                setCoordinates(resolvedCoordinates);

                // Set initial map center if coordinates exist
                if (resolvedCoordinates.length > 0) {
                    setCenter([resolvedCoordinates[0].lat, resolvedCoordinates[0].lng]);
                }
            } catch (err) {
                console.error("Error fetching sensor coordinates:", err);
            }
        };

        fetchSensorsWithCoordinates();
    }, []);

    const stopAnimation = () => {
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    };

    const handlePinClick = (coord: Coordinate) => {
        setCenter([coord.lat, coord.lng]);
        setZoom(5); // Zoom into the clicked pin
        setSelectedPinIndex(coordinates.findIndex((c) => c.lat === coord.lat && c.lng === coord.lng));
    };

    return (
        <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "1rem", overflow: "hidden" }}>
            <div
                style={{
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    width: "100%",
                    minHeight: "20rem",
                    aspectRatio: "1 / 1",
                }}
            >
                <Map
                    center={center}
                    zoom={zoom}
                    onBoundsChanged={({ center, zoom }) => {
                        stopAnimation();
                        setCenter(center);
                        setZoom(zoom);
                    }}
                >
                    <ZoomControl />
                    {coordinates.map((coord: Coordinate, index: number) => (
                        <Marker key={index} anchor={[coord.lat, coord.lng]} onClick={() => handlePinClick(coord)}>
                            <div
                                onMouseEnter={() => setHoveredPinIndex(index)}
                                onMouseLeave={() => setHoveredPinIndex(null)}
                                style={{
                                    position: "relative",
                                    transform: hoveredPinIndex === index || selectedPinIndex === index ? "scale(1.25)" : "scale(1)",
                                    transition: "transform 0.2s ease",
                                    cursor: "pointer",
                                }}
                            >
                                <Image src="/map_pin.svg" alt="Pin" width={30} height={30} />
                                {(hoveredPinIndex === index || selectedPinIndex === index) && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "40px",
                                            backgroundColor: "var(--surface1)",
                                            padding: "5px 10px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {coord.name}
                                    </div>
                                )}
                            </div>
                        </Marker>
                    ))}
                </Map>
            </div>
            <LocationSidebar />
        </div>
    );
};

export default MapCard;
