import { Coordinate } from "../types";


interface SidebarProps {
    coordinates: Coordinate[];
    onLocationClick: (coord: Coordinate) => void; // Callback for handling location click
}

const LocationSidebar: React.FC<SidebarProps> = ({ coordinates, onLocationClick }) => {
    return (
        <div style={{ flex: "1", width: "300px", backgroundColor: "var(--surface0)", padding: "1rem", paddingRight: "0rem", borderRadius: "8px" }}>
            <h2>Locations</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
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
                        }}
                        onClick={() => onLocationClick(coord)} // Trigger callback on click
                        onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "var(--surface2)";
                            (e.target as HTMLElement).style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.backgroundColor = "var(--surface1)";
                            (e.target as HTMLElement).style.transform = "scale(1)";
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
