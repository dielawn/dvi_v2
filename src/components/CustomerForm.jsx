import React, { useState, useEffect } from 'react';
import DatabaseService from '../services/DatabaseService';

const CustomerForm = ({ name, setName, selectedCustomer, setSelectedCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  
  const dbService = new DatabaseService();
  
  // Load customers when component mounts
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const data = await dbService.getCustomers();
        console.log('Loaded customers:', data);
        setCustomers(data);
      } catch (error) {
        console.error('Failed to load customers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCustomers();
  }, []);
  
  // Update suggestions when name changes
  useEffect(() => {
    if (name && customers.length) {
      // Filter customers that match the name (case insensitive)
      const matches = customers.filter(customer => 
        customer.name.toLowerCase().includes(name.toLowerCase())
      );
      
      // Find an exact match (case insensitive)
      const exactMatch = customers.find(customer => 
        customer.name.toLowerCase() === name.toLowerCase()
      );
      
      if (exactMatch) {
        // If exact match, automatically select that customer
        console.log('Found exact match:', exactMatch);
        setSelectedCustomer(exactMatch.id);
      } else if (matches.length > 0) {
        // Show suggestions
        setSuggestions(matches);
      } else {
        // Clear suggestions if no matches
        setSuggestions([]);
        // Clear selected customer when no matches
        setSelectedCustomer('');
      }
    } else {
      // Clear suggestions when name is empty
      setSuggestions([]);
      // Clear selected customer when name is empty
      setSelectedCustomer('');
    }
  }, [name, customers, setSelectedCustomer]);
  
  // Handle selecting a suggestion
  const handleSelectSuggestion = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customerId);
    setName(customer.name);
    setSuggestions([]);
  };
  
  return (
    <div className="customer-form">
      <h2>Customer Information</h2>
      
      {isLoading ? (
        <p>Loading customer data...</p>
      ) : (
        <>
          <div className="form-group">
            <label>Customer Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter customer name"
            />
          </div>
          
          {/* Customer suggestions */}
          {suggestions.length > 0 && !selectedCustomer && (
            <div className="customer-suggestions">
              <p>Existing customers found:</p>
              <ul>
                {suggestions.map(customer => (
                  <li key={customer.id}>
                    <button 
                      type="button" 
                      onClick={() => handleSelectSuggestion(customer.id)}
                    >
                      {customer.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {selectedCustomer && (
            <div className="selected-customer-info">
              <p>Selected existing customer: <strong>{customers.find(c => c.id === selectedCustomer)?.name}</strong></p>
              <button 
                type="button" 
                className="clear-selection-btn"
                onClick={() => {
                  setSelectedCustomer('');
                  setName('');
                }}
              >
                Clear Selection
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerForm;