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
    }
    
    export default DatabaseService;
    
    