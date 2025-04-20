import React, { useState, useEffect } from 'react';
import { Inspection } from "../models/Inspection";
import './DVI.css'

const DVI = ({ vehicleId, technicianId }) => {
    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Initialize inspection when component mounts
    useEffect(() => {
        // Create a new inspection or load existing one
        const initInspection = () => {
            try {
                // In a real app, you might fetch from database if exists
                // For now, we'll create a new one
                const newInspection = new Inspection(vehicleId, technicianId);
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
    }, [vehicleId, technicianId]);

    // Handle status change for an inspection item
    const handleStatusChange = (itemId, newStatus) => {
        if (!inspection) return;

        const updatedInspection = {...inspection};
        const result = updatedInspection.updateItemStatus(itemId, newStatus);
        
        if (result) {
            setInspection(updatedInspection);
            console.log(`Updated status for item ${itemId} to ${newStatus}`);
        } else {
            setMessage(`Failed to update status for item`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Handle notes change for an inspection item
    const handleNotesChange = (itemId, notes) => {
        if (!inspection) return;

        const updatedInspection = {...inspection};
        const result = updatedInspection.updateItemNotes(itemId, notes);
        
        if (result) {
            setInspection(updatedInspection);
            console.log(`Updated notes for item ${itemId}`);
        } else {
            setMessage(`Failed to update notes for item`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Handle saving the inspection
    const handleSave = () => {
        // In a real application, you would save to database here
        console.log('Saving inspection:', inspection.toJSON());
        setMessage('Inspection saved successfully!');
        setTimeout(() => setMessage(''), 3000);
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
            
            {inspection && (
                <>
                    <div className="inspection-info">
                        <p><strong>Date:</strong> {inspection.date.toLocaleString()}</p>
                        <p><strong>Inspection ID:</strong> {inspection.id}</p>
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
                            {Object.entries(inspection.getSummary().statusCounts).map(([status, count]) => (
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