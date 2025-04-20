// src/models/Vehicle.js
import { v4 as uuidv4 } from 'uuid';

class Vehicle {
    constructor(id = uuidv4(), params = {}, inspections = []) {
      this.id = id;
      this.inspections = inspections || []; // Ensure it's always an array
      
      // Extract data from params object
      this.vin = params.vin || '';
      this.plate = params.plate || '';
      this.state = params.state || '';
      
      // Store basic vehicle info (might be populated later via decoding)
      this.make = params.make || '';
      this.model = params.model || '';
      this.year = params.year || '';
      
      // Additional properties that might come from decoding
      this.engine = params.engine || '';
    }
    
    // Method to check if we have enough info to identify the vehicle
    hasIdentifier() {
      return this.vin || (this.plate && this.state);
    }
    
    // Helper method to get a display name for the vehicle
    getDisplayName() {
      if (this.year && this.make && this.model) {
        return `${this.year} ${this.make} ${this.model} ${this.engine ? ' ' + this.engine : ''}`;
      } else if (this.vin) {
        return `Vehicle (VIN: ${this.vin.slice(-4)})`;
      } else if (this.plate) {
        return `Vehicle (Plate: ${this.plate}, ${this.state})`;
      }
      return 'Unknown Vehicle';
    }
    
    // Add a new inspection to this vehicle
    addInspection(inspection) {
      if (!this.inspections) {
        this.inspections = [];
      }
      this.inspections.push(inspection);
      console.log(`Added inspection ${inspection.id} to vehicle ${this.id}`);
      return inspection;
    }
    
    // Get all inspections for this vehicle
    getInspections() {
      return this.inspections || [];
    }
    
    // Get a specific inspection by ID
    getInspection(inspectionId) {
      if (!this.inspections) return null;
      return this.inspections.find(inspection => inspection.id === inspectionId);
    }
    
    // Get the most recent inspection
    getLatestInspection() {
      if (!this.inspections || this.inspections.length === 0) return null;
      
      // Sort inspections by date (newest first) and return the first one
      return [...this.inspections].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      })[0];
    }
    
    // Convert to JSON for storage/transmission
    toJSON() {
      return {
        id: this.id,
        vin: this.vin,
        plate: this.plate,
        state: this.state,
        make: this.make,
        model: this.model,
        year: this.year,
        engine: this.engine,
        inspections: this.inspections ? this.inspections.map(inspection => 
          typeof inspection.toJSON === 'function' ? inspection.toJSON() : inspection
        ) : []
      };
    }
  }

  export default Vehicle;