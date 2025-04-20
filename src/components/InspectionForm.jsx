import React, { useEffect, useState } from 'react';
import DatabaseService from '../services/DatabaseService';
import CustomerForm from './CustomerForm';
import VehicleForm from './VehicleForm';
import Vehicle from '../models/Vehicle';

const InspectionForm = () => {
    const [name, setName] = useState('');
    const [vehicles, setVehicles] = useState([new Vehicle(null, {})]);
    const [message, setMessage] = useState('');

    const dbService = new DatabaseService();

    useEffect(() => {
        if (vehicles.id) {
            console.log('vehicles', vehicles)
        }        
    }, [vehicles])


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
          // Only include vehicles that have at least one identifier (VIN or plate+state)
          const validVehicles = vehicles.filter(vehicle => vehicle.hasIdentifier());
          
          if (validVehicles.length === 0) {
            setMessage('Error: At least one vehicle with VIN or license plate is required.');
            return;
          }
          
          const customerData = {
            name,
            vehicles: validVehicles,
          };
          
          console.log('Submitting customer data:', customerData);
          const result = await dbService.createCustomer(customerData);
          console.log('Customer saved:', result);
          
          // Show success message
          setMessage('Customer added successfully!');
          
          // Reset form
          setName('');
          setVehicles([new Vehicle(null, {})]);
          
          // Clear message after 3 seconds
          setTimeout(() => setMessage(''), 3000);
        } catch (error) {
          console.error('Error saving customer:', error);
          setMessage('Error: Failed to add customer.');
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
                <CustomerForm name={name} setName={setName} />

                <h3>Vehicles</h3>
                {vehicles.map((vehicle, index) => (
                    <div key={index} className="vehicle-container">
                        {index > 0 && <hr />}
                        <h4>Vehicle {index + 1}</h4>
                        <VehicleForm
                            vehicle={vehicle}
                            vehicles={vehicles}
                            setVehicles={setVehicles}
                            index={index}
                        />
                    </div>
                ))}
                
                <div className="form-actions">
                    <button type="submit" className="submit-btn">
                        Save Customer & Create Inspection
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InspectionForm;