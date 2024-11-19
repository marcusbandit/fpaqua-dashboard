import MapCard from './MapCard';
import useCoordinates from '../hooks/useCoordinates';

const Dashboard = () => {
    const { coordinates, isProcessing, startPreprocessing } = useCoordinates();

    return (
        <div>
            {isProcessing && <p>Processing new data, please wait...</p>}
            <button onClick={startPreprocessing} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Check for Missing Data'}
            </button>
            <MapCard coordinates={coordinates} />
        </div>
    );
};

export default Dashboard;
