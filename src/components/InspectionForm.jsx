// src/components/InspectionForm.jsx
import React, { useEffect, useState } from 'react';
import DatabaseService from '../services/DatabaseService';
import CustomerForm from './CustomerForm';
import VehicleForm from './VehicleForm';
import Vehicle from '../models/Vehicle';

const InspectionForm = ({ startInspection }) => {
    const [name, setName] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [vehicles, setVehicles] = useState([new Vehicle(null, {})]);
    const [message, setMessage] = useState('');
    const [workOrderNumber, setWorkOrderNumber] = useState('');

    const dbService = new DatabaseService();

    useEffect(() => {
        if (vehicles.id) {
            console.log('vehicles', vehicles)
        }        
    }, [vehicles])

    const handleInspectVehicle = (vehicle) => {
        if (!vehicle.hasIdentifier()) {
            setMessage('Error: Vehicle must have VIN or license plate to be inspected.');
            return;
        }
        
        // Make sure we have a proper Vehicle instance
        if (startInspection && typeof startInspection === 'function') {
            // Ensure we're passing a Vehicle instance
            const vehicleToInspect = vehicle instanceof Vehicle 
                ? vehicle 
                : new Vehicle(vehicle.id, vehicle, vehicle.inspections);
                
            startInspection(vehicleToInspect, workOrderNumber);
        } else {
            console.warn('startInspection function not provided to InspectionForm');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
          // Only include vehicles that have at least one identifier (VIN or plate+state)
          const validVehicles = vehicles.filter(vehicle => vehicle.hasIdentifier());
          
          if (validVehicles.length === 0) {
            setMessage('Error: At least one vehicle with VIN or license plate is required.');
            return;
          }
          
          // If we're using an existing customer
          if (selectedCustomer) {
            // Handle adding vehicles to existing customer
            // You'd need to implement this in your DatabaseService
            const result = await dbService.addVehiclesToCustomer(selectedCustomer, validVehicles);
            console.log('Vehicles added to existing customer:', result);
            setMessage('Vehicles added to customer successfully!');
          } else {
            // Create new customer with vehicles
            const customerData = {
              name,
              vehicles: validVehicles,
            };
            
            console.log('Submitting customer data:', customerData);
            const result = await dbService.createCustomer(customerData);
            console.log('Customer saved:', result);
            setMessage('Customer added successfully!');
          }
          
          // Reset form
          setName('');
          setSelectedCustomer('');
          setVehicles([new Vehicle(null, {})]);
          setWorkOrderNumber('');
          
          // Clear message after 3 seconds
          setTimeout(() => setMessage(''), 3000);
        } catch (error) {
          console.error('Error saving data:', error);
          setMessage('Error: Failed to save data.');
        }
    };

    function copyVIN() {
        navigator.clipboard.writeText('1GDHG31U151174058 ')
        .then(() => {
            setMessage('Text copied to clipboard');
        })
        .catch(err => {
            setMessage('Failed to copy text: ', err);
        });
    }

    return (
        <div className="inspection-form-container">
            <h1>New Inspection</h1>
            <button onClick={copyVIN}>Copy VIN</button>
            {message && (
                <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
                    {message}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <CustomerForm 
                    name={name} 
                    setName={setName}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}    
                />

                <div className="form-group">
                    <label>Work Order #:</label>
                    <input
                        type="text"
                        value={workOrderNumber}
                        onChange={(e) => setWorkOrderNumber(e.target.value)}
                        placeholder="Enter work order number (optional)"
                    />
                </div>

                <h3>Vehicles</h3>
                {vehicles.map((vehicle, index) => (
                    <div key={index} className="vehicle-container">
                        {index > 0 && <hr />}
                        <VehicleForm
                            vehicle={vehicle}
                            vehicles={vehicles}
                            setVehicles={setVehicles}
                            index={index}
                        />
                        <button 
                            type="button"
                            onClick={() => handleInspectVehicle(vehicle)}
                            disabled={!vehicle.hasIdentifier()}
                            className="inspect-btn"
                        >
                            <strong>Inspect:</strong> {vehicle.getDisplayName()}
                        </button>
                    </div>
                ))}
                
                <div className="form-actions">
                    <button type="submit" className="submit-btn">
                        Save Customer & Vehicles
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InspectionForm;