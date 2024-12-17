import { Coordinate } from "../types";


interface SidebarProps {
    coordinates: Coordinate[];
    onLocationClick: (coord: Coordinate) => void; // Callback for handling location click
}

const LocationSidebar: React.FC<SidebarProps> = ({ coordinates, onLocationClick }) => {
    return (
        <div style={{ width: "100%", height: "fit-content", maxHeight: "400px", backgroundColor: "var(--surface0)", padding: "1rem", borderRadius: "8px" }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem", fontWeight: "bold" }}>Locations:</h2>
            <ul style={{ height: "fit-content", listStyle: "none", padding: 0 }}>
                {coordinates.map((coord, index) => (
                    <li
                        key={index}
                        style={{
                            padding: "0.5rem",
                            cursor: "pointer",
                            backgroundColor: "var(--surface1)",
                            borderRadius: "4px",
                            marginBottom: "0.5rem",
                            transition: "background-color 0.3s ease, transform 0.2s ease",
                            maxWidth: "300px",
                        }}
                        onClick={() => onLocationClick(coord)} // Trigger callback on click
                        onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "var(--surface2)";
                            (e.target as HTMLElement).style.transform =  "translateX(10px)";
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "var(--surface1)";
                            (e.target as HTMLElement).style.transform = "translateX(0)";
                        }}
                    >
                        {coord.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LocationSidebar;
