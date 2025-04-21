// src/services/DatabaseService.js
class DatabaseService {
  constructor() {
    this.apiBaseUrl = '/api';
  }

  async getCustomers() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/customers.php`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched customers:', data);
        return data;
      } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
    }
  
    // Fetch a single customer
    async getCustomer(customerId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/customers.php?id=${customerId}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched customer:', data);
        return data;
      } catch (error) {
        console.error('Error fetching customer:', error);
        throw error;
      }
    }
  
    // Create a new customer
    async createCustomer(customerData) {
      try {
         // First check if a customer with this name already exists
        const existingCustomers = await this.getCustomers();
        const duplicate = existingCustomers.find(
          customer => customer.name.toLowerCase() === customerData.name.toLowerCase()
        );

        if (duplicate) {
          // Return the existing customer or throw an error
          return { 
            success: false, 
            message: 'Customer already exists', 
            existingCustomer: duplicate 
          };
        }

        const response = await fetch(`${this.apiBaseUrl}/customers.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Created customer:', data);
        return data;
      } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
      }
    }
  
    // Create a new work order
    async createWorkOrder(workOrderData) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/workorders.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workOrderData),
        });
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Created work order:', data);
        return data;
      } catch (error) {
        console.error('Error creating work order:', error);
        throw error;
      }
    }
    
    // Fetch work orders
    async getWorkOrders() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/workorders.php`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched work orders:', data);
        return data;
      } catch (error) {
        console.error('Error fetching work orders:', error);
        throw error;
      }
    }

    // Add vehicles to customer
    async addVehiclesToCustomer(customerId, vehicles) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/customers.php?id=${customerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vehicles }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Added vehicles to customer:', data);
        return data;
      } catch (error) {
        console.error('Error adding vehicles to customer:', error);
        throw error;
      }
    }

    // Save an inspection
    async saveInspection(inspection) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/inspections.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inspection),
        });
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Saved inspection:', data);
        return data;
      } catch (error) {
        console.error('Error saving inspection:', error);
        throw error;
      }
    }

    // Get a specific vehicle by ID
    async getVehicleById(vehicleId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/vehicles.php?id=${vehicleId}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched vehicle:', data);
        return data;
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        throw error;
      }
    }
    
    // Get inspections for a vehicle
    async getVehicleInspections(vehicleId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/inspections.php?vehicleId=${vehicleId}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched vehicle inspections:', data);
        return data;
      } catch (error) {
        console.error('Error fetching vehicle inspections:', error);
        throw error;
      }
    }

    // Get a specific inspection by ID
    async getInspection(inspectionId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/inspections.php?id=${inspectionId}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched inspection:', data);
        return data;
      } catch (error) {
        console.error('Error fetching inspection:', error);
        throw error;
      }
    }

    // Search for inspections by work order number
    async searchInspectionsByWorkOrder(workOrderNumber) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/inspections.php?workOrder=${workOrderNumber}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Found inspections by work order:', data);
        return data;
      } catch (error) {
        console.error('Error searching inspections by work order:', error);
        throw error;
      }
    }

    // Search for inspections by customer ID
    async searchInspectionsByCustomer(customerId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/inspections.php?customerId=${customerId}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Found inspections by customer:', data);
        return data;
      } catch (error) {
        console.error('Error searching inspections by customer:', error);
        throw error;
      }
    }

    // Search for inspections by date range
    async searchInspectionsByDate(startDate, endDate) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/inspections.php?startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Found inspections by date range:', data);
        return data;
      } catch (error) {
        console.error('Error searching inspections by date range:', error);
        throw error;
      }
    }

    // Search for inspections by technician ID
    async searchInspectionsByTechnician(technicianId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/inspections.php?technicianId=${technicianId}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Found inspections by technician:', data);
        return data;
      } catch (error) {
        console.error('Error searching inspections by technician:', error);
        throw error;
      }
    }

    // Get all inspections
    async getAllInspections() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/inspections.php`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched all inspections:', data);
        return data;
      } catch (error) {
        console.error('Error fetching all inspections:', error);
        throw error;
      }
    }
  }
  
  export default DatabaseService;