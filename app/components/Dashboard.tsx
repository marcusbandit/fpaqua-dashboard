import { motion } from "motion/react";
import MapCard from "./MapCard";
import GraphCard from "./GraphCard";
import useCoordinates from "../hooks/useCoordinates";

const Dashboard = () => {
    const { coordinates, isProcessing, startPreprocessing } = useCoordinates();

    // Example data for GraphCard
    const sampleData = [
        { date: "2023-01-01", category: "Crustacean", count: 10 },
        { date: "2023-01-01", category: "Mammal", count: 20 },
        { date: "2023-01-01", category: "Fungi", count: 57 },
        { date: "2023-01-01", category: "Coral", count: 9 },
        { date: "2023-01-01", category: "Reptile", count: 99 },
        { date: "2023-01-01", category: "Bird", count: 30 },
        { date: "2023-01-01", category: "Insect", count: 54 },
        { date: "2023-01-01", category: "Amphibian", count: 77 },
        { date: "2023-01-01", category: "Fish", count: 51 },
        { date: "2023-01-01", category: "Plant", count: 18 },
        { date: "2023-01-02", category: "Bird", count: 86 },
        { date: "2023-01-02", category: "Amphibian", count: 63 },
        { date: "2023-01-02", category: "Plant", count: 65 },
        { date: "2023-01-02", category: "Reptile", count: 83 },
        { date: "2023-01-02", category: "Fish", count: 80 },
        { date: "2023-01-02", category: "Insect", count: 34 },
        { date: "2023-01-02", category: "Mammal", count: 81 },
        { date: "2023-01-02", category: "Fungi", count: 49 },
        { date: "2023-01-02", category: "Crustacean", count: 52 },
        { date: "2023-01-02", category: "Coral", count: 72 },
        { date: "2023-01-03", category: "Fish", count: 64 },
        { date: "2023-01-03", category: "Bird", count: 23 },
        { date: "2023-01-03", category: "Reptile", count: 51 },
        { date: "2023-01-03", category: "Amphibian", count: 99 },
        { date: "2023-01-03", category: "Mammal", count: 43 },
        { date: "2023-01-03", category: "Insect", count: 80 },
        { date: "2023-01-03", category: "Fungi", count: 28 },
        { date: "2023-01-03", category: "Crustacean", count: 40 },
        { date: "2023-01-03", category: "Plant", count: 37 },
        { date: "2023-01-03", category: "Coral", count: 68 },
        { date: "2023-01-04", category: "Bird", count: 50 },
        { date: "2023-01-04", category: "Insect", count: 47 },
        { date: "2023-01-04", category: "Mammal", count: 57 },
        { date: "2023-01-04", category: "Fungi", count: 94 },
        { date: "2023-01-04", category: "Fish", count: 69 },
        { date: "2023-01-04", category: "Reptile", count: 62 },
        { date: "2023-01-04", category: "Amphibian", count: 84 },
        { date: "2023-01-04", category: "Coral", count: 72 },
        { date: "2023-01-04", category: "Plant", count: 62 },
        { date: "2023-01-04", category: "Crustacean", count: 49 }
        // Continue to January 5th through 10th...
    ];
    
    
    

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
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "1rem",
                }}
            >
                <MapCard coordinates={coordinates} />
                <GraphCard data={sampleData} />
            </motion.div>
        </div>
    );
};

export default Dashboard;
