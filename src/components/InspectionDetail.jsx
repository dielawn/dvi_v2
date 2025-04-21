import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatabaseService from '../services/DatabaseService';
import './InspectionDetail.css';

const InspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const dbService = new DatabaseService();

  // Load inspection data
  useEffect(() => {
    const loadInspection = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch the inspection by ID
        const data = await dbService.getInspection(id);
        console.log('Loaded inspection:', data);
        setInspection(data);
        
        // Fetch the vehicle details
        if (data.vehicle_id) {
          // First, we need to find which customer owns this vehicle
          const vehicles = await dbService.getVehicleById(data.vehicle_id);
          if (vehicles) {
            setVehicle(vehicles);
            
            // Now fetch the customer
            if (vehicles.customer_id) {
              const customerData = await dbService.getCustomer(vehicles.customer_id);
              setCustomer(customerData);
            }
          }
        }
      } catch (error) {
        console.error('Error loading inspection:', error);
        setError('Error loading inspection. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadInspection();
    }
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Calculate status summary
  const calculateSummary = () => {
    const statusCounts = {
      'Good': 0,
      'Needs Attention': 0,
      'Safety Concern': 0,
      'N/A': 0
    };
    
    if (inspection && inspection.items) {
      inspection.items.forEach(item => {
        if (statusCounts.hasOwnProperty(item.status)) {
          statusCounts[item.status]++;
        }
      });
    }
    
    return statusCounts;
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">Loading inspection details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!inspection) {
    return <div className="error-message">Inspection not found.</div>;
  }

  return (
    <div className="inspection-detail">
      <div className="inspection-actions non-printable">
        <button onClick={handleBack} className="back-btn">
          &larr; Back
        </button>
        <button onClick={handlePrint} className="print-btn">
          Print
        </button>
      </div>
      
      <div className="inspection-header">
        <h1>Inspection Report</h1>
        <div className="inspection-meta">
          <div className="inspection-id">
            <strong>Inspection ID:</strong> {inspection.id}
          </div>
          <div className="inspection-date">
            <strong>Date:</strong> {formatDate(inspection.date)}
          </div>
          {inspection.work_order && (
            <div className="work-order">
              <strong>Work Order:</strong> {inspection.work_order}
            </div>
          )}
          <div className="technician">
            <strong>Technician:</strong> {inspection.technician_id}
          </div>
        </div>
      </div>
      
      {customer && (
        <div className="customer-info">
          <h2>Customer Information</h2>
          <div className="info-row">
            <strong>Name:</strong> {customer.name}
          </div>
          {customer.phone && (
            <div className="info-row">
              <strong>Phone:</strong> {customer.phone}
            </div>
          )}
          {customer.email && (
            <div className="info-row">
              <strong>Email:</strong> {customer.email}
            </div>
          )}
        </div>
      )}
      
      {vehicle && (
        <div className="vehicle-info">
          <h2>Vehicle Information</h2>
          <div className="info-row">
            <strong>Vehicle:</strong> {vehicle.year} {vehicle.make} {vehicle.model}
          </div>
          {vehicle.vin && (
            <div className="info-row">
              <strong>VIN:</strong> {vehicle.vin}
            </div>
          )}
          {vehicle.plate && (
            <div className="info-row">
              <strong>License Plate:</strong> {vehicle.plate} {vehicle.state ? `(${vehicle.state})` : ''}
            </div>
          )}
          {vehicle.engine && (
            <div className="info-row">
              <strong>Engine:</strong> {vehicle.engine}
            </div>
          )}
        </div>
      )}
      
      <div className="inspection-summary">
        <h2>Inspection Summary</h2>
        <div className="status-counts">
          {Object.entries(calculateSummary()).map(([status, count]) => (
            <div key={status} className={`status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
              {status}: {count}
            </div>
          ))}
        </div>
      </div>
      
      <div className="inspection-items">
        <h2>Inspection Items</h2>
        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {inspection.items.map((item) => (
              <tr key={item.id} className={`status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                <td>{item.label}</td>
                <td className="status">{item.status}</td>
                <td>{item.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="signature-area">
        <div className="signature-box">
          <p>Technician Signature:</p>
          <div className="signature-line">
            {inspection.technician_id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetail;