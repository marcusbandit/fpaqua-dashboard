import { motion } from "motion/react";
import { useState } from "react";
import MapCard from "./MapCard";
import GraphCard from "./GraphCard";
import useCoordinates from "../hooks/useCoordinates";
import { Coordinate, GraphDataPoint } from "../types";
import BioGraphCard from "./BioGraphCard";
import ShannonGraphCard from "./ShannonGraphCard";
import GraphCardSidebar from "./GraphCardSidebar";

export async function fetchLocalDataForCoordinates(coord: Coordinate): Promise<GraphDataPoint[]> {
    try {
        const date = new Date().toISOString().split("T")[0]; // Use current date or pass from UI
        const response = await fetch(`/api/get-data?lat=${coord.lat}&lng=${coord.lng}`);

        if (!response.ok) {
            console.error("Error fetching data from API:", response.statusText);
            return [];
        }

        const data = await response.json();
        return data; // Parsed data from the API
    } catch (error) {
        console.error("Error in fetchLocalDataForCoordinates:", error);
        return [];
    }
}

const Dashboard = () => {
    const { coordinates, isProcessing, startPreprocessing } = useCoordinates();
    const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);

    const sensor = "titan002"; // Example sensor value
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);

    const handlePinClick = async (coord: Coordinate) => {
        console.log("Fetching data for:", coord);
        const fetchedData = await fetchLocalDataForCoordinates(coord);
        setGraphData(fetchedData);
    };
    return (
        <div style={{ padding: "1rem", backgroundColor: "var(--background)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignContent: "center",
                    width: "100%",
                    gap: "1rem",
                }}
                className="responsive-container"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{
                        display: "flex",
                        flex: "1",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    <GraphCard sensor={sensor} setHoveredDate={setHoveredDate} />
                    <GraphCardSidebar sensor={sensor} hoveredDate={hoveredDate || "20241109"} />
                    <BioGraphCard data={graphData} />
                    <ShannonGraphCard data={graphData} />
                </motion.div>
                {/* SidebarColumn */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                    className={"sidecolumn"}
                >
                    <MapCard coordinates={coordinates} onPinClick={handlePinClick} />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
