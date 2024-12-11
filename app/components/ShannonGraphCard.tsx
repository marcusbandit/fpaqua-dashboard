import React from "react";
import ReactECharts from "echarts-for-react";
import { resolveCssVariable } from "../utils/cssUtils";
import { GraphDataPoint } from "../types";

interface ShannonGraphCardProps {
    data: GraphDataPoint[];
}

function getWeekKey(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const tempDate = new Date(date.valueOf());
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
    const yearStart = new Date(tempDate.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

    const year = tempDate.getFullYear();
    const weekKey = `${year}-W${String(weekNo).padStart(2, "0")}`;
    return weekKey;
}

const ShannonGraphCard: React.FC<ShannonGraphCardProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div>No data available. Click on a location to load data.</div>;
    }

    // Group data by week
    const groupedByWeek = data.reduce((acc, { date, amount, prediction_category }) => {
        const weekKey = getWeekKey(date);
        if (!weekKey) return acc;

        if (!acc[weekKey]) {
            acc[weekKey] = { categories: new Map<string, number>(), amountSum: 0 };
        }
        const weekData = acc[weekKey];
        weekData.categories.set(
            prediction_category,
            (weekData.categories.get(prediction_category) || 0) + amount
        );
        weekData.amountSum += amount;

        return acc;
    }, {} as Record<string, { categories: Map<string, number>; amountSum: number }>);

    const calculateShannonIndex = (categories: Map<string, number>, amountSum: number) => {
        let shannonIndex = 0;
        categories.forEach((amount) => {
            const proportion = amount / amountSum;
            shannonIndex -= proportion * Math.log2(proportion);
        });
        return shannonIndex;
    };

    // Process weekly data
    const processedData = Object.entries(groupedByWeek).map(([weekKey, { categories, amountSum }]) => ({
        weekKey,
        shannonIndex: calculateShannonIndex(categories, amountSum),
    }));

    // Sort by weekKey
    processedData.sort((a, b) => a.weekKey.localeCompare(b.weekKey));

    const chartOptions = {
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross",
                snap: true,
                label: {
                    backgroundColor: "peachpuff",
                },
                lineStyle: {
                    color: resolveCssVariable("--blue"),
                },
            },
            formatter: (params: any) => {
                if (!Array.isArray(params)) return "";
                const { name, value } = params[0];
                return `Week: ${name}<br>Shannon Index: ${value.toFixed(2)}`;
            },
        },
        xAxis: {
            type: "category",
            name: "Week",
            nameLocation: "middle",
            nameTextStyle: { color: resolveCssVariable("--text"), fontSize: 14, padding: 20 },
            axisLabel: { textStyle: { color: resolveCssVariable("--text") } },
            data: processedData.map(({ weekKey }) => weekKey),
        },
        yAxis: {
            type: "value",
            name: "Shannon Index",
            nameLocation: "middle",
            nameTextStyle: { color: resolveCssVariable("--text"), fontSize: 14, padding: 40 },
            axisLabel: { textStyle: { color: resolveCssVariable("--text") } },
        },
        series: [
            {
                name: "Shannon Index",
                type: "line",
                data: processedData.map(({ shannonIndex }) => shannonIndex),
                symbolSize: 10,
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
                flexDirection: "column",
                backgroundColor: "var(--surface0)",
                borderRadius: "var(--radius)",
                overflow: "hidden",
                flexGrow: 1,
                flex: 1,
            }}
        >
            {/* Header Section */}
            <div style={{ padding: "1rem" }}>
                <h3 style={{ margin: 0 }}>Shannon Index Over Weeks</h3>
            </div>

            {/* Chart Section */}
            <div style={{ flexGrow: 1, height: "100%", width: "100%" }}>
                <ReactECharts option={chartOptions} style={{ height: "100%", width: "100%" }} />
            </div>
        </div>
    );
};

export default ShannonGraphCard;
