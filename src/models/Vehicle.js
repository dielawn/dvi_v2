import { v4 as uuidv4 } from 'uuid';

class Vehicle {
    constructor(id = uuidv4(), params = {}, inspections = []) {
      this.id = id;
      this.inspections = inspections;
      
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
  }

  export default Vehicle 

                        //   Examples
//   // Create with VIN
// const vehicle1 = new Vehicle(null, { vin: '1HGCM82633A004352' });

// // Create with plate and state
// const vehicle2 = new Vehicle(null, { plate: 'ABC123', state: 'CA' });

// // Create with already-decoded info
// const vehicle3 = new Vehicle(null, {
//   vin: '1HGCM82633A004352',
//   make: 'Honda',
//   model: 'Accord',
//   year: '2003'
// });