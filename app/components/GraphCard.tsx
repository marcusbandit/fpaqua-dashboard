import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import { resolveCssVariable } from "../utils/cssUtils"; // Import the CSS variable resolver. This is a KEY feature and without it it breaks the colored graph
import { getColorFromPalette } from "../utils/colorPalette"; // Import the color palette generator. This is a KEY feature and without it it breaks the colored graph
import { GraphDataPoint } from "../types";
import Switch from "react-switch";

interface GraphCardProps {
    data: GraphDataPoint[]; // Data to be displayed on the graph
}

const GraphCard: React.FC<GraphCardProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div>No data available. Click on a location to load data.</div>; // Empty state
    }

    const [hoveredDate, setHoveredDate] = useState<string | null>(null);
    const [sortAscending, setSortAscending] = useState<boolean>(false); // Toggle for sorting

    // Extract unique dates
    const dates = Array.from(new Set(data.map((point) => point.date)));

    // Aggregate total counts for each date
    const totalCounts = dates.map((date) => {
        return data.filter((d) => d.date === date).reduce((sum, d) => sum + d.amount, 0);
    });

    // Data for the hovered date
    const hoveredData = hoveredDate
        ? data.filter((d) => d.date === hoveredDate).sort((a, b) => b.amount - a.amount) // Sort by count descending
        : [];

    // Get color for each category
    const uniqueCategories = Array.from(new Set(data.map((d) => d.prediction_category)));
    const getCategoryColor = (category: string): string => {
        const index = uniqueCategories.indexOf(category);
        const variableName = getColorFromPalette(index); // Get the corresponding CSS variable name
        return resolveCssVariable(variableName); // Default to black if variable is unavailable
    };

    // Main bar graph options
    const mainGraphOptions = {
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (params: any) => {
                const [hoveredBar] = params;
                setHoveredDate(dates[hoveredBar.dataIndex]);
                return `${hoveredBar.name}: ${hoveredBar.value}`;
            },
        },
        xAxis: {
            type: "category",
            data: dates,
            axisLabel: {
                rotate: 45,
                textStyle: { color: resolveCssVariable("--text") },
            },
        },
        yAxis: {
            type: "log",
            axisLabel: { textStyle: { color: resolveCssVariable("--text") } },
        },
        series: [
            {
                name: "Total Entities",
                type: "bar",
                data: totalCounts,
                itemStyle: { borderRadius: [4, 4, 0, 0] }, // Rounded top corners
                emphasis: {
                    itemStyle: { color: resolveCssVariable("--blue") }, // Highlight color
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

    // Sidebar stacked bar graph options
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
                .map((d) => d.prediction_category)
                .reverse(),
            axisLabel: { show: false },
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
                            position: "insideLeft",
                            formatter: `{b}: {c}`,
                            textStyle: { color: "#3d3d3d", fontSize: 12, fontWeight: "bold" },
                        },
                        name: d.prediction_category.split("Copepod_")[1],
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
        <div style={{ display: "flex", backgroundColor: "var(--surface0)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            {/* Main Graph */}
            <div style={{ flex: 3, padding: "1rem" }}>
                <ReactECharts option={mainGraphOptions} style={{ height: "400px", width: "100%" }} />
            </div>

            {/* Sidebar Graph */}
            <div
                style={{
                    width: "300px",
                    padding: "1rem",
                    backgroundColor: "var(--surface1)",
                    borderLeft: "1px solid var(--overlay0)",
                    borderRadius: "0 var(--radius) var(--radius) 0",
                }}
            >
                {/* Toggle Switch */}
                <h3 style={{ margin: "0 0 1rem", color: resolveCssVariable("--text") }}>
                    {hoveredDate ? `Details for ${hoveredDate}` : "Hover over a date"}
                </h3>
                <Switch 
                        checked={sortAscending}
                        onChange={() => setSortAscending((prev) => !prev)} 
                        offColor="#888" 
                        onColor="#007BFF" 
                    /> 
                {hoveredDate ? (
                    <ReactECharts option={sidebarGraphOptions} style={{ height: "400px", width: "100%" }} />
                ) : (
                    <p style={{ color: resolveCssVariable("--text") }}>Hover over a bar to see details</p>
                )}
            </div>
        </div>
    );
};

export default GraphCard;
