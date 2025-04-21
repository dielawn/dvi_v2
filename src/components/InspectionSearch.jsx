import React, { useState, useEffect } from 'react';
import DatabaseService from '../services/DatabaseService';
import './InspectionSearch.css'; // We'll create this CSS file next

const InspectionSearch = () => {
  const [searchType, setSearchType] = useState('workOrder');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [inspections, setInspections] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const dbService = new DatabaseService();

  // Load customers for the dropdown
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await dbService.getCustomers();
        console.log('Loaded customers for search:', data);
        setCustomers(data);
      } catch (error) {
        console.error('Failed to load customers:', error);
        setError('Error loading customers. Please try again.');
      }
    };
    
    loadCustomers();
  }, []);

  // Load vehicles when a customer is selected
  useEffect(() => {
    const loadVehicles = async () => {
      if (!selectedCustomer) {
        setVehicles([]);
        return;
      }
      
      try {
        const customer = await dbService.getCustomer(selectedCustomer);
        console.log('Selected customer vehicles:', customer.vehicles);
        setVehicles(customer.vehicles || []);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
        setError('Error loading vehicles. Please try again.');
      }
    };
    
    if (searchType === 'customer' || searchType === 'vehicle') {
      loadVehicles();
    }
  }, [selectedCustomer, searchType]);

  // Handle search type change
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchTerm('');
    setSelectedCustomer('');
    setSelectedVehicle('');
    setInspections([]);
    setMessage('');
  };

  // Handle customer selection
  const handleCustomerChange = (e) => {
    setSelectedCustomer(e.target.value);
    setSelectedVehicle('');
  };

  // Handle vehicle selection
  const handleVehicleChange = (e) => {
    setSelectedVehicle(e.target.value);
  };

  // Handle search execution
  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    setInspections([]);
    
    try {
      let results = [];
      
      switch (searchType) {
        case 'workOrder':
          if (!searchTerm.trim()) {
            setError('Please enter a work order number.');
            break;
          }
          results = await dbService.searchInspectionsByWorkOrder(searchTerm);
          break;
          
        case 'customer':
          if (!selectedCustomer) {
            setError('Please select a customer.');
            break;
          }
          results = await dbService.searchInspectionsByCustomer(selectedCustomer);
          break;
          
        case 'vehicle':
          if (!selectedVehicle) {
            setError('Please select a vehicle.');
            break;
          }
          results = await dbService.getVehicleInspections(selectedVehicle);
          break;
          
        case 'date':
          if (!dateRange.startDate) {
            setError('Please select a start date.');
            break;
          }
          results = await dbService.searchInspectionsByDate(
            dateRange.startDate, 
            dateRange.endDate || dateRange.startDate
          );
          break;
          
        case 'technician':
          if (!searchTerm.trim()) {
            setError('Please enter technician initials.');
            break;
          }
          results = await dbService.searchInspectionsByTechnician(searchTerm);
          break;
      }
      
      console.log('Search results:', results);
      
      if (results.length === 0) {
        setMessage('No inspections found matching your search criteria.');
      } else {
        setInspections(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Error performing search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="inspection-search">
      <h2>Search Inspections</h2>
      
      {/* Error and message display */}
      {error && <div className="error-message">{error}</div>}
      {message && <div className="info-message">{message}</div>}
      
      {/* Search type selection */}
      <div className="search-controls">
        <div className="search-type">
          <label>Search by:</label>
          <select 
            value={searchType}
            onChange={handleSearchTypeChange}
          >
            <option value="workOrder">Work Order Number</option>
            <option value="customer">Customer</option>
            <option value="vehicle">Vehicle</option>
            <option value="date">Date Range</option>
            <option value="technician">Technician</option>
          </select>
        </div>
        
        {/* Search input based on type */}
        <div className="search-input">
          {searchType === 'workOrder' && (
            <div className="form-group">
              <label>Work Order #:</label>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter work order number"
              />
            </div>
          )}
          
          {searchType === 'customer' && (
            <div className="form-group">
              <label>Customer:</label>
              <select 
                value={selectedCustomer}
                onChange={handleCustomerChange}
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {searchType === 'vehicle' && (
            <div className="form-group">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer:</label>
                  <select 
                    value={selectedCustomer}
                    onChange={handleCustomerChange}
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
                    onChange={handleVehicleChange}
                    disabled={!selectedCustomer || vehicles.length === 0}
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {searchType === 'date' && (
            <div className="form-group">
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date:</label>
                  <input 
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>End Date:</label>
                  <input 
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    min={dateRange.startDate}
                  />
                </div>
              </div>
            </div>
          )}
          
          {searchType === 'technician' && (
            <div className="form-group">
              <label>Technician Initials:</label>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                placeholder="Enter technician initials"
                maxLength={3}
              />
            </div>
          )}
        </div>
        
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="search-btn"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {/* Search results */}
      {inspections.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <table className="inspections-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Work Order</th>
                <th>Vehicle</th>
                <th>Technician</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection) => (
                <tr key={inspection.id}>
                  <td>{formatDate(inspection.date)}</td>
                  <td>{inspection.work_order || 'N/A'}</td>
                  <td>
                    {inspection.vehicle_info ? 
                      `${inspection.vehicle_info.year} ${inspection.vehicle_info.make} ${inspection.vehicle_info.model}` : 
                      `Vehicle ID: ${inspection.vehicle_id}`
                    }
                  </td>
                  <td>{inspection.technician_id}</td>
                  <td>
                    {inspection.status_summary ? (
                      <div className="status-summary">
                        <span className="status-good">{inspection.status_summary.Good || 0} Good</span>
                        <span className="status-needs-attention">{inspection.status_summary['Needs Attention'] || 0} Attention</span>
                        <span className="status-safety-concern">{inspection.status_summary['Safety Concern'] || 0} Safety</span>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => window.open(`/inspection/${inspection.id}`, '_blank')}
                    >
                      View
                    </button>
                    <button 
                      className="print-btn"
                      onClick={() => window.open(`/inspection/print/${inspection.id}`, '_blank')}
                    >
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InspectionSearch;