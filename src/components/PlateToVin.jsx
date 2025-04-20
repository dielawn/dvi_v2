import { useState } from "react"
import { plateToVin } from "../utils/utils"

const PlateToVin = ({ setVehicleData }) => {
    const [plate, setPlate] = useState('');
    const [state, setState] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleDecodePlate() {
        // Clear previous messages
        setMessage('');
        
        // Validate inputs
        if (state.length !== 2) {
            setMessage('Please enter a valid 2-letter state code');
            return;
        }
        
        if (!plate.trim()) {
            setMessage('Please enter a license plate');
            return;
        }
        
        try {
            setIsLoading(true);
            console.log('Fetching data for plate:', plate, 'state:', state);
            const decodedVehicle = await plateToVin(state, plate);
            console.log('Received vehicle data:', decodedVehicle);
            
            if (!decodedVehicle) {
                setMessage('No vehicle found for this plate/state combination');
                return;
            }
            
            setVehicleData(decodedVehicle);
            setMessage('Vehicle found!');
        } catch (error) {
            console.error('Error decoding plate:', error);
            setMessage(`Error: ${error.message || 'Failed to decode plate'}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {message && <p className={message.includes('Error') || message.includes('Please') ? 'error-message' : 'success-message'}>{message}</p>}
            
            <div className="form-group">
                <label htmlFor="plate-input">License Plate:</label>
                <input
                    id="plate-input"
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder="License Plate"
                    disabled={isLoading}
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="state-input">State:</label>
                <input
                    id="state-input"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="State (2-letter code)"
                    maxLength={2}
                    disabled={isLoading}
                />
            </div>
            
            <button 
                onClick={handleDecodePlate} 
                disabled={isLoading || !plate.trim() || state.length !== 2}
            >
                {isLoading ? 'Decoding...' : 'Decode Plate'}
            </button>
        </>
    )
}

export default PlateToVin