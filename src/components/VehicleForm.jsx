import React, { useState, useEffect } from 'react';
import './VehicleForm.css'
import Vehicle from '../models/Vehicle';
import PlateToVin from './PlateToVin';
import DecodeVin from './DecondeVin';

const VehicleForm = ({ vehicle, vehicles, setVehicles, index }) => {
  // Local state to track changes before updating parent
  const [vehicleData, setVehicleData] = useState(vehicle || new Vehicle(null, {}));
  // Track which entry method is selected
  const [entryMethod, setEntryMethod] = useState('vin');
  
  // Update local state if the parent prop changes
  useEffect(() => {
    if (vehicleData) {
      // setVehicles(vehicle);
    }
  }, [vehicleData]);

  // Handle changes to any vehicle field
  const handleChange = (field, value) => {
    // Update local state first
    const updatedVehicle = new Vehicle(
      vehicleData.id,
      { ...vehicleData, [field]: value },
      vehicleData.inspections
    );
    setVehicleData(updatedVehicle);
    
    // Then update the parent state
    if (setVehicles && vehicles) {
      const updatedVehicles = [...vehicles];
      updatedVehicles[index] = updatedVehicle;
      setVehicles(updatedVehicles);
      console.log(`Updated ${field} to ${value}:`, updatedVehicle);
    }
  };
  
  // Handle adding a new vehicle
  const handleAddVehicle = () => {
    if (setVehicles && vehicles) {
      const newVehicles = [...vehicles, new Vehicle(null, {})];
      setVehicles(newVehicles);
      console.log('Added new vehicle. Total vehicles:', newVehicles.length);
    }
  };
  
  // Handle removing this vehicle
  const handleRemoveVehicle = () => {
    if (setVehicles && vehicles) {
      const updatedVehicles = vehicles.filter((_, i) => i !== index);
      setVehicles(updatedVehicles);
      console.log(`Removed vehicle at index ${index}. Total vehicles:`, updatedVehicles.length);
    }
  };

  // Determine if we should show the remove button (only if we have more than 1 vehicle)
  const showRemoveButton = vehicles && vehicles.length > 1;
  
  // Determine if we should show the add button (only on the last vehicle form)
  const isLastVehicle = index === (vehicles ? vehicles.length - 1 : 0);

  // Handle entry method selection
  const handleEntryMethodChange = (method) => {
    console.log(`Changed entry method to: ${method}`);
    setEntryMethod(method);
  };

  return (
    <div className="vehicle-form">
      {/* Entry method selection */}
      <div className="entry-method-selector">
        <div className="form-group">
          <label>Choose entry method:</label>
          <div className="entry-method-options">
            <label>
              <input
                type="radio"
                name={`entry-method-${index}`}
                value="vin"
                checked={entryMethod === 'vin'}
                onChange={() => handleEntryMethodChange('vin')}
              />
              VIN Lookup
            </label>
            <label>
              <input
                type="radio"
                name={`entry-method-${index}`}
                value="plate"
                checked={entryMethod === 'plate'}
                onChange={() => handleEntryMethodChange('plate')}
              />
              License Plate
            </label>
            <label>
              <input
                type="radio"
                name={`entry-method-${index}`}
                value="manual"
                checked={entryMethod === 'manual'}
                onChange={() => handleEntryMethodChange('manual')}
              />
              Manual Entry
            </label>
          </div>
        </div>
      </div>

      {/* VIN */}
      {entryMethod === 'vin' && (
        <div className="form-row">
          <DecodeVin setVehicleData={setVehicleData} />
        </div>
      )}

      {/* Plate & State */}
      {entryMethod === 'plate' && (
        <div className="form-row">
          <PlateToVin setVehicleData={setVehicleData}/>
        </div>
      )}

      {/* Manual entry fields or display fields populated from VIN/plate lookup */}
      {(entryMethod === 'manual' || vehicleData.make || vehicleData.model || vehicleData.year) && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label>Make:</label>
              <input
                type="text"
                value={vehicleData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                placeholder="Vehicle Make"
                readOnly={entryMethod !== 'manual'}
              />
            </div>
            <div className="form-group">
              <label>Model:</label>
              <input
                type="text"
                value={vehicleData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Vehicle Model"
                readOnly={entryMethod !== 'manual'}
              />
            </div>
            <div className="form-group">
              <label>Year:</label>
              <input
                type="text"
                value={vehicleData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                placeholder="Year"
                readOnly={entryMethod !== 'manual'}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Engine:</label>
              <input
                type="text"
                value={vehicleData.engine}
                onChange={(e) => handleChange('engine', e.target.value)}
                placeholder="Engine"
                readOnly={entryMethod !== 'manual'}
              />
            </div>

          </div>
        </>
      )}
      
      <div className="vehicle-actions">
        {showRemoveButton && (
          <button type="button" className="remove-btn" onClick={handleRemoveVehicle}>
            Remove Vehicle
          </button>
        )}
        
        {isLastVehicle && (
          <button type="button" className="add-btn" onClick={handleAddVehicle}>
            Add Another Vehicle
          </button>
        )}
      </div>

      {/* Display name preview if we have enough data */}
      {(vehicleData.make || vehicleData.model || vehicleData.year || vehicleData.vin || vehicleData.plate) && (
        <div className="vehicle-preview">
          {/* <strong>Preview:</strong> {vehicleData.getDisplayName()} */}
        </div>
      )}
    </div>
  );
};

export default VehicleForm;