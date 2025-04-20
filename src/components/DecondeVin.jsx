import { useState } from "react"
import { decodeVIN } from "../utils/utils";

const DecodeVin = ({ setVehicleData }) => {
    const [vin, setVin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleVinDecode() {
        // Reset states
        setError('');
        setIsLoading(true);
        
        try {
            // Validation
            if (!vin || vin.trim() === '') {
                throw new Error('Please enter a VIN');
            }
            
            if (vin.length !== 17) {
                throw new Error('VIN must be exactly 17 characters');
            }
            
            // Check for invalid characters
            if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
                throw new Error('VIN contains invalid characters');
            }
            
            // Decode VIN
            const decodedVehicle = await decodeVIN(vin);
            
            // Check if we got valid data back
            if (!decodedVehicle.make && !decodedVehicle.model) {
                throw new Error('Could not decode this VIN. Please check and try again.');
            }
            
            // Update parent component with the vehicle data
            setVehicleData(decodedVehicle);
            console.log('Successfully decoded VIN:', decodedVehicle);
            
        } catch (error) {
            console.error('VIN decode error:', error.message);
            setError(error.message);
            setVehicleData(null); // Clear any previous data
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <div className="form-group">
                <label>VIN:</label>
                <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="Vehicle Identification Number"
                    maxLength={17}
                />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button 
                onClick={handleVinDecode} 
                disabled={isLoading}
            >
                {isLoading ? 'Decoding...' : 'Decode VIN'}
            </button>
        </div>
    )
}

export default DecodeVin