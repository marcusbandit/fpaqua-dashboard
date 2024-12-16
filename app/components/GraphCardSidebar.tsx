import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { resolveCssVariable } from "../utils/cssUtils";
import { getColorFromPalette } from "../utils/colorPalette";
import Switch from "react-switch";
import { makeBackground } from "echarts/types/src/component/helper/listComponent.js";

interface GraphCardSidebarProps {
    sensor: string;
    hoveredDate: string | null;
}

interface SidebarData {
    prediction_category: string;
    amount: number;
}

const GraphCardSidebar: React.FC<GraphCardSidebarProps> = ({ sensor, hoveredDate }) => {
    const [hoveredData, setHoveredData] = useState<SidebarData[]>([]);
    const [sortAscending, setSortAscending] = useState<boolean>(false);

    useEffect(() => {
        if (!hoveredDate) {
            setHoveredData([]);
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch(`/api/sensors/${sensor}?date=${hoveredDate}`);
                const result = await response.json();
                if (Array.isArray(result)) {
                    setHoveredData(result);
                } else {
                    console.error("Unexpected response:", result);
                    setHoveredData([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setHoveredData([]);
            }
        };

        fetchData();
    }, [hoveredDate, sensor]);

    if (!hoveredDate) {
        return (
            <div
                style={{
                    width: "500px",
                    padding: "1rem",
                    backgroundColor: "var(--surface0)",
                    borderRadius: "var(--radius)",
                }}
            >
                <div style={{ height: "30px", width: "70%", marginBottom: "15px", background: "linear-gradient(var(--surface2), var(--surface1)), var(--surface0)", borderRadius: "var(--radius)" }} />
                <div style={{ height: "400px", width: "100%", background: "linear-gradient(var(--surface2), var(--surface1))", borderRadius: "var(--radius)" }} />
            </div>
        );
    }

    if (hoveredData.length === 0) {
        return (
            <div
                style={{
                    width: "500px",
                    padding: "1rem",
                    backgroundColor: "var(--surface0)",
                    borderRadius: "var(--radius)",
                }}
            >
                <div style={{ height: "30px", width: "70%", marginBottom: "15px", background: "linear-gradient(var(--surface2), var(--surface1)), var(--surface0)", borderRadius: "var(--radius)" }} />
                <div style={{ height: "400px", width: "100%", background: "linear-gradient(var(--surface2), var(--surface1))", borderRadius: "var(--radius)" }} />
            </div>
        );
    }

    // Get color for each category
    const uniqueCategories = Array.from(new Set(hoveredData.map((d) => d.prediction_category)));
    const getCategoryColor = (category: string): string => {
        const index = uniqueCategories.indexOf(category);
        const variableName = getColorFromPalette(index); // Get the corresponding CSS variable name
        return resolveCssVariable(variableName); // Default to black if variable is unavailable
    };

    const sidebarGraphOptions = {
        tooltip: { trigger: "item" },
        xAxis: {
            type: "log",
            axisLabel: { textStyle: { color: resolveCssVariable("--text") } },
        },
        yAxis: {
            type: "category",
            data: hoveredData
                .sort((a, b) => (sortAscending ? a.amount - b.amount : a.prediction_category.localeCompare(b.prediction_category))) // Toggle sorting logic
                .map((d) => d.prediction_category),
            axisLabel: { show: true, color: resolveCssVariable("--text")},
            splitLine: { show: false },
        },
        series: [
            {
                name: "Categories",
                type: "bar",
                data: hoveredData
                    .sort((a, b) => (sortAscending ? a.amount - b.amount : a.prediction_category.localeCompare(b.prediction_category))) // Toggle sorting logic
                    .map((d) => ({
                        value: d.amount,
                        itemStyle: { color: getCategoryColor(d.prediction_category) },
                        label: {
                            show: true,
                            position: "insideRight",
                            formatter: `{c}`,
                            textStyle: { color: "#3d3d3d", fontSize: 12, fontWeight: "bold" },
                        },
                        name: d.prediction_category,
                    })),
                itemStyle: {
                    borderRadius: [0, 4, 4, 0],
                },
            },
        ],
        grid: {
            left: "3%",
            right: "3%",
            bottom: "3%",
            containLabel: true,
        },
    };

    return (
        <div
            style={{
                width: "500px",
                padding: "1rem",
                backgroundColor: "var(--surface0)",
                borderRadius: "var(--radius)",
            }}
        >
            <h3>{`Details for ${hoveredDate}`}</h3>
            <Switch checked={sortAscending} onChange={() => setSortAscending((prev) => !prev)} offColor="#888" onColor="#007BFF" />
            <ReactECharts option={sidebarGraphOptions} style={{ height: "400px", width: "100%" }} />
        </div>
    );
};

export default GraphCardSidebar;
