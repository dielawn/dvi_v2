import React, { useState } from 'react';
import InspectionForm from './components/InspectionForm';
import WorkOrderForm from './components/WorkOrderForm';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('customer');

  const tabs = [
    {id: 'customer', label: 'New Customer'}, 
    {id: 'inspection', label: 'New Inspection'},
    {id: 'search', label: 'Search'}
  ]
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>Digital Vehicle Inspection</h1>
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
      </header>
      
      <main>
        {activeTab === 'customer' ? (
          <InspectionForm />
        ) : (
          <WorkOrderForm />
        )}
      </main>
    </div>
  );
}

export default App;