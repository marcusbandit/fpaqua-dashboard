import { motion } from "motion/react";
import { useState } from "react";
import MapCard from "./MapCard";
import GraphCard from "./GraphCard";
import useCoordinates from "../hooks/useCoordinates";
import { Coordinate, GraphDataPoint } from "../types";

export async function fetchLocalDataForCoordinates(coord: Coordinate): Promise<GraphDataPoint[]> {
    try {
        const date = new Date().toISOString().split('T')[0]; // Use current date or pass from UI
        const response = await fetch(`/api/get-data?lat=${coord.lat}&lng=${coord.lng}`);
        
        if (!response.ok) {
            console.error('Error fetching data from API:', response.statusText);
            return [];
        }

        const data = await response.json();
        return data; // Parsed data from the API
    } catch (error) {
        console.error('Error in fetchLocalDataForCoordinates:', error);
        return [];
    }
}

const Dashboard = () => {
    const { coordinates, isProcessing, startPreprocessing } = useCoordinates();
    const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);

    const handlePinClick = async (coord: Coordinate) => {
        console.log("Fetching data for:", coord);
        const fetchedData = await fetchLocalDataForCoordinates(coord);
        setGraphData(fetchedData);
    }
    return (
        <div style={{ padding: "1rem", backgroundColor: "var(--background)" }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                    marginBottom: "1rem",
                    textAlign: "center",
                }}
            >
                {isProcessing && <p>Processing new data, please wait...</p>}
                <button
                    onClick={startPreprocessing}
                    disabled={isProcessing}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: "var(--blue)",
                        color: "white",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        opacity: isProcessing ? 0.7 : 1,
                        transition: "opacity 0.3s ease",
                    }}
                >
                    {isProcessing ? "Processing..." : "Check for Missing Data"}
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "1rem",
                }}
            >
                <GraphCard data={graphData} />
                <MapCard coordinates={coordinates} onPinClick={handlePinClick}/>
            </motion.div>
        </div>
    );
};

export default Dashboard;
