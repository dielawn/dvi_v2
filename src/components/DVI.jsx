import React, { useState, useEffect } from 'react';
import { Inspection, InspectionItem } from "../models/Inspection";
import './DVI.css';
import DatabaseService from '../services/DatabaseService';

const DVI = ({ vehicleId, workOrder, onInspectionSaved }) => {
    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [technicianId, setTechnicianId] = useState('');

    // Initialize inspection when component mounts
    useEffect(() => {
        // Create a new inspection or load existing one
        const initInspection = () => {
            try {
                // If technicianId is not set yet, don't create the inspection
                if (!technicianId) {
                    setLoading(false);
                    return;
                }
                
                // In a real app, you might fetch from database if exists
                // For now, we'll create a new one
                const newInspection = new Inspection(vehicleId, technicianId, undefined, workOrder);
                console.log('Inspection initialized:', newInspection);
                setInspection(newInspection);
            } catch (error) {
                console.error('Failed to initialize inspection:', error);
                setMessage('Error initializing inspection');
            } finally {
                setLoading(false);
            }
        };

        initInspection();
    }, [vehicleId, technicianId, workOrder]);

    // Handle status change for an inspection item
    const handleStatusChange = (itemId, newStatus) => {
        if (!inspection) return;

        // Create a deep copy of the inspection
        const newInspection = new Inspection(
            inspection.vehicleId,
            inspection.technicianId,
            inspection.id,
            inspection.workOrder
        );
        
        // Copy date
        newInspection.date = new Date(inspection.date);
        
        // Copy items properly using InspectionItem instances
        newInspection.items = inspection.items.map(item => {
            // If this is the item we want to update
            if (item.id === itemId) {
                // Create a new InspectionItem with the updated status
                return new InspectionItem(
                    item.id,
                    item.label,
                    newStatus,
                    item.notes
                );
            }
            // Otherwise return a copy of the original item
            return new InspectionItem(
                item.id,
                item.label,
                item.status,
                item.notes
            );
        });
        
        console.log(`Updated status for item ${itemId} to ${newStatus}`);
        setInspection(newInspection);
    };

    // Handle notes change for an inspection item
    const handleNotesChange = (itemId, notes) => {
        if (!inspection) return;

        // Create a deep copy of the inspection
        const newInspection = new Inspection(
            inspection.vehicleId,
            inspection.technicianId,
            inspection.id,
            inspection.workOrder
        );
        
        // Copy date
        newInspection.date = new Date(inspection.date);
        
        // Copy items properly using InspectionItem instances
        newInspection.items = inspection.items.map(item => {
            // If this is the item we want to update
            if (item.id === itemId) {
                // Create a new InspectionItem with the updated notes
                return new InspectionItem(
                    item.id,
                    item.label,
                    item.status,
                    notes
                );
            }
            // Otherwise return a copy of the original item
            return new InspectionItem(
                item.id,
                item.label,
                item.status,
                item.notes
            );
        });
        
        console.log(`Updated notes for item ${itemId}`);
        setInspection(newInspection);
    };

    // Handle saving the inspection
    const handleSave = async () => {
        try {
          // Create a database service instance
          const dbService = new DatabaseService();
          
          // Save the inspection to the database
          const savedInspection = await dbService.saveInspection(inspection.toJSON());
          console.log('Inspection saved to database:', savedInspection);
          
          setMessage('Inspection saved successfully!');
          
          // Call the callback function to return to the main screen
          if (onInspectionSaved && typeof onInspectionSaved === 'function') {
            onInspectionSaved(inspection);
          }
        } catch (error) {
          console.error('Error saving inspection:', error);
          setMessage('Error: Failed to save inspection');
        }
      };

    // Handle technician ID input
    const handleTechnicianIdChange = (e) => {
        setTechnicianId(e.target.value.toUpperCase());
    };

    // Start inspection
    const handleStartInspection = (e) => {
        e.preventDefault();
        if (!technicianId.trim()) {
            setMessage('Error: Technician ID is required');
            return;
        }
        
        // Re-initialize the inspection with technician ID
        try {
            const newInspection = new Inspection(vehicleId, technicianId, undefined, workOrder);
            console.log('Inspection started with technician:', technicianId);
            console.log('Inspection data:', newInspection);
            setInspection(newInspection);
            setMessage('Inspection started successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to start inspection:', error);
            setMessage('Error starting inspection');
        }
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

    

    if (loading) {
        return <div>Loading inspection...</div>;
    }

    return (
        <div className="dvi-container">
            <h2>Digital Vehicle Inspection</h2>
            
            {message && (
                <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
                    {message}
                </div>
            )}
            
            {!inspection ? (
                <div className="technician-form">
                    <form onSubmit={handleStartInspection}>
                        <div className="form-group">
                            <label htmlFor="technicianId">Technician Initials:</label>
                            <input
                                id="technicianId"
                                type="text"
                                value={technicianId}
                                onChange={handleTechnicianIdChange}
                                placeholder="Enter your initials"
                                maxLength={3}
                                required
                            />
                        </div>
                        <button type="submit" className="start-btn">
                            Start Inspection
                        </button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="inspection-info">
                        <p><strong>Date:</strong> {inspection.date.toLocaleString()}</p>
                        <p><strong>Inspection ID:</strong> {inspection.id}</p>
                        <p><strong>Technician:</strong> {inspection.technicianId}</p>
                        {workOrder && <p><strong>Work Order:</strong> {workOrder}</p>}
                    </div>
                    
                    <div className="inspection-items">
                        <table className="inspection-table">
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
                                        <td>
                                            <select 
                                                value={item.status}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                            >
                                                {inspection.statusOptions.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <textarea
                                                value={item.notes}
                                                onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                                placeholder="Add notes..."
                                                rows="2"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="inspection-summary">
                        <h3>Summary</h3>
                        <div className="status-counts">
                            {Object.entries(calculateSummary()).map(([status, count]) => (
                                <div key={status} className={`status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {status}: {count}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="inspection-actions">
                        <button onClick={handleSave} className="save-btn">
                            Save Inspection
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default DVI;