import React, { useState, useEffect } from 'react';
import DatabaseService from '../services/DatabaseService';

const WorkOrderForm = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [message, setMessage] = useState('');
  
  const dbService = new DatabaseService();

  useEffect(() => {
    // Load customers when component mounts
    const loadCustomers = async () => {
      try {
        const data = await dbService.getCustomers();
        console.log('Loaded customers:', data);
        setCustomers(data);
      } catch (error) {
        console.error('Failed to load customers:', error);
        setMessage('Error: Failed to load customers.');
      }
    };
    
    loadCustomers();
  }, []);

  const handleCustomerChange = async (customerId) => {
    setSelectedCustomer(customerId);
    
    if (customerId) {
      try {
        const customer = await dbService.getCustomer(customerId);
        console.log('Selected customer details:', customer);
        setCustomerVehicles(customer.vehicles || []);
      } catch (error) {
        console.error('Failed to load customer vehicles:', error);
        setMessage('Error: Failed to load customer vehicles.');
      }
    } else {
      setCustomerVehicles([]);
    }
    
    setSelectedVehicle('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const workOrderData = {
        workOrderNumber,
        customerId: selectedCustomer,
        vehicleId: selectedVehicle,
      };
      
      console.log('Creating inspection:', workOrderData);
      const result = await dbService.createWorkOrder(workOrderData);
      console.log('Inspection created:', result);
      
      // Show success message
      setMessage('Inspection created successfully!');
      
      // Reset form
      setWorkOrderNumber('');
      setSelectedCustomer('');
      setSelectedVehicle('');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating work order:', error);
      setMessage('Error: Failed to create new inspection.');
    }
  };

  return (
    <div className="work-order-form">
      <h2>Create New Inspection</h2>
      
      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Work Order #:</label>
          <input
            type="text"
            value={workOrderNumber}
            onChange={(e) => setWorkOrderNumber(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Customer:</label>
          <select 
            value={selectedCustomer}
            onChange={(e) => handleCustomerChange(e.target.value)}
            required
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Vehicle:</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            required
            disabled={!selectedCustomer}
          >
            <option value="">Select Vehicle</option>
            {customerVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </div>
        
        <button type="submit">New Inspection</button>
      </form>
    </div>
  );
};

export default WorkOrderForm;