import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { resolveCssVariable } from "../utils/cssUtils";

interface BioGraphCardProps {
    sensor: string;
}

const BioGraphCard: React.FC<BioGraphCardProps> = ({ sensor }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch biodiversity data for the given sensor
                const response = await fetch(`/api/sensors/${sensor}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch biodiversity data");
                }
                const result = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sensor]);
    console.log(data);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data || data.length === 0) return <div>No data available.</div>;

    // Group and preprocess the fetched data
    const groupedData = data.reduce((acc, { date, amount, prediction_category }) => {
        if (!acc[date]) {
            acc[date] = { categories: new Set(), amountSum: 0 };
        }
        acc[date].categories.add(prediction_category);
        acc[date].amountSum += amount;
        return acc;
    }, {} as Record<string, { categories: Set<string>; amountSum: number }>);

    const processedData = Object.entries(groupedData).map(([date, { categories, amountSum }]) => ({
        date,
        categoryCount: categories.size,
        amountSum,
    }));

    processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const scatterData = processedData.map(({ categoryCount, amountSum, date }) => ({
        value: [categoryCount, amountSum],
        name: date,
    }));

    const chartOptions = {
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "cross" },
            formatter: (params: any) => {
                if (!Array.isArray(params)) return "";
                const { name, value } = params[0];
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
                        color: "peachpuff",
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
