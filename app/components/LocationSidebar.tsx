"use client"; // Use this for client-side components in Next.js (App Router)

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Coordinate {
    name: string;
}

const LocationSidebar: React.FC = () => {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();

    // Fetch the list of sensors
    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const response = await fetch("/api/sensors?mode=sensors");
                if (!response.ok) throw new Error(`Error: ${response.statusText}`);
                
                const sensors: string[] = await response.json();
                setCoordinates(sensors.map((sensor) => ({ name: sensor })));
            } catch (err) {
                if (err instanceof Error) setError(err.message);
            }
        };

        fetchSensors();
    }, []);

    // Update the URL with the selected sensor
    const handleLocationClick = (coord: Coordinate) => {
        const currentParams = new URLSearchParams(searchParams?.toString() ?? "");
        if (currentParams.get("sensor") !== coord.name) {
            currentParams.set("sensor", coord.name);
            router.push(`?${currentParams.toString()}`);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                height: "fit-content",
                maxHeight: "400px",
                backgroundColor: "var(--surface0)",
                padding: "1rem",
                borderRadius: "8px",
            }}
        >
            <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem", fontWeight: "bold" }}>
                Locations:
            </h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul style={{ height: "fit-content", listStyle: "none", padding: 0 }}>
                {coordinates.map((coord, index) => (
                    <li
                        key={index}
                        style={{
                            padding: "0.5rem",
                            cursor: "pointer",
                            backgroundColor: "var(--surface1)",
                            borderRadius: "4px",
                            marginBottom: "0.5rem",
                            transition: "background-color 0.3s ease, transform 0.2s ease",
                            maxWidth: "300px",
                        }}
                        onClick={() => handleLocationClick(coord)} // Append sensor to the URL
                        onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "var(--surface2)";
                            (e.target as HTMLElement).style.transform = "translateX(10px)";
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "var(--surface1)";
                            (e.target as HTMLElement).style.transform = "translateX(0)";
                        }}
                    >
                        {coord.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LocationSidebar;
