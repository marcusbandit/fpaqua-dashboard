import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useState } from "react";
import { GraphDataPoint } from "../types";
import MapCard from "./MapCard";
import GraphCard from "./GraphCard";
import BioGraphCard from "./BioGraphCard";
// import ShannonGraphCard from "./ShannonGraphCard";
import GraphCardSidebar from "./GraphCardSidebar";

const Dashboard = () => {
    const searchParams = useSearchParams();
    const sensor = searchParams?.get("sensor") ?? ""; // Ensure 'sensor' is always a string
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);

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
                    <BioGraphCard sensor={sensor} />
                    {/* <ShannonGraphCard data={graphData} /> */}
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
                    <MapCard />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
