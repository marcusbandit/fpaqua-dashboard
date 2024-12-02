// Define in MapCard or a shared types file (e.g., app/types.ts)
export interface Coordinate {
    lat: number;
    lng: number;
    name?: string;
}

export interface GraphDataPoint {
    date: string;
    prediction_category: string;
    amount: number;
}

export interface CsvRow {
    prediction_category: string;
    amount: number;
    date: string;
}