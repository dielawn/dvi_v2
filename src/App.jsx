import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InspectionForm from './components/InspectionForm';
import WorkOrderForm from './components/WorkOrderForm';
import InspectionSearch from './components/InspectionSearch';
import InspectionDetail from './components/InspectionDetail';
import DVI from './components/DVI';
import './App.css';

function App() {
  // Main app container with routing
  return (
    <Router>
      <Routes>
        {/* Main route with nested routes for tabs */}
        <Route path="/" element={<MainApp />} />
        
        {/* Inspection detail route */}
        <Route path="/inspection/:id" element={<InspectionDetail />} />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// Main application component with tabs
function MainApp() {
  const [activeTab, setActiveTab] = useState('customer');
  const [inspectionMode, setInspectionMode] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [workOrderNumber, setWorkOrderNumber] = useState('');

  const tabs = [
    {id: 'customer', label: 'New Customer'}, 
    {id: 'inspection', label: 'New Inspection'},
    {id: 'search', label: 'Search'}
  ];
  
  const handleBackToMain = () => {
    setInspectionMode(false);
    setSelectedVehicle(null);
  };
  
  const handleStartInspection = (vehicle, workOrder) => {
    // Store the vehicle ID instead of the whole vehicle object
    console.log('Starting inspection for vehicle:', vehicle);
    setSelectedVehicle(vehicle);
    setWorkOrderNumber(workOrder || '');
    setInspectionMode(true);
  };
  
  const handleInspectionSaved = (inspection) => {
    try {
      console.log('Inspection saved:', inspection);
      
      // Instead of trying to add the inspection to the vehicle here,
      // we'll just log the success and return to the main screen
      console.log('Inspection completed for vehicle:', selectedVehicle.id);
      
      // In a real app, you would save this to your database
      alert('Inspection saved successfully!');
      
      // Go back to the main screen
      handleBackToMain();
    } catch (error) {
      console.error('Error handling saved inspection:', error);
      alert('Error saving inspection. Please try again.');
    }
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>Digital Vehicle Inspection</h1>
        {!inspectionMode && (
          <nav>
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}  
              </button>
            ))}
          </nav>
        )}
      </header>
      
      <main>
        {inspectionMode ? (
          <>
            <button onClick={handleBackToMain} className="back-btn">
              &larr; Back to Main
            </button>
            <DVI 
              vehicleId={selectedVehicle.id} 
              workOrder={workOrderNumber}
              onInspectionSaved={handleInspectionSaved}
            />
          </>
        ) : (
          activeTab === 'customer' ? (
            <InspectionForm startInspection={handleStartInspection} />
          ) : activeTab === 'inspection' ? (
            <WorkOrderForm startInspection={handleStartInspection} />
          ) : (
            <InspectionSearch startInspection={handleStartInspection} />
          )
        )}
      </main>
    </div>
  );
}

export default App;