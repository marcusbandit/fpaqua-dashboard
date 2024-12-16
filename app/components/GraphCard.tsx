import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

interface GraphCardProps {
    sensor: string;
    setHoveredDate: (date: string | null) => void;
}

const GraphCard: React.FC<GraphCardProps> = ({ sensor, setHoveredDate }) => {
    const [dates, setDates] = useState<string[]>([]); // List of dates
    const [totals, setTotals] = useState<number[]>([]); // Total counts per date
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Step 1: Fetch the list of recent dates from the API
                const dateResponse = await fetch(`/api/sensors/${sensor}`);
                console.log("Date response:");
                console.log(dateResponse);
                const recentDates = await dateResponse.json(); // ["2024-12-04", "2024-12-03", ...]

                if (!Array.isArray(recentDates)) {
                    throw new Error("Invalid date list response");
                }

                setDates(recentDates);

                // Step 2: Fetch total counts for each date
                const totalsPerDay = await Promise.all(
                    recentDates.map(async (date) => {
                        const response = await fetch(
                            `/api/sensors/${sensor}?date=${date}`
                        );
                        const result = await response.json(); // [{ prediction_category: "...", amount: ... }]
                        if (Array.isArray(result)) {
                            // Sum up the total for this day
                            return result.reduce(
                                (sum, category) => sum + category.amount,
                                0
                            );
                        }
                        console.error("Unexpected response:", result);
                        return 0;
                    })
                );

                setTotals(totalsPerDay);
            } catch (error) {
                console.error("Error fetching data:", error);
                setDates([]);
                setTotals([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sensor]);

    if (loading) {
        return <div style={{ height: "400px", width: "100%", display: "flex", backgroundColor: "var(--surface0)", borderRadius: "var(--radius)", overflow: "hidden" }}/>
    }

    if (dates.length === 0) {
        return <div style={{ height: "400px", width: "100%", display: "flex", backgroundColor: "var(--surface0)", borderRadius: "var(--radius)", overflow: "hidden" }}/>
    }

    const mainGraphOptions = {
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (params: any) => {
                const [hoveredBar] = params;
                setHoveredDate(dates[hoveredBar.dataIndex]); // Pass hovered date to sidebar
                return `${hoveredBar.name}: ${hoveredBar.value}`;
            },
        },
        xAxis: {
            type: "category",
            data: dates,
            axisLabel: { rotate: 45 },
        },
        yAxis: {
            type: "log",
            min: 1,
        },
        series: [
            {
                name: "Total Entities",
                type: "bar",
                data: totals,
            },
        ],
    };

    return (
        <div style={{ display: "flex", backgroundColor: "var(--surface0)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            {/* Main Graph */}
            <div style={{ flex: 3, padding: "1rem" }}>
                <ReactECharts option={mainGraphOptions} style={{ height: "400px", width: "100%" }} />
            </div>
        </div>
    );
};

export default GraphCard;
