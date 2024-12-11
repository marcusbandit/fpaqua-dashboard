import React from "react";
import ReactECharts from "echarts-for-react";
import { resolveCssVariable } from "../utils/cssUtils";
import { GraphDataPoint } from "../types";

interface GraphCardProps {
    data: GraphDataPoint[];
}

const BioGraphCard: React.FC<GraphCardProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div>No data available. Click on a location to load data.</div>;
    }

    // Group data by date
    const groupedData = data.reduce((acc, { date, amount, prediction_category }) => {
        if (!acc[date]) {
            acc[date] = { categories: new Set(), amountSum: 0 };
        }
        acc[date].categories.add(prediction_category);
        acc[date].amountSum += amount;
        return acc;
    }, {} as Record<string, { categories: Set<string>; amountSum: number }>);

    // Extract processed data for the graph
    const processedData = Object.entries(groupedData).map(([date, { categories, amountSum }]) => ({
        date,
        categoryCount: categories.size,
        amountSum,
    }));

    // Sort data by date for consistent display
    processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Scatter plot data
    const scatterData = processedData.map(({ categoryCount, amountSum, date }) => ({
        value: [categoryCount, amountSum],
        name: date,
    }));

    const chartOptions = {
        tooltip: {
            trigger: "axis", // Snap tooltip to the nearest axis point
            axisPointer: { type: "cross" },
            formatter: (params: any) => {
                if (!Array.isArray(params)) return "";
                const { name, value } = params[0]; // Use the first series for tooltip
                return `Date: ${name}<br>Species Richness: ${Math.round(value[0])}<br>Species Abundance: ${Math.round(value[1])}`;
            },
        },
        xAxis: {
            type: "value",
            name: "Species Richness",
            nameLocation: "middle",
            nameTextStyle: { color: resolveCssVariable("--text"), fontSize: 14, padding: 20 },
            axisLabel: { textStyle: { color: resolveCssVariable("--text") } },
        },
        yAxis: {
            type: "value",
            name: "Species Abundance",
            nameLocation: "middle",
            nameTextStyle: { color: resolveCssVariable("--text"), fontSize: 14, padding: 40 },
            axisLabel: { textStyle: { color: resolveCssVariable("--text") } },
        },
        series: [
            {
                name: "Data Points",
                type: "scatter",
                data: scatterData,
                itemStyle: {
                    color: resolveCssVariable("--blue"),
                },
                emphasis: {
                    itemStyle: {
                        color: "peachpuff", // Highlight color for hovered point
                        borderColor: "black",
                        borderWidth: 1,
                    },
                },
            },
        ],
        grid: {
            left: "10%",
            right: "10%",
            bottom: "15%",
            top: "10%",
            containLabel: true,
        },
    };
    

    return (
        <div
            style={{
                display: "flex",
                backgroundColor: "var(--surface0)",
                borderRadius: "var(--radius)",
                overflow: "hidden",
                aspectRatio: "1/1",
                maxWidth: "30rem",
                minWidth: "30rem",
                flex: "1",
            }}
        >
            <ReactECharts option={chartOptions} style={{ height: "100%", width: "100%" }} />
        </div>
    );
};

export default BioGraphCard;
